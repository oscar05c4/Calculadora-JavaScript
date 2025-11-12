// model/Token.js

/** Define los tipos de símbolos (Terminales y No Terminales) */
// Eliminamos 'const' para que sean variables globales si no usamos módulos
// O, si usamos type="module" en el script, usaríamos 'export'
const Tokens = {
  // No Terminales (Non-Terminals)
  E: 'E',
  E_PRIME: 'Ep', // E'
  T: 'T',
  T_PRIME: 'Tp', // T'
  F: 'F',
  F_PRIME: 'Fp', // Nuevo: F' para manejar el porcentaje

  // Terminales (Terminals)
  PLUS: '+',
  MINUS: '-',
  MULTIPLY: '*',
  DIVIDE: '/',
  OPEN_PAREN: '(',
  CLOSE_PAREN: ')',
  NUMBER: 'num',
  PERCENT: '%', // NUEVO: Símbolo de porcentaje

  // Símbolos especiales
  LAMBDA: 'λ', // Cadena vacía (epsilon)
  EOF: '$'     // Fin de archivo/cadena
};

/** Lista de No Terminales para iteración */
let NonTerminals = [
  Tokens.E, Tokens.E_PRIME, Tokens.T, Tokens.T_PRIME, Tokens.F, Tokens.F_PRIME
];

/** Lista de Terminales para la tabla, incluyendo EOF */
let Terminals = [
  Tokens.PLUS, Tokens.MINUS, Tokens.MULTIPLY, Tokens.DIVIDE,
  Tokens.OPEN_PAREN, Tokens.CLOSE_PAREN, Tokens.NUMBER, Tokens.PERCENT, Tokens.EOF
];

const StartSymbol = Tokens.E; // Solo se declara una vez aquí

// Para hacer estas variables accesibles globalmente en un navegador sin módulos ES6:
// Es una práctica común asignarlas al objeto window
window.Tokens = Tokens;
window.NonTerminals = NonTerminals;
window.Terminals = Terminals;
window.StartSymbol = StartSymbol;
