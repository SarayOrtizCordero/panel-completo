# Panel de Inventario — Completo

La demo más ambiciosa de las tres, pensada para un pitch de venta:
trazabilidad, multi-almacén, y una integración en vivo con un sistema
externo simulado. Sin backend real — HTML + CSS + JS vainilla, con
`localStorage` haciendo de "base de datos" compartida entre pestañas.

## Funcionalidades

- **Selector de almacén** (arriba a la derecha): Almacén Central / Tienda
  Física Madrid / Tienda Online. Cambiarlo recalcula stock, lotes y
  financiero al instante para ese almacén.
- **Trazabilidad por lote:** botón "Ver lotes" en cada producto abre una
  ficha con el desglose de lotes de ese almacén y aviso de caducidad
  (urgente en rojo si quedan ≤3 meses, en ámbar si ≤6).
- **Escáner de código de barras:** campo de búsqueda (Enter para buscar) y
  botón "Simular escaneo" que teclea automáticamente un EAN-13 real (con
  dígito de control calculado, no inventado) y localiza el producto sin
  tocar el ratón.
- **Módulo financiero:** pestaña con valor total del stock y beneficio
  estimado del almacén activo, un gráfico de área grande con la tendencia de
  los últimos 30 días (dos series: valor del stock y beneficio, con chips de
  variación %), y una tabla de margen por producto.
- **Integración con tienda de pruebas** (`tienda.html`): una mini tienda
  aparte, con su propio catálogo, selector de cantidad e historial de
  compras de la sesión, que comparte inventario con el panel vía
  `localStorage`. Comprar allí descuenta la Tienda Online **al instante** en
  el panel si lo tienes abierto en otra pestaña — sin recargar.

## Cómo previsualizar

A diferencia de los otros dos niveles, este **necesita servirse por HTTP**
(no `file://`), porque la sincronización entre `index.html` y `tienda.html`
depende de que ambas compartan origen:

```bash
python -m http.server 8000
```

Abre `http://localhost:8000` para el panel y
`http://localhost:8000/tienda.html` en otra pestaña para ver la integración
en tiempo real.

## Estructura

```
completo/
├── index.html
├── tineda
│   ├── tienda.html          Mini tienda de pruebas (demo de integración)
├── css/
│   ├── styles.css        Panel: variables, tabs, tabla, modales, gráfico financiero
│   └── tienda.css         Estilos propios de la tienda de pruebas
└── js/
    ├── data.js            Productos (EAN-13, precios, lotes) y almacenes
    ├── store.js            Estado compartido en localStorage + sync entre pestañas
    ├── warehouse.js         Selector de almacén
    ├── products.js          Tabla de productos según almacén activo
    ├── batches.js            Ficha de trazabilidad por lote
    ├── barcode.js             Buscador y simulación de escaneo
    ├── finance.js             Módulo financiero + gráfico de tendencia
    ├── app.js                 Navegación entre pestañas e inicialización
    └── tienda.js               Lógica de compra de la tienda de pruebas
```

## Modelo de datos

```js
// data.js — valores de fábrica, NO el estado en vivo
PRODUCTS[i] = {
  id, nombre, sku, codigoBarras,        // EAN-13 con dígito de control real
  precioCoste, precioVenta, stockMinimo,
  stockPorAlmacen: { central, madrid, online },
  lotesPorAlmacen: { central: [...], madrid: [...], online: [...] },
};
```

El estado **real** (el que cambia al comprar o ajustar stock con `+`/`−`) no
vive en `PRODUCTS`, sino en `store.js`, que lo copia a `localStorage` bajo la
clave `panelweb_completo_inventario_v1` la primera vez que se carga
cualquiera de las dos páginas. Esa clave es lo que permite que `index.html`
y `tienda.html` compartan inventario en tiempo real vía el evento
`storage`.

**Para reiniciar la demo a sus valores de fábrica:** abre las DevTools en
cualquiera de las dos páginas y ejecuta
`localStorage.removeItem('panelweb_completo_inventario_v1')`, o navega en
una ventana de incógnito nueva.

El gráfico de tendencia financiera (`finance.js`) no tiene datos históricos
reales — genera un paseo aleatorio *determinista* (semilla por
almacén + métrica) que siempre termina exactamente en el valor real de hoy,
para que nunca contradiga las cifras de las tarjetas.

## Notas para extender

- Mismo sistema de variables CSS y patrón de animación de entrada
  (`opacity:0; animation: fadeInUp … both;`) que los otros dos niveles.
- **Nunca mezcles `animation` de entrada con otra animación por
  `@keyframes` en el mismo elemento** (p. ej. un resaltado temporal): la
  propiedad `animation` es un shorthand que se sustituye por completo, así
  que la segunda animación "olvida" el `opacity:1` que dejó la primera y el
  elemento puede desaparecer al terminar. Para efectos temporales tipo
  "resaltar fila", usa `transition` + una clase que se añade y se quita con
  `setTimeout`, como hace `.scan-highlight` en `products.js`.
- Igual que en los otros niveles, cuidado si combinas `hidden` con una regla
  de `display` propia sobre el mismo elemento — añade siempre el selector
  `[hidden]` explícito si no quieres que se pisen.
- Si añades un producto nuevo, genera su código de barras con la función
  `ean13()` de `data.js` (recibe una base de 12 dígitos y calcula el dígito
  de control) en vez de inventar uno a mano.
- Si añades un almacén nuevo, recuerda que `lotesPorAlmacen` debe sumar
  exactamente el `stock` de ese almacén para cada producto — `store.js` lo
  asume al hacer descuentos FIFO por lote.
