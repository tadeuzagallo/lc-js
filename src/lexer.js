const Token = require('./token');

class Lexer {
  constructor(input) {
    this._input = input;
    this._index = 0;
    this._token = undefined;
    this._nextToken();
  }

  _nextChar() {
    if (this._index >= this._input.length) {
      return '\0';
    }

    return this._input[this._index++];
  }

  _nextToken() {
    let c;
    do {
      c = this._nextChar();
    } while (/\s/.test(c));

    switch (c) {
      case 'λ':
      case '\\':
        this._token = new Token(Token.LAMBDA);
        break;

      case '.':
        this._token = new Token(Token.DOT);
        break;

      case '(':
        this._token = new Token(Token.LPAREN);
        break;

      case ')':
        this._token = new Token(Token.RPAREN);
        break;

      case '\0':
        this._token = new Token(Token.EOF);
        break;
      
      default:
        if (/[a-z]/.test(c)) {
          let str = '';
          do {
            str += c;
            c = this._nextChar();
          } while (/[a-zA-Z]/.test(c));

          // put back the last char which is not part of the identifier
          this._index--;

          this._token = new Token(Token.LCID, str);
        } else {
          this.fail();
        }
    }
  }

  token(type) {
    if (!type) {
      return this._token;
    }

    if (this.next(type)) {
      const token = this._token;
      this._nextToken();
      return token;
    }
    this.fail();
  }

  fail() {
    throw new Error(`Unexpected token at offset ${this._index}`);
  }

  next(type) {
    return this._token.type == type;
  }

  match(type) {
    if (this.next(type)) {
      this._nextToken();
      return;
    }
    console.error(`${this._index}: Invalid token: Expected '${type}' found '${this.token().type}'`);
    throw new Error('Parse Error');
  }

  skip(type) {
    if (this.next(type)) {
      this._nextToken();
      return true;
    }
    return false;
  }
}

module.exports = Lexer;
