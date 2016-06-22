const AST = require('./ast');

const isValue = node => node instanceof AST.Abstraction;

const eval = (ast, context={}) => {
  while (true) {
    if (ast instanceof AST.Application) {
      if (isValue(ast.lhs) && isValue(ast.rhs)) {
        /**
         * if both sides of the application are values we can proceed and
         * actually rhs value to the param name and evaluate the lhs
         * abstraction's body
         */
        context[ast.lhs.param.name] = ast.rhs;
        ast = eval(ast.lhs.body, context);
      } else if (isValue(ast.lhs)) {
        /**
         * We should only evaluate rhs once lhs has been reduced to a value
         *
         * here we have to clone the context to prevent the bindings that might
         * be defined while evaluating the body of rhs from leaking to the top
         * context. This way, once we finish evaluating rhs we automatically
         * "pop" the child context, and resto the original context.
         */
        ast.rhs = eval(ast.rhs, Object.assign({}, context));
      } else {
        /**
         * Keep reducing lhs until it becomes a value
         */
        ast.lhs = eval(ast.lhs, context);
      }
    } else if (ast instanceof AST.Identifier) {
      /**
       * Once we find an identifier, we simply replace it with the appropriate
       * bound value.
       */
      ast = context[ast.name];
    } else {
      /**
        * `ast` is an abstraction, and therefore a value. That means we're done
        * reducing it, and this is the result of the current evaluation.
        */
      return ast;
    }
  }
};

exports.eval = eval;
