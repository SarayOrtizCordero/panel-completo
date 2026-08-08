// Estado compartido persistido en localStorage, sincronizado entre pestañas
// (usado por index.html y tienda.html para simular la integración en vivo).

const STORAGE_KEY = "panelweb_completo_inventario_v1";

function seedState() {
  const state = {};
  PRODUCTS.forEach((p) => {
    state[p.id] = {
      stock: { ...p.stockPorAlmacen },
      lotes: {
        central: p.lotesPorAlmacen.central.map((l) => ({ ...l })),
        madrid: p.lotesPorAlmacen.madrid.map((l) => ({ ...l })),
        online: p.lotesPorAlmacen.online.map((l) => ({ ...l })),
      },
    };
  });
  return state;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      // localStorage corrupto: se regenera desde los datos base
    }
  }
  const initial = seedState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

let STORE_STATE = loadState();

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(STORE_STATE));
}

function getStock(productId, almacenId) {
  return STORE_STATE[productId]?.stock[almacenId] ?? 0;
}

function getLotes(productId, almacenId) {
  return STORE_STATE[productId]?.lotes[almacenId] ?? [];
}

// Descuenta unidades del almacén y, en cascada FIFO, de los lotes de ese almacén.
function restarStock(productId, almacenId, cantidad) {
  const entry = STORE_STATE[productId];
  if (!entry) return false;

  const disponible = entry.stock[almacenId];
  if (disponible < cantidad) return false;

  entry.stock[almacenId] = disponible - cantidad;

  let restante = cantidad;
  for (const lote of entry.lotes[almacenId]) {
    if (restante === 0) break;
    const usado = Math.min(lote.cantidad, restante);
    lote.cantidad -= usado;
    restante -= usado;
  }

  persist();
  return true;
}

function sumarStock(productId, almacenId, cantidad) {
  const entry = STORE_STATE[productId];
  if (!entry) return;

  entry.stock[almacenId] += cantidad;
  // El ajuste manual (+/-) engorda/reduce el lote más reciente para mantener la suma consistente.
  const lotes = entry.lotes[almacenId];
  if (lotes.length > 0) {
    lotes[lotes.length - 1].cantidad = Math.max(0, lotes[lotes.length - 1].cantidad + cantidad);
  }
  persist();
}

function resetStore() {
  STORE_STATE = seedState();
  persist();
}

// Sincronización entre pestañas: cuando otra pestaña (p. ej. tienda.html) compra,
// esta pestaña recibe el evento "storage" y puede refrescar su UI al instante.
window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY || !event.newValue) return;
  STORE_STATE = JSON.parse(event.newValue);
  if (typeof onStoreSync === "function") onStoreSync();
});
