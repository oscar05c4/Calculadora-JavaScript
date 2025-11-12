// analyzer/Parser.js
// Depende de Token.js, Grammar.js, LL1Table.js

class Parser {
  constructor(ll1Table, startSymbol) {
    this.table = ll1Table;
    this.startSymbol = startSymbol;
    this.stack = [];
    this.input = [];
    this.output = [];

    // Pila de valores para la evaluación (mantener, aunque la evaluación final usa eval)
    this.valueStack = [];
  }

  // Adaptador de léxico simple: simula la tokenización
  lex(expression) {
    // Reemplaza los números por el token 'num' para el parser LL(1)
    const tokenized = expression
      .replace(/\s+/g, '') // Elimina espacios
      .match(/(\d+(\.\d+)?|[\+\-\*\/\(\)]|\$)/g) || [];

    const stream = tokenized.map(t => {
      if (!isNaN(t)) {
        // Almacena el valor real del número para la evaluación
        return { type: Tokens.NUMBER, value: parseFloat(t) };
      }
      return { type: t, value: t };
    });

    if (stream[stream.length - 1]?.type !== Tokens.EOF) {
      stream.push({ type: Tokens.EOF, value: Tokens.EOF });
    }

    return stream;
  }

  // Se eliminó la lógica compleja de 'evaluate' basada en reducciones,
  // ya que la evaluación LL(1) es compleja y se sustituye con 'eval' al final.
  // Dejamos solo la acción de apilar valores para mantener la estructura.
  evaluate(action) {
    if (action.type === 'match' && action.symbol === Tokens.NUMBER) {
      this.valueStack.push(action.value);
    }
    // Otras acciones semánticas se ignoran, ya que usaremos eval() al final.
  }

  // Algoritmo LL(1) principal
  parse(expression) {
    this.input = this.lex(expression);
    this.stack = [Tokens.EOF, this.startSymbol];
    this.output = [];
    this.valueStack = [];
    let inputPointer = 0;

    while (this.stack.length > 0) {
      const X = this.stack[this.stack.length - 1]; // Cima de la pila
      const a = this.input[inputPointer].type;     // Lookahead
      const a_value = this.input[inputPointer].value;

      this.output.push({
        // La pila se invierte aquí para mostrarla en el orden correcto (cima a la derecha)
        stack: [...this.stack].reverse().join(' '),
        input: this.input.slice(inputPointer).map(t => t.value).join(' '),
        action: ''
      });

      // 1. COTEJO (Match): X es Terminal y X == a
      if (!NonTerminals.includes(X)) {
        if (X === a) {
          if (X === Tokens.EOF) {
            this.output[this.output.length - 1].action = 'ACCEPT';
            break; // Aceptación final
          }

          this.stack.pop();
          inputPointer++;
          this.output[this.output.length - 1].action = `Match ${X}`;

          this.evaluate({ type: 'match', symbol: X, value: a_value });

        } else {
          // X es Terminal, pero X != a (Error)
          return {
            success: false,
            error: `Error de sintaxis: Se esperaba '${X}' pero se encontró '${a}' en la posición ${inputPointer}.`,
            trace: this.output // 🟢 IMPORTANTE: Incluir la traza en el error
          };
        }
      }
      // 2. EXPANSIÓN (Expand): X es No Terminal
      else {
        const entry = this.table[X][a];

        if (entry) {
          // Si hay una producción: X -> alpha
          this.stack.pop();
          const alpha = entry.rhs;

          if (alpha[0] !== Tokens.LAMBDA) {
            // Empujar alpha a la pila en orden inverso
            for (let i = alpha.length - 1; i >= 0; i--) {
              this.stack.push(alpha[i]);
            }
          }

          this.output[this.output.length - 1].action = `Reducción: ${entry.prod} (${entry.ruleIndex})`;
          // No hay llamadas a evaluate aquí porque la evaluación basada en reducciones de una gramática LL(1)
          // requiere pasos adicionales que no están implementados (como la pila de valores separada para atributos).
        } else {
          // No hay entrada en la tabla (Error)
          return {
            success: false,
            error: `Error de sintaxis: No hay regla para [${X}, ${a}] en la tabla LL(1) en la posición ${inputPointer}.`,
            trace: this.output // 🟢 IMPORTANTE: Incluir la traza en el error
          };
        }
      }
    }

    // Evaluación final: Usamos la función nativa JS eval() para calcular el resultado.
    try {
      // Reemplaza 'num' por su valor real en la expresión tokenizada para que eval() funcione.
      const rawExpression = this.input.map(t => t.type === Tokens.NUMBER ? t.value : t.value).join('').replace(/\$/g, '');
      const finalResult = eval(rawExpression);

      return { success: true, trace: this.output, result: finalResult };

    } catch (e) {
      return {
        success: false,
        error: `Error durante la evaluación de la expresión: ${e.message}`,
        trace: this.output // 🟢 IMPORTANTE: Incluir la traza en el error de evaluación
      };
    }
  }
}
