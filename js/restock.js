// --- Modal: reponer stock ---
const restockModal = document.getElementById("restockModal");
const restockForm = document.getElementById("restockForm");
const restockTitle = document.getElementById("restockTitle");
const restockAlmacen = document.getElementById("restockAlmacen");
const restockQty = document.getElementById("restockQty");
let restockProductId = null;

function openRestockModal(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;

  restockProductId = id;
  restockTitle.textContent = product.nombre;
  restockAlmacen.textContent = getAlmacenNombre(currentAlmacenId);
  restockQty.value = 10;
  restockModal.classList.add("open");
  restockQty.focus();
}

function closeRestockModal() {
  restockModal.classList.remove("open");
  restockProductId = null;
}

restockForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const qty = Number(restockQty.value);
  if (!restockProductId || !Number.isFinite(qty) || qty <= 0) return;

  const product = PRODUCTS.find((p) => p.id === restockProductId);
  changeProductStock(restockProductId, qty);
  closeRestockModal();
  showToast(`+${qty} uds. añadidas a ${product.nombre} (${getAlmacenNombre(currentAlmacenId)})`, "ok");
});

document.getElementById("restockClose").addEventListener("click", closeRestockModal);
restockModal.addEventListener("click", (event) => {
  if (event.target === restockModal) closeRestockModal();
});

// --- Modal: añadir producto ---
const addProductModal = document.getElementById("addProductModal");
const addProductForm = document.getElementById("addProductForm");
const addProductAlmacen = document.getElementById("addProductAlmacen");

function openAddProductModal() {
  addProductForm.reset();
  document.getElementById("newProductStockMinimo").value = 10;
  document.getElementById("newProductStock").value = 0;
  addProductAlmacen.textContent = getAlmacenNombre(currentAlmacenId);
  addProductModal.classList.add("open");
  document.getElementById("newProductNombre").focus();
}

function closeAddProductModal() {
  addProductModal.classList.remove("open");
}

addProductForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nombre = document.getElementById("newProductNombre").value.trim();
  const sku = document.getElementById("newProductSku").value.trim();
  const precioCoste = Math.max(0, Number(document.getElementById("newProductPrecioCoste").value));
  const precioVenta = Math.max(0, Number(document.getElementById("newProductPrecioVenta").value));
  const stockMinimo = Math.max(0, Number(document.getElementById("newProductStockMinimo").value));
  const stockInicial = Math.max(0, Number(document.getElementById("newProductStock").value));
  if (!nombre || !sku) return;

  const id = PRODUCTS.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  const codigoBarras = ean13(`84123450${String(id).padStart(4, "0")}`);

  const stockPorAlmacen = {};
  const lotesPorAlmacen = {};
  ALMACENES.forEach((a) => {
    stockPorAlmacen[a.id] = 0;
    lotesPorAlmacen[a.id] = [];
  });
  stockPorAlmacen[currentAlmacenId] = stockInicial;
  if (stockInicial > 0) {
    lotesPorAlmacen[currentAlmacenId] = [{ codigo: "ALTA", cantidad: stockInicial, caduca: null }];
  }

  PRODUCTS.push({ id, nombre, sku, codigoBarras, precioCoste, precioVenta, stockMinimo, stockPorAlmacen, lotesPorAlmacen });

  const lotes = {};
  ALMACENES.forEach((a) => { lotes[a.id] = lotesPorAlmacen[a.id].map((l) => ({ ...l })); });
  STORE_STATE[id] = { stock: { ...stockPorAlmacen }, lotes };
  persist();

  renderAll();
  closeAddProductModal();
  showToast(`${nombre} añadido al inventario`, "ok");
});

document.getElementById("addProductOpenBtn").addEventListener("click", openAddProductModal);
document.getElementById("addProductClose").addEventListener("click", closeAddProductModal);
addProductModal.addEventListener("click", (event) => {
  if (event.target === addProductModal) closeAddProductModal();
});
