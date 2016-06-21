const Lexer = require('./src/lexer');
const Parser = require('./src/parser');
const Interpreter = require('./src/interpreter');

const fs = require('fs');

let filename;
let printAST = false;
if (process.argv[2] === 'ast') {
  printAST = true;
  filename = process.argv[3];
} else {
  filename = process.argv[2];
}

const source = fs.readFileSync(filename).toString();

const lexer = new Lexer(source);
const parser = new Parser(lexer);
const ast = parser.parse();

if (printAST) {
  console.log(ast);
} else {
  console.log(Interpreter.eval(ast).toString());
}
