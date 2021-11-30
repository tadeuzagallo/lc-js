const AST = require('./ast');
const Token = require('./token');

class Parser {
  constructor(lexer) {
    this.lexer = lexer;
  }

  parse() {
    const program = this.program();

    // make sure we consumed all the program, otherwise there was a syntax error
    this.lexer.match(Token.EOF);

    return program;
  }

  // Program ::= Declaration SEMI Program
  //           | Declaration
  //           | ε
  program() {
    const decls = [];
    let ctx = [];
    while (!this.lexer.skip(Token.EOF)) {
      const [ctx_, decl] = this.declaration(ctx);
      decls.push(decl);
      ctx = ctx_;
      if (!this.lexer.skip(Token.SEMI)) {
        break;
      }
    }
    return new AST.Program(decls);
  }

  // Declaration ::= LET LCID EQ Term
  //               | Term
  declaration(ctx) {
    if (this.lexer.skip(Token.LET)) {
      const name = this.lexer.token(Token.LCID);
      this.lexer.match(Token.EQ);
      const term = this.term(ctx);
      return [[name].concat(ctx), new AST.Let(name, term)];
    } else {
      return [ctx, this.term(ctx)];
    }
  }

  // term ::= LAMBDA LCID DOT term
  //        | application
  term(ctx) {
    if (this.lexer.skip(Token.LAMBDA)) {
      const id = this.lexer.token(Token.LCID);
      this.lexer.match(Token.DOT);
      const term = this.term([id].concat(ctx));
      return new AST.Abstraction(id, term);
    }  else {
      return this.application(ctx);
    }
  }

  // application ::= atom application'
  application(ctx) {
    let lhs = this.atom(ctx);

    // application' ::= atom application'
    //                | ε
    while (true) {
      const rhs = this.atom(ctx);
      if (!rhs) {
        return lhs;
      } else {
        lhs = new AST.Application(lhs, rhs);
      }
    }
  }

  // atom ::= LPAREN term RPAREN
  //        | LCID
  //        | Literal
  atom(ctx) {
    if (this.lexer.next(Token.IF)) {
      return this.if(ctx);
    } else if (this.lexer.skip(Token.LPAREN)) {
      const term = this.term(ctx);
      this.lexer.match(Token.RPAREN);
      return term;
    } else if (this.lexer.next(Token.LCID)) {
      const id = this.lexer.token(Token.LCID)
      return new AST.Identifier(ctx.indexOf(id));
    } else {
      return this.literal();
    }
  }

  // If ::= IF Term THEN Term
  //      | IF Term THEN Term ELSE Term
  if(ctx) {
    this.lexer.match(Token.IF);
    const condition = this.term(ctx);
    this.lexer.match(Token.THEN);
    const consequent = this.term(ctx);
    const alternate = this.lexer.skip(Token.ELSE)
      ? this.term(ctx)
      : null;
    return new AST.If(condition, consequent, alternate)
  }

  // Literal ::= BOOLEAN_LITERAL
  //           | NUMERIC_LITERAL
  literal() {
    if (this.lexer.next(Token.BOOLEAN_LITERAL)) {
      const bool = this.lexer.token(Token.BOOLEAN_LITERAL);
      return new AST.BooleanLiteral(bool);
    } else if (this.lexer.next(Token.NUMERIC_LITERAL)) {
      const number = this.lexer.token(Token.NUMERIC_LITERAL);
      return new AST.NumericLiteral(number);
    }
  }
}

module.exports = Parser;
