const Token = require('./token');

class Lexer {
  constructor(input) {
    this._input = input;
    this._index = 0;
    this._token = undefined;
    this._nextToken();
  }

  /**
   * Return the next char of the input or '\0' if we've reached the end
   */
  _nextChar() {
    if (this._index >= this._input.length) {
      return '\0';
    }

    return this._input[this._index++];
  }

  /**
   * Set this._token based on the remaining of the input
   *
   * This method is meant to be private, it doesn't return a token, just sets
   * up the state for the helper functions.
   */
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

      case '=':
        this._token = new Token(Token.EQ);
        break;

      case ';':
        this._token = new Token(Token.SEMI);
        break;

      case '\0':
        this._token = new Token(Token.EOF);
        break;

      default:
        if (this.matchString('true')) {
          this._token = new Token(Token.BOOLEAN_LITERAL, true);
        } else if (this.matchString('false')) {
          this._token = new Token(Token.BOOLEAN_LITERAL, false);
        } else if (this.matchString('let')) {
          this._token = new Token(Token.LET);
        } else if (this.matchString('if')) {
          this._token = new Token(Token.IF);
        } else if (this.matchString('then')) {
          this._token = new Token(Token.THEN);
        } else if (this.matchString('else')) {
          this._token = new Token(Token.ELSE);
        } else if (/[a-z]/.test(c)) {
          let str = '';
          do {
            str += c;
            c = this._nextChar();
          } while (/[a-zA-Z]/.test(c));

          // put back the last char which is not part of the identifier
          this._index--;

          this._token = new Token(Token.LCID, str);
        } else if (/[0-9]/.test(c)) {
          let str = '';
          do {
            str += c;
            c = this._nextChar();
          } while (/[0-9]/.test(c));

          // put back the last char which is not part of the identifier
          this._index--;

          this._token = new Token(Token.NUMERIC_LITERAL, parseInt(str, 10));
        } else {
          this.fail();
        }
    }
  }

  /**
   * Assert that the next token has the given type, return it, and skip to the
   * next token.
   */
  token(type) {
    if (!type) {
      return this._token.value;
    }

    const token = this._token;
    this.match(type);
    return token.value;
  }

  /**
   * Throw an unexpected token error - ideally this would print the source
   * location
   */
  fail() {
    throw new Error(`Unexpected token at offset ${this._index}`);
  }

  /**
   * Returns a boolean indicating whether the next token has the given type.
   */
  next(type) {
    return this._token.type == type;
  }

  /**
   * Assert that the next token has the given type and skip it.
   */
  match(type) {
    if (this.next(type)) {
      this._nextToken();
      return;
    }
    console.error(`${this._index}: Invalid token: Expected '${type}' found '${this._token.type}'`);
    throw new Error('Parse Error');
  }

  /**
   * Same as `next`, but skips the token if it matches the expected type.
   */
  skip(type) {
    if (this.next(type)) {
      this._nextToken();
      return true;
    }
    return false;
  }

  matchString(str) {
    const index = this._index - 1;
    let i = 0;
    for (; i < str.length; i++) {
      if (str[i] !== this._input[index+i]) {
        return false;
      }
    }
    if (/\w/.test(this._input[index+i])) {
      return false;
    }
    this._index += str.length - 1;
    return true;
  }
}

module.exports = Lexer;
