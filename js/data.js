// Datos de ejemplo estáticos (demo sin backend)

const ALMACENES = [
  { id: "central", nombre: "Almacén Central" },
  { id: "madrid", nombre: "Tienda Física Madrid" },
  { id: "online", nombre: "Tienda Online" },
];

// --- Utilidades de fecha (relativas a "hoy" para que la demo no caduque) ---
function addMonths(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

// --- Utilidades de código de barras (EAN-13 con dígito de control real) ---
function ean13CheckDigit(base12) {
  const digits = base12.split("").map(Number);
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10;
}

function ean13(base12) {
  return base12 + ean13CheckDigit(base12);
}

// Genera lotes por almacén garantizando que la suma coincida siempre con el stock.
function generarLotes(stockCentral, stockMadrid, stockOnline, mesesLoteA, mesesLoteC, mesesLoteD) {
  const loteA = Math.round(stockCentral * 0.6);
  const loteB = stockCentral - loteA;

  return {
    central: [
      { codigo: "2026-A", cantidad: loteA, caduca: addMonths(mesesLoteA) },
      { codigo: "2026-B", cantidad: loteB, caduca: null },
    ],
    madrid: [
      { codigo: "2026-C", cantidad: stockMadrid, caduca: addMonths(mesesLoteC) },
    ],
    online: [
      { codigo: "2026-D", cantidad: stockOnline, caduca: addMonths(mesesLoteD) },
    ],
  };
}

const PRODUCTS = [
  {
    id: 1, nombre: "Camiseta básica", sku: "CAM-001", codigoBarras: ean13("841234500001"),
    precioCoste: 6.50, precioVenta: 14.95, stockMinimo: 15,
    stockPorAlmacen: { central: 420, madrid: 45, online: 60 },
    lotesPorAlmacen: generarLotes(420, 45, 60, 6, 8, 9),
  },
  {
    id: 2, nombre: "Pantalón vaquero", sku: "PAN-002", codigoBarras: ean13("841234500002"),
    precioCoste: 18.00, precioVenta: 39.95, stockMinimo: 10,
    stockPorAlmacen: { central: 320, madrid: 30, online: 25 },
    lotesPorAlmacen: generarLotes(320, 30, 25, 9, 7, 6),
  },
  {
    id: 3, nombre: "Sudadera con capucha", sku: "SUD-003", codigoBarras: ean13("841234500003"),
    precioCoste: 15.00, precioVenta: 34.95, stockMinimo: 8,
    stockPorAlmacen: { central: 210, madrid: 8, online: 22 },
    lotesPorAlmacen: generarLotes(210, 8, 22, 4, 2, 5),
  },
  {
    id: 4, nombre: "Zapatillas running", sku: "ZAP-004", codigoBarras: ean13("841234500004"),
    precioCoste: 28.00, precioVenta: 59.95, stockMinimo: 10,
    stockPorAlmacen: { central: 450, madrid: 35, online: 40 },
    lotesPorAlmacen: generarLotes(450, 35, 40, 5, 6, 7),
  },
  {
    id: 5, nombre: "Gorra deportiva", sku: "GOR-005", codigoBarras: ean13("841234500005"),
    precioCoste: 4.50, precioVenta: 12.95, stockMinimo: 20,
    stockPorAlmacen: { central: 480, madrid: 50, online: 65 },
    lotesPorAlmacen: generarLotes(480, 50, 65, 7, 9, 8),
  },
  {
    id: 6, nombre: "Chaqueta impermeable", sku: "CHA-006", codigoBarras: ean13("841234500006"),
    precioCoste: 32.00, precioVenta: 69.95, stockMinimo: 8,
    stockPorAlmacen: { central: 380, madrid: 20, online: 7 },
    lotesPorAlmacen: generarLotes(380, 20, 7, 3, 6, 4),
  },
  {
    id: 7, nombre: "Vestido de verano", sku: "VES-007", codigoBarras: ean13("841234500007"),
    precioCoste: 12.00, precioVenta: 27.95, stockMinimo: 10,
    stockPorAlmacen: { central: 440, madrid: 28, online: 33 },
    lotesPorAlmacen: generarLotes(440, 28, 33, 2, 5, 6),
  },
  {
    id: 8, nombre: "Bufanda de lana", sku: "BUF-008", codigoBarras: ean13("841234500008"),
    precioCoste: 7.00, precioVenta: 16.95, stockMinimo: 6,
    stockPorAlmacen: { central: 160, madrid: 8, online: 5 },
    lotesPorAlmacen: generarLotes(160, 8, 5, 3, 8, 1),
  },
];
