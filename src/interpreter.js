const AST = require('./ast');

const isValue = node => node instanceof AST.Abstraction;

const eval = (ast, context={}) => {
  while (true) {
    if (ast instanceof AST.Application) {
      if (isValue(ast.abstraction) && isValue(ast.value)) {
        context[ast.abstraction.param.name] = ast.value;
        ast = eval(ast.abstraction.body, context);
      } else if (isValue(ast.abstraction)) {
        ast.value = eval(ast.value, Object.assign({}, context));
      } else {
        ast.abstraction = eval(ast.abstraction, context);
      }
    } else if (ast instanceof AST.Identifier) {
       ast = context[ast.name];
    } else {
      return ast;
    }
  }
};

exports.eval = eval;
