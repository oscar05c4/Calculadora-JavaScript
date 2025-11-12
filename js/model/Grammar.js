// model/Grammar.js
// Depende de Token.js (que ya globaliza Tokens, NonTerminals, etc.)

/** Estructura de una Producción: [NoTerminal, [Símbolo1, Símbolo2, ...]] */
let Grammar = [
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

  // F -> ( E ) F'
  [Tokens.F, [Tokens.OPEN_PAREN, Tokens.E, Tokens.CLOSE_PAREN, Tokens.F_PRIME]],
  // F -> num F'
  [Tokens.F, [Tokens.NUMBER, Tokens.F_PRIME]],

  // F' -> % F'
  [Tokens.F_PRIME, [Tokens.PERCENT, Tokens.F_PRIME]],
  // F' -> λ
  [Tokens.F_PRIME, [Tokens.LAMBDA]]
];

// Para hacer Grammar accesible globalmente
window.Grammar = Grammar;
