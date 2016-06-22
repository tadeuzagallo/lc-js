class Abstraction {
  /**
   * param here is the name of the variable of the abstraction. Body is the
   * subtree  representing the body of the abstraction.
   */
  constructor(param, body) {
    this.param = param;
    this.body = body;
  }

  toString() {
    return `(λ${this.param.toString()}. ${this.body.toString()})`;
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

  toString() {
    return `${this.lhs.toString()} ${this.value.toString()}`;
  }
}

class Identifier {
  /**
   * name is the string matched for this identifier.
   */
  constructor(name) {
    this.name = name;
  }

  toString() {
    return this.name;
  }
}

exports.Abstraction = Abstraction;
exports.Application = Application;
exports.Identifier = Identifier;
