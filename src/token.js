class Token {
  /**
   * type should be one of the valid token types list below, and value is an
   * optional value that can carry any extra information necessary for a given
   * token type. (e.g. the matched string for an identifier)
   */
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
};

[
  'EOF', // we augment the tokens with EOF, to indicate the end of the input.
  'LAMBDA',
  'LET',
  'IF',
  'THEN',
  'ELSE',
  'LPAREN',
  'RPAREN',
  'LCID',
  'DOT',
  'EQ',
  'SEMI',
  'BOOLEAN_LITERAL',
  'NUMERIC_LITERAL',
].forEach(token => Token[token] = token);

module.exports = Token;
