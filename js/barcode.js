const barcodeInput = document.getElementById("barcodeInput");
const simulateScanBtn = document.getElementById("simulateScanBtn");
const toast = document.getElementById("toast");

const DEMO_SCAN_PRODUCT_ID = 4; // Zapatillas running — código de demo determinista

let toastTimer = null;
function showToast(message, tone) {
  toast.textContent = message;
  toast.className = `toast show${tone ? ` toast--${tone}` : ""}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function buscarPorCodigoBarras(codigo) {
  const product = PRODUCTS.find((p) => p.codigoBarras === codigo.trim());
  if (product) {
    document.querySelector('.nav-btn[data-view="view-inventario"]').click();
    highlightProductRow(product.id);
    showToast(`Producto encontrado: ${product.nombre}`, "ok");
  } else {
    showToast("Código no reconocido", "error");
  }
  barcodeInput.value = "";
}

barcodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && barcodeInput.value.trim()) {
    buscarPorCodigoBarras(barcodeInput.value);
  }
});

function simulateScan() {
  const producto = PRODUCTS.find((p) => p.id === DEMO_SCAN_PRODUCT_ID);
  const codigo = producto.codigoBarras;

  barcodeInput.value = "";
  barcodeInput.focus();
  simulateScanBtn.disabled = true;
  simulateScanBtn.classList.add("scanning");

  let i = 0;
  const typing = setInterval(() => {
    barcodeInput.value += codigo[i];
    i++;
    if (i >= codigo.length) {
      clearInterval(typing);
      simulateScanBtn.disabled = false;
      simulateScanBtn.classList.remove("scanning");
      setTimeout(() => buscarPorCodigoBarras(barcodeInput.value), 200);
    }
  }, 70);
}

simulateScanBtn.addEventListener("click", simulateScan);
