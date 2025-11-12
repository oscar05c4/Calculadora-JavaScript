// analyzer/Parser.js
// Depende de Token.js, Grammar.js, LL1Table.js

class Parser {
  constructor(ll1Table, startSymbol) {
    this.table = ll1Table;
    this.startSymbol = startSymbol;
    this.stack = [];
    this.input = [];
    this.output = [];

    // Pila de valores para la evaluación (mantener)
    this.valueStack = [];
  }

  // Adaptador de léxico simple: simula la tokenización
  lex(expression) {
    // 🟢 MODIFICACIÓN: Incluir '%' en la regex para tokenización
    const tokenized = expression
      .replace(/\s+/g, '') // Elimina espacios
      .match(/(\d+(\.\d+)?|[\+\-\*\/\%\(\)]|\$)/g) || [];

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

  // Se mantiene el método evaluate solo para registrar los números en el stack.
  evaluate(action) {
    if (action.type === 'match' && action.symbol === Tokens.NUMBER) {
      this.valueStack.push(action.value);
    }
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
            trace: this.output
          };
        }
      }
      // 2. EXPANSIÓN (Expand): X es No Terminal
      else {
        const entry = this.table[X] ? this.table[X][a] : null;

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
        } else {
          // No hay entrada en la tabla (Error)
          return {
            success: false,
            error: `Error de sintaxis: No hay regla para [${X}, ${a}] en la tabla LL(1) en la posición ${inputPointer}.`,
            trace: this.output
          };
        }
      }
    }

    // 🟢 EVALUACIÓN FINAL: Manejo del porcentaje
    try {
      let expressionString = this.input.map(t => {
        if (t.type === Tokens.NUMBER) {
          // Devolver el valor numérico real
          return t.value.toString();
        }
        if (t.type === Tokens.PERCENT) {
          // Reemplazar '%' con '/ 100' para que eval() lo interprete como división por 100
          return '/ 100';
        }
        if (t.type === Tokens.EOF) {
          return ''; // Ignorar $
        }
        // Devolver el símbolo del operador o paréntesis
        return t.value;
      }).join('');

      const finalResult = eval(expressionString);

      return { success: true, trace: this.output, result: finalResult };

    } catch (e) {
      return {
        success: false,
        error: `Error durante la evaluación de la expresión: ${e.message}. Asegúrese de que la expresión esté bien formada.`,
        trace: this.output
      };
    }
  }
}
