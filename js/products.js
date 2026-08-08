const AVATAR_COLORS = 6;
const productsBody = document.getElementById("productsBody");

function getInitials(nombre) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function isLowStock(p) {
  return getStock(p.id, currentAlmacenId) <= p.stockMinimo;
}

function formatEUR(value) {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

function flashButton(btn, isIncrement) {
  const flashClass = isIncrement ? "flash-plus" : "flash-minus";
  btn.classList.remove("flash-plus", "flash-minus");
  void btn.offsetWidth;
  btn.classList.add(flashClass);
  btn.addEventListener("animationend", () => btn.classList.remove(flashClass), { once: true });
}

function pulseValue(el) {
  el.classList.remove("pulse");
  void el.offsetWidth;
  el.classList.add("pulse");
}

function renderProductRow(p, index) {
  const low = isLowStock(p);
  const colorClass = `avatar--${(p.id % AVATAR_COLORS) + 1}`;

  const tr = document.createElement("tr");
  tr.className = `product-row${low ? " is-low" : ""}`;
  tr.dataset.id = p.id;
  tr.style.animationDelay = `${Math.min(index, 20) * 0.03}s`;

  tr.innerHTML = `
    <td class="col-photo">
      <div class="avatar ${colorClass}">${getInitials(p.nombre)}</div>
    </td>
    <td>
      <div class="product-name">${p.nombre}</div>
      <span class="low-badge"><i class="low-dot"></i>¡Stock Bajo!</span>
      <button class="link-variants" data-id="${p.id}">Ver lotes</button>
    </td>
    <td class="sku">${p.sku}</td>
    <td><span class="stock-value" id="stock-${p.id}">${getStock(p.id, currentAlmacenId)}</span></td>
    <td class="col-actions">
      <button class="btn-restock" data-id="${p.id}" aria-label="Reponer stock de ${p.nombre}" title="Reponer stock">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8v13H3V8"></path><path d="M1 3h22v5H1z"></path><line x1="10" y1="12" x2="14" y2="12"></line><line x1="12" y1="10" x2="12" y2="14"></line></svg>
      </button>
      <button class="btn-qty btn-minus" data-id="${p.id}" data-action="dec" aria-label="Restar unidad de ${p.nombre}">−</button>
      <button class="btn-qty btn-plus" data-id="${p.id}" data-action="inc" aria-label="Sumar unidad de ${p.nombre}">+</button>
    </td>
  `;

  return tr;
}

function renderProductsTable() {
  productsBody.innerHTML = "";
  PRODUCTS.forEach((p, index) => productsBody.appendChild(renderProductRow(p, index)));
}

function updateDashboardStats() {
  const total = PRODUCTS.length;
  const listos = PRODUCTS.filter((p) => !isLowStock(p)).length;

  document.getElementById("totalProductos").textContent = total;
  document.getElementById("totalListos").textContent = listos;
  document.getElementById("almacenActivoLabel").textContent = getAlmacenNombre(currentAlmacenId);
}

function updateProductRowDOM(p) {
  const row = productsBody.querySelector(`tr[data-id="${p.id}"]`);
  if (!row) return;

  const stockEl = document.getElementById(`stock-${p.id}`);
  stockEl.textContent = getStock(p.id, currentAlmacenId);
  pulseValue(stockEl);

  row.classList.toggle("is-low", isLowStock(p));
}

function changeProductStock(id, delta) {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;

  if (delta > 0) {
    sumarStock(id, currentAlmacenId, delta);
  } else {
    restarStock(id, currentAlmacenId, Math.min(-delta, getStock(id, currentAlmacenId)));
  }

  updateProductRowDOM(product);
  updateDashboardStats();
  renderFinance();
}

productsBody.addEventListener("click", (event) => {
  const restockBtn = event.target.closest(".btn-restock");
  if (restockBtn) {
    openRestockModal(Number(restockBtn.dataset.id));
    return;
  }

  const qtyBtn = event.target.closest(".btn-qty");
  if (qtyBtn) {
    const id = Number(qtyBtn.dataset.id);
    const isIncrement = qtyBtn.dataset.action === "inc";
    flashButton(qtyBtn, isIncrement);
    changeProductStock(id, isIncrement ? 1 : -1);
    return;
  }

  const lotesBtn = event.target.closest(".link-variants");
  if (lotesBtn) {
    openBatchesModal(Number(lotesBtn.dataset.id));
  }
});

function highlightProductRow(productId) {
  const row = productsBody.querySelector(`tr[data-id="${productId}"]`);
  if (!row) return;
  row.scrollIntoView({ behavior: "smooth", block: "center" });
  row.classList.add("scan-highlight");
  setTimeout(() => row.classList.remove("scan-highlight"), 1300);
}

function renderAll() {
  renderProductsTable();
  updateDashboardStats();
  renderFinance();
}

// Actualiza valores en el DOM ya existente, sin reconstruir ni re-animar la tabla
// (usado en la sincronización entre pestañas para que el cambio se vea instantáneo, no brusco).
function refreshProductValues() {
  PRODUCTS.forEach((p) => updateProductRowDOM(p));
  updateDashboardStats();
  renderFinance();
}
