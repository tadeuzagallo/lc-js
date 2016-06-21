const AST = require('./ast');

const isValue = node => node instanceof AST.Abstraction;

const eval = (ast, context={}) => {
  while (true) {
    if (ast instanceof AST.Application) {
      if (isValue(ast.lhs) && isValue(ast.rhs)) {
        context[ast.lhs.param.name] = ast.rhs;
        ast = eval(ast.lhs.body, context);
      } else if (isValue(ast.lhs)) {
        ast.rhs = eval(ast.rhs, Object.assign({}, context));
      } else {
        ast.lhs = eval(ast.lhs, context);
      }
    } else if (ast instanceof AST.Identifier) {
       ast = context[ast.name];
    } else {
      return ast;
    }
  }
};

exports.eval = eval;
