const AST = require('./ast');

const isValue = node =>
  node instanceof AST.Abstraction ||
  node instanceof AST.NumericLiteral ||
  node instanceof AST.BooleanLiteral;

const eval1 = ast => {
  while (true) {
    if (ast instanceof AST.Application) {
      if (isValue(ast.lhs) && isValue(ast.rhs)) {
        /**
         * if both sides of the application are values we can proceed and
         * substitute the rhs value for the variables that reference the
         * abstraction's parameter in the evaluation body and then evaluate the
         * abstraction's body
         */
        ast = substitute(ast.rhs, ast.lhs.body);
      } else if (isValue(ast.lhs)) {
        /**
         * We should only evaluate rhs once lhs has been reduced to a value
         */
        ast.rhs = eval1(ast.rhs);
      } else {
        /**
         * Keep reducing lhs until it becomes a value
         */
        ast.lhs = eval1(ast.lhs);
      }
    } else if (ast instanceof AST.If) {
      const condition = eval1(ast.condition);
      if (!(condition instanceof AST.BooleanLiteral)) {
        throw new Error('Expected if condition to be a boolean', condition);
      }
      ast = eval1(condition.value ? ast.consequent : ast.alternate);
    } else if (isValue(ast)) {
      /**
       * * `ast` is a value, and therefore an abstraction. That means we're done
        * reducing it, and this is the result of the current evaluation.
        */
      return ast;
    }
  }
}

const eval = (ast) => {
  console.assert(ast instanceof AST.Program);
  let ctx = [];
  let { decls } = ast;
  while (decls.length) {
    const decl = decls.shift();
    if (decl instanceof AST.Let) {
      const value = eval1(decl.term);
      let depth = 0;
      decls = decls.map(d => {
        let v = substitute(value, d, depth);
        if (d instanceof AST.Let) depth++;
        return v;
      });
      ctx.unshift(decl.name);
    } else {
      console.log(eval1(decl).toString(ctx));
    }
  }
};

const traverse = fn =>
  function(node, ...args) {
    const config = fn(...args);
    if (node instanceof AST.Application)
      return config.Application(node);
    else if (node instanceof AST.Abstraction)
      return config.Abstraction(node);
    else if (node instanceof AST.Identifier)
      return config.Identifier(node);
    else if (node instanceof AST.If)
      return config.If(node);
    else if (node instanceof AST.Let)
      return config.Let(node);
    else return node;
  }

const shift = (by, node, from) => {
  const aux = traverse(from => ({
    Application(app) {
      return new AST.Application(
        aux(app.lhs, from),
        aux(app.rhs, from)
      );
    },
    Abstraction(abs) {
      return new AST.Abstraction(
        abs.param,
        aux(abs.body, from + 1)
      );
    },
    Identifier(id) {
      return new AST.Identifier(
        id.value + (id.value >= from ? by : 0)
      );
    },
    If(if_) {
      return new AST.If(
        aux(if_.condition, from),
        aux(if_.consequent, from),
        aux(if_.alternate, from)
      );
    },
    Let(let_) {
      return new AST.Let(
        let_.name,
        aux(let_.term, from)
      );
    },
  }));
  return aux(node, from);
};

const subst = (value, node, from) => {
  const aux = traverse(depth => ({
    Application(app) {
      return new AST.Application(
        aux(app.lhs, depth),
        aux(app.rhs, depth)
      );
    },
    Abstraction(abs) {
      return new AST.Abstraction(
        abs.param,
        aux(abs.body, depth + 1)
      );
    },
    Identifier(id) {
      if (depth === id.value)
        return shift(depth, value);
      else
        return id;
    },
    If(if_) {
      return new AST.If(
        aux(if_.condition, depth),
        aux(if_.consequent, depth),
        aux(if_.alternate, depth)
      );
    },
    Let(let_) {
      return new AST.Let(
        let_.name,
        aux(let_.term, depth)
      );
    },
  }));
  return aux(node, from);
};

const substitute = (value, node, from=0) => {
  return shift(-1, subst(shift(1, value, from), node, from), from);
};

exports.eval = eval;
