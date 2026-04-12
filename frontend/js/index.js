let cart = [];
let productos = [];

function init() {
  loadCatalogo();
  cart = loadCart();
  console.log('Carrito cargado:', cart);
}

function renderSelectOptions(items) {
  return items.map(item => `<option value="${item}">${item}</option>`).join('');
}

function renderProductMeta(p) {
  return `
    <div class="producto-meta">
      <label for="talla_${p.id}">Talla:</label>
      <select name="talla" id="talla_${p.id}" class="form-select">${renderSelectOptions(p.tallas)}</select>
    </div>
    <div class="producto-meta">
      <label for="color_${p.id}">Color:</label>
      <select name="color" id="color_${p.id}" class="form-select">${renderSelectOptions(p.colores)}</select>
    </div>
    <div class="producto-meta">
      <label for="cantidad_${p.id}">Cantidad:</label>
      <input type="number" id="cantidad_${p.id}" name="cantidad" min="1" value="1" class="form-input"/>
    </div>`;
}

function renderProductCard(p) {
  return `
    <article class="producto product-card">
      <img id="imagen_${p.id}" src="${p.imagenes[p.colores[0]]}" alt="${p.nombre}" width="200">
      <div class="producto-body">
        <h3 id="nombre_${p.id}">${p.nombre}</h3>
        <p class="producto-description">${p.descripcion}</p>
        ${renderProductMeta(p)}
        <div class="producto-price-row">
          <span class="producto-price" id="precio_${p.id}">$${p.precioBase.toFixed(2)}</span>
          <button type="button" onclick="addToCart('${p.id}')" class="button">Añadir al carrito</button>
        </div>
      </div>
    </article>`;
}

async function fetchCamisetas() {
  try {
    const filtros = applyFilter();
    const queryFilter = new URLSearchParams(filtros).toString();
    const response = await fetch(`http://localhost:3001/camisetas?${queryFilter}`);
    if (!response.ok) throw new Error('Error al cargar camisetas');
    return await response.json();
  } catch (e) { console.error(e); }
}

async function loadCatalogo() {
  productos = await fetchCamisetas();
  const contenedor = document.getElementById('catalogo');
  contenedor.innerHTML = productos.map(renderProductCard).join('');
}

function applyFilter() {
  return {
    talla: document.getElementById('size').value,
    color: document.getElementById('color').value,
    q: document.getElementById('search').value,
    sort: document.getElementById('orden').value
  };
}

function getCartItem(productoId, talla, color) {
  return cart.find(i => i.productoId === productoId && i.talla === talla && i.color === color);
}

function addToCart(productoId) {
  const nombre   = document.getElementById(`nombre_${productoId}`).textContent;
  const talla    = document.getElementById(`talla_${productoId}`).value;
  const color    = document.getElementById(`color_${productoId}`).value;
  const cantidad = parseInt(document.getElementById(`cantidad_${productoId}`).value, 10);
  const precio   = parseFloat(document.getElementById(`precio_${productoId}`).textContent.replace('$', ''));
  const imagen   = document.getElementById(`imagen_${productoId}`).src || '';
  const existing = getCartItem(productoId, talla, color);
  if (existing) { existing.cantidad += cantidad; existing.imagen = imagen; }
  else { cart.push({ productoId, nombre, talla, color, cantidad, precio, imagen }); }
  saveCart(JSON.stringify(cart));
  showToast('Producto añadido al carrito');
}

function applyCartLayout(cartGrid, cartSummary) {
  cartGrid.className = 'grid gap-8 lg:grid-cols-[1.4fr_0.8fr] items-start';
  cartSummary.className = 'rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm';
}

function renderCart() {
  const cartData  = loadCart();
  const contenedor = document.getElementById('cart_section');
  const cartGrid   = document.getElementById('cart_grid');
  const cartSummary = document.getElementById('cart_summary');
  if (!cartData || cartData.length === 0) {
    showEmptyCart(cartGrid, cartSummary);
    return setCartTotals(0, 0);
  }
  cart = cartData;
  const { countItems, totalPrice, inner } = buildCartContent(cart);
  setCartTotals(countItems, totalPrice);
  contenedor.innerHTML = inner;
  applyCartLayout(cartGrid, cartSummary);
}

function buildCartItemDetails(p) {
  return `
    <div class="producto-meta-grid">
      <div class="item-details">
        <span>Talla: ${p.talla}</span>
        <span>Color: ${p.color}</span>
        <span>Cantidad: ${p.cantidad}</span>
      </div>
      <div class="price-info">
        <span class="producto-price">Precio: $${p.precio.toFixed(2)}</span>
        <span class="producto-price-subtotal">Total: $${(p.precio * p.cantidad).toFixed(2)}</span>
      </div>
    </div>`;
}

function buildCartItemHTML(p) {
  return `
    <article class="cart-item">
      <img src="${p.imagen || ''}" alt="${p.nombre}" width="150">
      <div class="producto-body">
        <h3>${p.nombre}</h3>
        ${buildCartItemDetails(p)}
        <button type="button" onclick="removeFromCart('${p.productoId}', '${p.talla}', '${p.color}')" class="button button-secondary">Eliminar</button>
      </div>
    </article>`;
}


function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed', bottom: '1.5rem', right: '1.5rem',
    padding: '0.75rem 1.25rem', backgroundColor: '#1e293b',
    color: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.875rem',
    fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    zIndex: 9999, transition: 'opacity 0.3s ease'
  });
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 1000);
}

const DEFAULT_CLIENTE = {
  nombre: 'Cliente TeeLab',
  email: 'cliente@teelab.local',
  direccion: 'Dirección de entrega TeeLab'
};

function loadClienteData() {
  try {
    const stored = localStorage.getItem('cliente');
    return stored ? JSON.parse(stored) : DEFAULT_CLIENTE;
  } catch (error) {
    console.error('Error al parsear datos del cliente:', error);
    return DEFAULT_CLIENTE;
  }
}

function renderLocalItem(item) {
  return `
    <article class="producto product-card">
      <div class="producto-body">
        <h3>${item.nombre}</h3>
        <div class="producto-meta-grid">
          <span>Talla: ${item.talla}</span>
          <span>Color: ${item.color}</span>
          <span>Cantidad: ${item.cantidad}</span>
        </div>
        <p class="producto-price">Precio unitario: $${item.precio.toFixed(2)}</p>
        <p class="producto-price-subtotal">Subtotal: $${(item.precio * item.cantidad).toFixed(2)}</p>
      </div>
    </article>`;
}

function renderLocalItems(comanda) {
  return comanda.map(renderLocalItem).join('');
}

function calcTotals(comanda) {
  return comanda.reduce((acc, item) => ({
    items: acc.items + item.cantidad,
    price: acc.price + item.precio * item.cantidad
  }), { items: 0, price: 0 });
}

function renderTiquetFromLocal(comanda) {
  const section = document.getElementById('tiquet_section');
  const { items, price } = calcTotals(comanda);
  section.innerHTML = `
    <h2>Tu tiquet (local)</h2>
    ${renderLocalItems(comanda)}
    <p>Total de articulos: ${items}</p>
    <p>Precio total: $${price.toFixed(2)}</p>
  `;
  appendBackButton(section);
}

function renderOrderItem(item) {
  return `
    <article class="producto product-card">
      <div class="producto-body">
        <h3>${item.nombre}</h3>
        <div class="producto-meta-grid">
          <span>Talla: ${item.talla}</span>
          <span>Color: ${item.color}</span>
          <span>Cantidad: ${item.cantidad}</span>
        </div>
        <p class="producto-price">Precio unitario: $${item.precioUnitario.toFixed(2)}</p>
        <p class="producto-price-subtotal">Subtotal: $${item.subtotal.toFixed(2)}</p>
      </div>
    </article>`;
}

function renderOrderItems(items) {
  return items.map(renderOrderItem).join('');
}

function renderTiquetHeader(comanda) {
  const fecha = new Date(comanda.fecha).toLocaleDateString('es-ES');
  return `
    <div class="tiquet-header">
      <p><strong>ID Pedido:</strong> ${comanda.id}</p>
      <p><strong>Fecha:</strong> ${fecha}</p>
      <p><strong>Estado:</strong> ${comanda.estado}</p>
    </div>
    <h2>Líneas de pedido</h2>`;
}

function renderTiquet(comanda) {
  const section = document.getElementById('tiquet_section');
  const totalItems = comanda.items.reduce((sum, item) => sum + item.cantidad, 0);
  section.innerHTML = `
    ${renderTiquetHeader(comanda)}
    ${renderOrderItems(comanda.items)}
    <div class="tiquet-total">
      <p>Total de artículos: ${totalItems}</p>
      <p>Precio total: $${comanda.total.toFixed(2)}</p>
    </div>`;
  appendBackButton(section);
}

function initTiquet() {
  const section = document.getElementById('tiquet_section');
  const comandaId = new URLSearchParams(window.location.search).get('id')
                    || localStorage.getItem('comanda_id');
  if (comandaId) return fetchComandaById(comandaId, section);
  const comanda = loadComanda();
  if (!comanda || comanda.length === 0) return showNoOrderMessage(section);
  const sent = localStorage.getItem(LOCAL_STORAGE_SENT_FLAG) === 'true';
  sent ? handleExistingOrder(section) : handleNewOrder(comanda, section);
}

async function handleExistingOrder(section) {
  const comandaId = localStorage.getItem(LOCAL_STORAGE_COMANDA_ID);
  if (!comandaId) return showNoIdMessage(section);
  try {
    const comandaData = await fetchComanda(comandaId);
    comandaData ? renderTiquet(comandaData) : showErrorMessage(section);
  } catch (error) {
    console.error('Error fetching comanda:', error);
    showErrorMessage(section);
  }
}

async function handleNewOrder(comanda, section) {
  try {
    await sendComandaIfNeeded(comanda);
    const comandaId = localStorage.getItem(LOCAL_STORAGE_COMANDA_ID);
    const comandaData = comandaId && await fetchComanda(comandaId);
    comandaData ? renderTiquet(comandaData) : renderTiquetFromLocal(comanda);
  } catch (error) {
    console.error('Error in handleNewOrder:', error);
    renderTiquetFromLocal(comanda);
  }
}

function buildTiquetPayload(formulario) {
  const data = new FormData(formulario);
  return { client: [data.get("nombre"), data.get("email")], items: cart };
}

async function pushTiquet() {
  try {
    const response = await fetch("http://localhost:3001/comandas", {
      method: "POST",
      body: JSON.stringify(buildTiquetPayload(formulario)),
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error(`Error en la petición de tiquet ${response.status}`);
    const resultado = await response.json();
    console.log('Respuesta de la API:', resultado);
  } catch (error) {
    console.error('Error al enviar los datos:', error);
  }
}

init();