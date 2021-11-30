class Abstraction {
  /**
   * param here is the name of the variable of the abstraction. Body is the
   * subtree  representing the body of the abstraction.
   */
  constructor(param, body) {
    this.param = param;
    this.body = body;
  }

  toString(ctx=[]) {
    return `(λ${this.param}. ${this.body.toString([this.param].concat(ctx))})`;
  }
}

class Application {
  /**
   * (lhs rhs) - left-hand side and right-hand side of an application.
   */
  constructor(lhs, rhs) {
    this.lhs = lhs;
    this.rhs = rhs;
  }

  toString(ctx) {
    return `${this.lhs.toString(ctx)} ${this.rhs.toString(ctx)}`;
  }
}

class Identifier {
  /**
   * name is the string matched for this identifier.
   */
  constructor(value) {
    this.value = value;
  }

  toString(ctx) {
    return ctx[this.value];
  }
}

class BooleanLiteral {
  /**
   * value contains the JavaScript boolean value true or false
   */
  constructor(value) { this.value = value;
  }

  toString() {
    return this.value.toString();
  }
}

class NumericLiteral {
  /**
   * value contains a JavaScript number
   */
  constructor(value) {
    this.value = value;
  }

  toString() {
    return this.value.toString();
  }
}

class Let {
  /**
   * name is the identifier that will be used to refer to `term`
   */
  constructor(name, term) {
    this.name = name;
    this.term = term;
  }

  toString(ctx) {
    return `let ${this.name} = ${this.term.toString([this.name].concat(ctx))};`;
  }
}

class If {
  constructor(condition, consequent, alternate) {
    this.condition = condition;
    this.consequent = consequent;
    this.alternate = alternate;
  }

  toString(ctx) {
    const consequent = `if ${this.condition.toString(ctx)} then ${this.consequent.toString(ctx)}`;
    const alternate = this.alternate
      ? ` else ${this.alternate.toString(ctx)}`
      : '';
    return consequent + alternate;
  }
}

class Program {
  constructor(decls) {
    this.decls = decls;
  }

  toString() {
    const ctx = [];
    return this.decls.map(d => {
      const str = d.toString(ctx);
      if (d instanceof Let)  ctx.unshift(d.name);
      return str;
    }).join('\n');
  }
}

module.exports = {
  Abstraction,
  Application,
  Identifier,
  BooleanLiteral,
  NumericLiteral,
  Let,
  If,
  Program,
};
