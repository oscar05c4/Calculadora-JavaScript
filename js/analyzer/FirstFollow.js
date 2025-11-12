// analyzer/FirstFollow.js
// Depende de Token.js, Grammar.js

class FirstFollow {
  constructor(grammar, nonTerminals, terminals) {
    this.grammar = grammar;
    this.nonTerminals = nonTerminals;
    this.terminals = terminals;
    this.FIRST = {};
    this.FOLLOW = {};
  }

  // Inicializa los conjuntos FIRST y FOLLOW para cada No Terminal
  initializeSets() {
    this.nonTerminals.forEach(NT => {
      this.FIRST[NT] = new Set();
      this.FOLLOW[NT] = new Set();
    });
  }

  // Devuelve true si un símbolo es No Terminal
  isNonTerminal(symbol) {
    return this.FIRST.hasOwnProperty(symbol);
  }

  // Verifica si un conjunto contiene LAMBDA (λ)
  hasLambda(set) {
    return set.has(Tokens.LAMBDA);
  }

  // Calcula el conjunto FIRST de una secuencia de símbolos (alpha)
  calculateFirstAlpha(alpha) {
    let firstAlpha = new Set();
    let canDeriveLambda = true;

    for (const symbol of alpha) {
      if (symbol === Tokens.LAMBDA) {
        firstAlpha.add(Tokens.LAMBDA);
        break;
      }

      if (!this.isNonTerminal(symbol)) {
        // Símbolo Terminal: Añadir y detener
        firstAlpha.add(symbol);
        canDeriveLambda = false;
        break;
      } else {
        // Símbolo No Terminal (NT)
        let firstOfSymbol = this.FIRST[symbol];

        // Añade todos los símbolos de FIRST[NT] (excluyendo lambda)
        firstOfSymbol.forEach(term => {
          if (term !== Tokens.LAMBDA) {
            firstAlpha.add(term);
          }
        });

        // Si el NT no produce lambda, terminamos la propagación
        if (!this.hasLambda(firstOfSymbol)) {
          canDeriveLambda = false;
          break;
        }
      }
    }

    // Si todos los símbolos en alpha derivaron lambda, añadir lambda a FIRST(alpha)
    if (canDeriveLambda) {
      firstAlpha.add(Tokens.LAMBDA);
    }

    return firstAlpha;
  }

  // Algoritmo principal para calcular FIRST
  calculateFirst() {
    this.initializeSets();
    let changed = true;

    while (changed) {
      changed = false;

      this.grammar.forEach(([NT, alpha]) => {
        const oldSize = this.FIRST[NT].size;

        // Calcular FIRST(alpha)
        const firstAlpha = this.calculateFirstAlpha(alpha);

        // Propagar FIRST(alpha) a FIRST(NT)
        firstAlpha.forEach(term => this.FIRST[NT].add(term));

        if (this.FIRST[NT].size !== oldSize) {
          changed = true;
        }
      });
    }
    return this.FIRST;
  }

  // Algoritmo principal para calcular FOLLOW
  calculateFollow(startSymbol) {
    // Regla 1: $ está en FOLLOW(S)
    this.FOLLOW[startSymbol].add(Tokens.EOF);
    let changed = true;

    while (changed) {
      changed = false;

      this.grammar.forEach(([A, alpha]) => {
        let currentFollow = this.FOLLOW[A]; // FOLLOW de la cabeza (LHS)

        for (let i = 0; i < alpha.length; i++) {
          const B = alpha[i];

          if (!this.isNonTerminal(B)) continue;

          const oldSize = this.FOLLOW[B].size;

          // Símbolo beta (el resto de la producción: alpha[i+1...])
          const beta = alpha.slice(i + 1);

          if (beta.length > 0) {
            // Regla 3.1 & 3.2: FOLLOW(B) = FIRST(beta)
            const firstBeta = this.calculateFirstAlpha(beta);

            // Añadir FIRST(beta) excluyendo lambda
            firstBeta.forEach(term => {
              if (term !== Tokens.LAMBDA) {
                this.FOLLOW[B].add(term);
              }
            });

            // Si FIRST(beta) contiene lambda (Regla 3.2), propagar FOLLOW(A)
            if (this.hasLambda(firstBeta)) {
              currentFollow.forEach(term => this.FOLLOW[B].add(term));
            }
          } else {
            // Regla 2: B es el último símbolo. FOLLOW(B) = FOLLOW(A)
            currentFollow.forEach(term => this.FOLLOW[B].add(term));
          }

          if (this.FOLLOW[B].size !== oldSize) {
            changed = true;
          }
        }
      });
    }
    return this.FOLLOW;
  }

  // Metodo principal para ejecutar y devolver resultados en formato legible
  getResults(startSymbol) {
    this.calculateFirst();
    this.calculateFollow(startSymbol);

    const formatSet = (set) => `{${Array.from(set).join(', ')}}`;

    let firstOutput = {};
    let followOutput = {};

    this.nonTerminals.forEach(NT => {
      firstOutput[NT] = formatSet(this.FIRST[NT]);
      followOutput[NT] = formatSet(this.FOLLOW[NT]);
    });

    return { FIRST: firstOutput, FOLLOW: followOutput };
  }
}
