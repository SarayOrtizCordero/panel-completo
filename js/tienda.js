const TIENDA_ALMACEN = "online";
const AVATAR_COLORS = 6;

const storeGrid = document.getElementById("storeGrid");
const storeToast = document.getElementById("toast");
const historyList = document.getElementById("historyList");
const sessionCount = document.getElementById("sessionCount");
const sessionTotal = document.getElementById("sessionTotal");

const qtySelections = {};
const purchaseHistory = [];

let toastTimer = null;
function showToast(message, tone) {
  storeToast.textContent = message;
  storeToast.className = `toast show${tone ? ` toast--${tone}` : ""}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => storeToast.classList.remove("show"), 2600);
}

function formatEUR(value) {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

function getInitials(nombre) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function stockInfo(product) {
  const stock = getStock(product.id, TIENDA_ALMACEN);
  if (stock === 0) return { stock, text: "Agotado", cls: "store-stock--out" };
  if (stock <= product.stockMinimo) return { stock, text: `¡Solo quedan ${stock}!`, cls: "store-stock--low" };
  return { stock, text: `${stock} disponibles`, cls: "store-stock--ok" };
}

function renderStore() {
  storeGrid.innerHTML = "";

  PRODUCTS.forEach((product, index) => {
    const info = stockInfo(product);
    const agotado = info.stock === 0;
    const colorClass = `avatar--${(product.id % AVATAR_COLORS) + 1}`;

    if (qtySelections[product.id] === undefined || qtySelections[product.id] > info.stock) {
      qtySelections[product.id] = Math.min(1, info.stock);
    }
    const qty = qtySelections[product.id];

    const card = document.createElement("div");
    card.className = "store-card";
    card.dataset.id = product.id;
    card.style.animationDelay = `${index * 0.05}s`;
    card.innerHTML = `
      <div class="store-card-top">
        <div class="avatar ${colorClass}">${getInitials(product.nombre)}</div>
        <div class="store-card-info">
          <span class="store-name">${product.nombre}</span>
          <span class="store-price">${formatEUR(product.precioVenta)}</span>
        </div>
      </div>
      <span class="store-stock ${info.cls}">${info.text}</span>
      <div class="store-qty ${agotado ? "hidden" : ""}">
        <button class="qty-btn" data-id="${product.id}" data-action="dec" ${qty <= 1 ? "disabled" : ""} aria-label="Reducir cantidad">−</button>
        <span class="qty-value" id="qty-${product.id}">${qty}</span>
        <button class="qty-btn" data-id="${product.id}" data-action="inc" ${qty >= info.stock ? "disabled" : ""} aria-label="Aumentar cantidad">+</button>
      </div>
      <button class="btn-buy" data-id="${product.id}" ${agotado ? "disabled" : ""}>
        ${agotado ? "Agotado" : "Añadir a la compra"}
      </button>
    `;
    storeGrid.appendChild(card);
  });
}

function renderHistory() {
  sessionCount.textContent = purchaseHistory.length;
  sessionTotal.textContent = formatEUR(purchaseHistory.reduce((sum, h) => sum + h.subtotal, 0));

  if (purchaseHistory.length === 0) {
    historyList.innerHTML = '<p class="empty-note">Aún no has comprado nada en esta sesión.</p>';
    return;
  }

  historyList.innerHTML = purchaseHistory
    .slice()
    .reverse()
    .slice(0, 6)
    .map(
      (h) => `
        <div class="history-row">
          <span class="history-main">${h.nombre} <span class="history-qty">×${h.cantidad}</span></span>
          <span class="history-meta">${h.hora} · ${formatEUR(h.subtotal)}</span>
        </div>
      `
    )
    .join("");
}

storeGrid.addEventListener("click", (event) => {
  const qtyBtn = event.target.closest(".qty-btn");
  if (qtyBtn) {
    const id = Number(qtyBtn.dataset.id);
    const product = PRODUCTS.find((p) => p.id === id);
    const info = stockInfo(product);
    const delta = qtyBtn.dataset.action === "inc" ? 1 : -1;
    qtySelections[id] = Math.min(info.stock, Math.max(1, (qtySelections[id] || 1) + delta));
    renderStore();
    return;
  }

  const buyBtn = event.target.closest(".btn-buy");
  if (buyBtn) {
    const id = Number(buyBtn.dataset.id);
    const product = PRODUCTS.find((p) => p.id === id);
    const cantidad = qtySelections[id] || 1;
    const ok = restarStock(id, TIENDA_ALMACEN, cantidad);

    if (!ok) {
      showToast("Sin stock suficiente", "error");
      renderStore();
      return;
    }

    purchaseHistory.push({
      nombre: product.nombre,
      cantidad,
      subtotal: cantidad * product.precioVenta,
      hora: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    });

    buyBtn.classList.add("btn-buy--success");
    setTimeout(() => buyBtn.classList.remove("btn-buy--success"), 500);

    showToast(`Compra confirmada: ${cantidad} × ${product.nombre}`, "ok");
    qtySelections[id] = 1;
    renderStore();
    renderHistory();
  }
});

// Si el panel de inventario (en otra pestaña) modifica el stock, la tienda se refresca sola.
function onStoreSync() {
  renderStore();
}

renderStore();
renderHistory();
