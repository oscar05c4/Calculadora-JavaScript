// model/Grammar.js
// Depende de Token.js

/** Estructura de una Producción: [NoTerminal, [Símbolo1, Símbolo2, ...]] */
const Grammar = [
  // E -> T E'
  [Tokens.E, [Tokens.T, Tokens.E_PRIME]],

  // E' -> + T E'
  [Tokens.E_PRIME, [Tokens.PLUS, Tokens.T, Tokens.E_PRIME]],
  // E' -> - T E'
  [Tokens.E_PRIME, [Tokens.MINUS, Tokens.T, Tokens.E_PRIME]],
  // E' -> λ
  [Tokens.E_PRIME, [Tokens.LAMBDA]],

  // T -> F T'
  [Tokens.T, [Tokens.F, Tokens.T_PRIME]],

  // T' -> * F T'
  [Tokens.T_PRIME, [Tokens.MULTIPLY, Tokens.F, Tokens.T_PRIME]],
  // T' -> / F T'
  [Tokens.T_PRIME, [Tokens.DIVIDE, Tokens.F, Tokens.T_PRIME]],
  // T' -> λ
  [Tokens.T_PRIME, [Tokens.LAMBDA]],

  // F -> ( E )
  [Tokens.F, [Tokens.OPEN_PAREN, Tokens.E, Tokens.CLOSE_PAREN]],
  // F -> num
  [Tokens.F, [Tokens.NUMBER]]
];

const StartSymbol = Tokens.E;
