// --- Generador determinista de series históricas (para el gráfico de tendencia) ---
// No hay datos reales día a día en esta demo estática, así que se genera un
// "paseo aleatorio" realista (subidas y bajadas) que siempre termina exactamente
// en el valor real de hoy, para que el gráfico nunca contradiga las cifras.

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h >>> 0;
}

function seededRandom(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateSeries(finalValue, seedStr, days) {
  const rand = seededRandom(hashSeed(seedStr));
  const raw = [1];
  for (let i = 1; i < days; i++) {
    const cambio = (rand() - 0.47) * 0.05; // ligero sesgo alcista con caídas realistas
    raw.push(Math.max(0.35, raw[i - 1] * (1 + cambio)));
  }
  const escala = finalValue / raw[raw.length - 1];
  return raw.map((v) => Math.round(v * escala * 100) / 100);
}

function renderFinance() {
  let valorStock = 0;
  let beneficio = 0;

  const filas = PRODUCTS.map((p) => {
    const stock = getStock(p.id, currentAlmacenId);
    const valor = stock * p.precioCoste;
    const margenUd = p.precioVenta - p.precioCoste;
    const margenTotal = stock * margenUd;

    valorStock += valor;
    beneficio += margenTotal;

    return { p, stock, valor, margenUd, margenTotal };
  });

  document.getElementById("valorStockTotal").textContent = formatEUR(valorStock);
  document.getElementById("beneficioTotal").textContent = formatEUR(beneficio);
  document.getElementById("financeAlmacenLabel").textContent = getAlmacenNombre(currentAlmacenId);
  document.getElementById("financeAlmacenLabel2").textContent = getAlmacenNombre(currentAlmacenId);

  const tbody = document.getElementById("financeBody");
  tbody.innerHTML = filas
    .map(
      ({ p, stock, valor, margenUd, margenTotal }) => `
        <tr>
          <td class="product-name-cell">${p.nombre}</td>
          <td>${stock} uds.</td>
          <td>${formatEUR(p.precioCoste)}</td>
          <td>${formatEUR(p.precioVenta)}</td>
          <td>${formatEUR(margenUd)}</td>
          <td class="finance-strong">${formatEUR(valor)}</td>
          <td class="finance-strong finance-profit">${formatEUR(margenTotal)}</td>
        </tr>
      `
    )
    .join("");

  renderFinanceChart(valorStock, beneficio);
}

function renderDeltaChip(elId, serie) {
  const el = document.getElementById(elId);
  const cambio = ((serie[serie.length - 1] - serie[0]) / serie[0]) * 100;
  const positivo = cambio >= 0;
  el.textContent = `${positivo ? "▲" : "▼"} ${Math.abs(cambio).toFixed(1)}%`;
  el.className = `delta-chip ${positivo ? "delta-chip--up" : "delta-chip--down"}`;
}

function buildChartPaths(serie, width, height, min, max) {
  const days = serie.length;
  const stepX = width / (days - 1);
  const scaleY = (v) => height - ((v - min) / (max - min || 1)) * height;

  const points = serie.map((v, i) => [i * stepX, scaleY(v)]);
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width.toFixed(1)},${height} L0,${height} Z`;

  return { line, area };
}

function renderFinanceChart(valorStock, beneficio) {
  const days = 30;
  const width = 640;
  const height = 200;

  const serieValor = generateSeries(valorStock, `valor-${currentAlmacenId}`, days);
  const serieBeneficio = generateSeries(beneficio, `beneficio-${currentAlmacenId}`, days);

  renderDeltaChip("deltaValor", serieValor);
  renderDeltaChip("deltaBeneficio", serieBeneficio);

  const combinado = [...serieValor, ...serieBeneficio];
  const min = Math.min(...combinado) * 0.92;
  const max = Math.max(...combinado) * 1.08;

  const pathsValor = buildChartPaths(serieValor, width, height, min, max);
  const pathsBeneficio = buildChartPaths(serieBeneficio, width, height, min, max);

  const gridLines = [0.25, 0.5, 0.75]
    .map((f) => `<line x1="0" y1="${height * f}" x2="${width}" y2="${height * f}" class="chart-grid-line"></line>`)
    .join("");

  const wrap = document.getElementById("financeChartWrap");
  wrap.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="finance-chart-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="gradValor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.28"></stop>
          <stop offset="100%" stop-color="var(--primary)" stop-opacity="0"></stop>
        </linearGradient>
        <linearGradient id="gradBeneficio" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--ok)" stop-opacity="0.28"></stop>
          <stop offset="100%" stop-color="var(--ok)" stop-opacity="0"></stop>
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${pathsValor.area}" fill="url(#gradValor)" class="chart-area"></path>
      <path d="${pathsBeneficio.area}" fill="url(#gradBeneficio)" class="chart-area"></path>
      <path d="${pathsValor.line}" fill="none" stroke="var(--primary)" stroke-width="2.5" class="chart-line" id="lineValor"></path>
      <path d="${pathsBeneficio.line}" fill="none" stroke="var(--ok)" stroke-width="2.5" class="chart-line" id="lineBeneficio"></path>
    </svg>
    <div class="chart-x-axis">
      <span>Hace 30 días</span>
      <span>Hoy</span>
    </div>
  `;

  ["lineValor", "lineBeneficio"].forEach((id, i) => {
    const path = document.getElementById(id);
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        path.style.transition = `stroke-dashoffset 1.1s ease ${i * 0.15}s`;
        path.style.strokeDashoffset = "0";
      });
    });
  });
}
