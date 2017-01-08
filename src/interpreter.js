const AST = require('./ast');

const isValue = node => node instanceof AST.Abstraction;

const eval = ast => {
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
        ast.rhs = eval(ast.rhs);
      } else {
        /**
         * Keep reducing lhs until it becomes a value
         */
        ast.lhs = eval(ast.lhs);
      }
    } else if (isValue(ast)) {
      /**
       * * `ast` is a value, and therefore an abstraction. That means we're done
        * reducing it, and this is the result of the current evaluation.
        */
      return ast;
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
  }

const shift = (by, node) => {
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
    }
  }));
  return aux(node, 0);
};

const subst = (value, node) => {
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
    }
  }));
  return aux(node, 0);
};

const substitute = (value, node) => {
  return shift(-1, subst(shift(1, value), node));
};

exports.eval = eval;
