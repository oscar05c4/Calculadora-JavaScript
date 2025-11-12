// app/App.js
// Depende de todas las clases. Esta es la nueva clase controladora del DOM.

// Función de utilidad para renderizar conjuntos (PRI/SIG)
function renderSets(title, data) {
  let html = `<h2>${title}</h2><table><tr><th>No Terminal</th><th>Conjunto</th></tr>`;
  for (const NT in data) {
    html += `<tr><td>${NT}</td><td>${data[NT]}</td></tr>`;
  }
  html += '</table>';
  return html;
}

// Función de utilidad para renderizar la tabla LL(1)
function renderTable(data) {
  const header = data.header;
  const rows = data.rows;

  let html = '<h2>Tabla de Análisis Sintáctico LL(1)</h2><table><thead><tr>';
  header.forEach(h => {
    html += `<th>${h}</th>`;
  });
  html += '</tr></thead><tbody>';

  rows.forEach(row => {
    html += '<tr>';
    row.forEach(cell => {
      html += `<td>${cell}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

// Función para renderizar la traza (con manejo de traza nula)
function renderTrace(trace) {
  if (!trace || trace.length === 0) return '<p>No se pudo generar traza o el análisis falló en la primera etapa.</p>';

  let html = '<table><thead><tr><th>#</th><th>Pila</th><th>Entrada Restante</th><th>Acción</th></tr></thead><tbody>';

  trace.forEach((step, index) => {
    html += `<tr>
            <td>${index + 1}</td>
            <td style="text-align: left;">${step.stack}</td>
            <td style="text-align: left;">${step.input}</td>
            <td style="text-align: left;">${step.action}</td>
        </tr>`;
  });
  html += '</tbody></table>';
  return html;
}


// Función principal de ejecución (llamada desde el botón)
function runAnalyzer() {
  const expressionInput = document.getElementById('inputExpression');
  const expression = expressionInput.value.trim();

  const grammarOutput = document.getElementById('grammarOutput');
  const firstFollowOutput = document.getElementById('firstFollowOutput');
  const tableOutput = document.getElementById('tableOutput');
  const analysisOutput = document.getElementById('analysisOutput');
  const traceOutput = document.getElementById('traceOutput');

  // 1. Control de inicio limpio: Si el campo está vacío, solo mostrar mensaje.
  if (!expression) {
    // Limpiar las áreas de tablas si ya habían sido mostradas
    grammarOutput.innerHTML = '';
    firstFollowOutput.innerHTML = '';
    tableOutput.innerHTML = '';

    analysisOutput.innerHTML = '<p>Por favor, ingrese una expresión para analizar y haga clic en Analizar.</p>';
    traceOutput.innerHTML = '';
    return;
  }

  // 2. Control de finalización de la expresión: Debe terminar en $
  if (expression.slice(-1) !== Tokens.EOF) {
    console.error("Input Error: The expression must end with $ (e.g., 1 + 2 $)");
    analysisOutput.innerHTML = '<p class="error">Error: La expresión debe terminar en $</p>';
    traceOutput.innerHTML = '';
    return;
  }

  // 🟢 PASO CLAVE: Si la entrada es válida, primero generamos y mostramos las tablas

  // A. Mostrar Gramática
  grammarOutput.innerHTML = `<h2>Gramática Implementada</h2><pre>${
    Grammar.map(p => p[0] + ' -> ' + p[1].join(' ')).join('\n')
  }</pre>`;

  // B. Obtener PRI y SIG
  const ff = new FirstFollow(Grammar, NonTerminals, Terminals);
  const ffResults = ff.getResults(StartSymbol);

  firstFollowOutput.innerHTML = `
        <div class="first-follow-container">
            <div>${renderSets('Conjunto PRIMEROS (FIRST)', ffResults.FIRST)}</div>
            <div>${renderSets('Conjunto SIGUIENTES (FOLLOW)', ffResults.FOLLOW)}</div>
        </div>
    `;

  // C. Generar Tabla LL(1)
  const ll1TableGenerator = new LL1Table(
    Grammar,
    NonTerminals,
    Terminals,
    ff
  );
  ll1TableGenerator.buildTable();
  const tableData = ll1TableGenerator.getFormattedTable();
  tableOutput.innerHTML = renderTable(tableData);


  // 3. Ejecutar el Analizador
  const parser = new Parser(ll1TableGenerator.table, StartSymbol);
  const result = parser.parse(expression);

  // 4. Mostrar Resultados y Traza
  if (result.success) {
    analysisOutput.innerHTML = `
            <p class="success">RECONOCIMIENTO EXITOSO (Aceptada)</p>
            <p><strong>Resultado de la Operación:</strong> ${result.result}</p>
        `;
    traceOutput.innerHTML = '<h3>Traza del Analizador</h3>' + renderTrace(result.trace);
  } else {
    analysisOutput.innerHTML = `
            <p class="error">RECONOCIMIENTO FALLIDO</p>
            <p><strong>Error de Sintaxis:</strong> ${result.error}</p>
        `;
    traceOutput.innerHTML = '<h3>Traza Parcial</h3>' + renderTrace(result.trace);
  }
}

// Inicializar el proceso: Solo asignar el listener y el mensaje inicial.
document.addEventListener('DOMContentLoaded', function() {
  // 1. Asignar el listener al botón
  const analyzeButton = document.getElementById('analyzeButton');
  if (analyzeButton) {
    analyzeButton.addEventListener('click', runAnalyzer);
  }

  // 2. Inicializar los mensajes y limpiar áreas de tablas al cargar
  document.getElementById('analysisOutput').innerHTML = '<p>Ingrese una expresión y haga clic en Analizar.</p>';
  document.getElementById('traceOutput').innerHTML = '';

  // Asegurarse de que las áreas de las tablas están vacías al inicio
  document.getElementById('grammarOutput').innerHTML = '';
  document.getElementById('firstFollowOutput').innerHTML = '';
  document.getElementById('tableOutput').innerHTML = '';
});
