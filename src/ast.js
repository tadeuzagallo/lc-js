class Abstraction {
  constructor(param, body) {
    this.param = param;
    this.body = body;
  }

  toString() {
    return `(λ${this.param.toString()}. ${this.body.toString()})`;
  }
}

class Application {
  constructor(lhs, rhs) {
    this.lhs = lhs;
    this.rhs = rhs;
  }

  toString() {
    return `${this.lhs.toString()} ${this.value.toString()}`;
  }
}

class Identifier {
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
