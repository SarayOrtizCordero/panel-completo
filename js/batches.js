const batchesModal = document.getElementById("batchesModal");
const batchesBody = document.getElementById("batchesBody");
const batchesTitle = document.getElementById("batchesTitle");
const batchesAlmacen = document.getElementById("batchesAlmacen");

let currentBatchProductId = null;

function mesesHasta(fechaISO) {
  const hoy = new Date();
  const fecha = new Date(fechaISO);
  return (fecha.getFullYear() - hoy.getFullYear()) * 12 + (fecha.getMonth() - hoy.getMonth());
}

function formatFecha(fechaISO) {
  const [y, m, d] = fechaISO.split("-");
  return `${d}/${m}/${y}`;
}

function caducaInfo(fechaISO) {
  if (!fechaISO) return { texto: "Sin caducidad registrada", nivel: "none" };

  const meses = Math.max(0, mesesHasta(fechaISO));
  if (meses <= 3) {
    return { texto: `Caduca en ${meses} ${meses === 1 ? "mes" : "meses"} (${formatFecha(fechaISO)})`, nivel: "urgent" };
  }
  if (meses <= 6) {
    return { texto: `Caduca en ${meses} meses (${formatFecha(fechaISO)})`, nivel: "warning" };
  }
  return { texto: `Caduca: ${formatFecha(fechaISO)}`, nivel: "ok" };
}

function openBatchesModal(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  currentBatchProductId = productId;
  batchesTitle.textContent = product.nombre;
  batchesAlmacen.textContent = getAlmacenNombre(currentAlmacenId);
  renderBatches(product);
  batchesModal.classList.add("open");
}

function closeBatchesModal() {
  batchesModal.classList.remove("open");
  currentBatchProductId = null;
}

function renderBatches(product) {
  const lotes = getLotes(product.id, currentAlmacenId);
  batchesBody.innerHTML = "";

  if (lotes.length === 0 || lotes.every((l) => l.cantidad === 0)) {
    batchesBody.innerHTML = '<p class="empty-note">Sin lotes con stock en este almacén.</p>';
    return;
  }

  lotes.forEach((lote, i) => {
    if (lote.cantidad === 0) return;
    const info = caducaInfo(lote.caduca);
    const row = document.createElement("div");
    row.className = `batch-row batch-row--${info.nivel}`;
    row.style.animationDelay = `${i * 0.06}s`;
    row.innerHTML = `
      <div class="batch-main">
        <span class="batch-code">Lote ${lote.codigo}</span>
        <span class="batch-expiry batch-expiry--${info.nivel}">${info.texto}</span>
      </div>
      <span class="batch-qty">${lote.cantidad} uds.</span>
    `;
    batchesBody.appendChild(row);
  });
}

document.getElementById("batchesClose").addEventListener("click", closeBatchesModal);
batchesModal.addEventListener("click", (event) => {
  if (event.target === batchesModal) closeBatchesModal();
});
