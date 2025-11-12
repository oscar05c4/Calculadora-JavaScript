// model/Token.js

/** Define los tipos de símbolos (Terminales y No Terminales) */
const Tokens = {
  // No Terminales (Non-Terminals)
  E: 'E',
  E_PRIME: 'Ep',
  T: 'T',
  T_PRIME: 'Tp',
  F: 'F',

  // Terminales (Terminals)
  PLUS: '+',
  MINUS: '-',
  MULTIPLY: '*',
  DIVIDE: '/',
  OPEN_PAREN: '(',
  CLOSE_PAREN: ')',
  NUMBER: 'num', // Token para cualquier número (ej. 5, 10.5)

  // Símbolos especiales
  LAMBDA: 'λ', // Cadena vacía (epsilon)
  EOF: '$'     // Fin de archivo/cadena
};

/** Lista de No Terminales para iteración */
const NonTerminals = [
  Tokens.E, Tokens.E_PRIME, Tokens.T, Tokens.T_PRIME, Tokens.F
];

/** Lista de Terminales para la tabla, incluyendo EOF */
const Terminals = [
  Tokens.PLUS, Tokens.MINUS, Tokens.MULTIPLY, Tokens.DIVIDE,
  Tokens.OPEN_PAREN, Tokens.CLOSE_PAREN, Tokens.NUMBER, Tokens.EOF
];
