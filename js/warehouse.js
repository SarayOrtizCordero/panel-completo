let currentAlmacenId = "central";

function getAlmacenNombre(id) {
  const a = ALMACENES.find((al) => al.id === id);
  return a ? a.nombre : "—";
}

function initWarehouseSelector() {
  const select = document.getElementById("warehouseSelect");
  select.innerHTML = ALMACENES.map((a) => `<option value="${a.id}">${a.nombre}</option>`).join("");
  select.value = currentAlmacenId;

  select.addEventListener("change", () => {
    currentAlmacenId = select.value;
    document.getElementById("view-inventario").classList.add("fade-swap");
    renderAll();
    requestAnimationFrame(() => {
      document.getElementById("view-inventario").classList.remove("fade-swap");
    });
  });
}
