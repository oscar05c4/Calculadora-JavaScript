// analyzer/LL1Table.js
// Depende de Token.js, Grammar.js, FirstFollow.js

class LL1Table {
  // Aceptamos la instancia completa de FirstFollow, que ya tiene los sets calculados.
  constructor(grammar, nonTerminals, terminals, ffInstance) {
    this.grammar = grammar;
    this.nonTerminals = nonTerminals;
    this.terminals = terminals;

    // Almacenar los conjuntos y la instancia para acceder a sus métodos
    this.FIRST = ffInstance.FIRST;
    this.FOLLOW = ffInstance.FOLLOW;
    this.ff = ffInstance; // Guardamos la instancia para usar calculateFirstAlpha y hasLambda
    this.table = {};

    // Inicializar la tabla
    this.nonTerminals.forEach(NT => {
      this.table[NT] = {};
      this.terminals.forEach(T => {
        this.table[NT][T] = null; // null indica celda vacía/error
      });
    });
  }

  // Construye la tabla LL(1)
  buildTable() {

    this.grammar.forEach((production, index) => {
      const A = production[0]; // No Terminal
      const alpha = production[1]; // Cuerpo de la producción (Right Hand Side)
      const prodString = `${A} -> ${alpha.join(' ')}`;

      // Usamos la instancia ff guardada para calcular FIRST(alpha)
      const firstAlpha = this.ff.calculateFirstAlpha(alpha);

      // Regla 1: Para cada terminal 'a' en FIRST(alpha)
      firstAlpha.forEach(a => {
        if (a !== Tokens.LAMBDA) {

          // Verificar que 'a' es un terminal de la tabla inicializada
          if (!this.table[A].hasOwnProperty(a)) {
            console.warn(`Símbolo inesperado (${a}) en FIRST, omitiendo.`);
            return;
          }

          if (this.table[A][a] !== null) {
            console.error(`¡Advertencia! Conflicto LL(1) en Tabla[${A}, ${a}]`);
          }
          this.table[A][a] = { prod: prodString, ruleIndex: index + 1, rhs: alpha };
        }
      });

      // Regla 2: Si lambda pertenece a FIRST(alpha)
      if (this.ff.hasLambda(firstAlpha)) {
        // Para cada terminal 'b' en FOLLOW(A)
        this.FOLLOW[A].forEach(b => {

          // Verificar que 'b' es un terminal de la tabla inicializada
          if (!this.table[A].hasOwnProperty(b)) {
            console.warn(`Símbolo inesperado (${b}) en FOLLOW, omitiendo.`);
            return;
          }

          if (this.table[A][b] !== null) {
            console.error(`¡Advertencia! Conflicto LL(1) en Tabla[${A}, ${b}]`);
          }
          this.table[A][b] = { prod: prodString, ruleIndex: index + 1, rhs: alpha };
        });
      }
    });

    return this.table;
  }

  // Devuelve la tabla en un formato amigable para imprimir
  getFormattedTable() {
    const header = ['NT', ...this.terminals];
    const rows = [];

    this.nonTerminals.forEach(NT => {
      const row = [NT];
      this.terminals.forEach(T => {
        const entry = this.table[NT][T];
        row.push(entry ? `(${entry.ruleIndex}) ${entry.rhs.join(' ')}` : '');
      });
      rows.push(row);
    });

    return { header, rows };
  }
}
