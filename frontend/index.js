let cart = [];
let productos = [];

function saveCart(value, days=7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `cart=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function init() {
  loadCatalogo();
  cart = loadCart();
  console.log('Carrito cargado:', cart);
}

function loadCart(name = "cart") {
    const cookieValue = document.cookie
        .split("; ")
        .find(c => c.startsWith(name + '='))
        ?.split('=')[1] ?? null;

    return cookieValue ? JSON.parse(decodeURIComponent(cookieValue)) : [];
}

async function loadCatalogo() {
  productos = await fetchCamisetas();
  const contenedor = document.getElementById('catalogo');
  let inner = '';
  productos.forEach(p => {
    console.log('Producto cargado:', p);
    inner += `
        <div class="producto">
            <img id="imagen_${p.id}" src="${p.imagenes[p.colores[0]]}" alt="${p.nombre}" width="200">
            <h3 id="nombre_${p.id}">${p.nombre}</h3>

            <label for="talla_${p.id}">Talla:</label>
            <select name="talla" id="talla_${p.id}">
                ${p.tallas.map(talla => `<option value="${talla}">${talla}</option>`).join('')}
            </select>

            <label for="color_${p.id}">Color:</label>
            <select name="color" id="color_${p.id}">
                ${p.colores.map(color => `<option value="${color}">${color}</option>`).join('')}
            </select>

            <label for="cantidad_${p.id}">Cantidad:</label>
            <input type="number" id="cantidad_${p.id}" name="cantidad" min="1" value="1"/>

            <button type="button" onclick="addToCart('${p.id}')">Añadir al carrito</button>

            <p>${p.descripcion}</p>
            <span id="precio_${p.id}">$${p.precioBase.toFixed(2)}</span>
        </div>
        `;
  });
  contenedor.innerHTML = inner;
}

async function fetchCamisetas() {
  try {
    const filtros = applyFilter();
    const queryFilter = new URLSearchParams(filtros).toString();
    const response = await fetch(`http://localhost:3001/camisetas?${queryFilter}`);
    if (!response.ok) {
      throw new Error('Error al cargar camisetas');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

function addToCart(productoId) {
  const nombre = document.getElementById(`nombre_${productoId}`).textContent;
  const talla = document.getElementById(`talla_${productoId}`).value;
  const color = document.getElementById(`color_${productoId}`).value;
  const cantidad = parseInt(document.getElementById(`cantidad_${productoId}`).value, 10);
  const precio = parseFloat(document.getElementById(`precio_${productoId}`).textContent.replace('$', ''));

  const existingItem = cart.find(item =>
    item.productoId === productoId &&
    item.talla === talla &&
    item.color === color
  );

  const imagen = document.getElementById(`imagen_${productoId}`).src || '';

  if (existingItem) {
    existingItem.cantidad += cantidad;
    existingItem.imagen = imagen;
    console.log(`Producto repetido encontrado. Nueva cantidad: ${existingItem.cantidad}`);
  } else {
    cart.push({ productoId, nombre, talla, color, cantidad, precio, imagen });
    console.log('Nuevo producto añadido al carrito.');
  }

  saveCart(JSON.stringify(cart));
  console.log('Carrito actual:', cart);
}

function applyFilter() {
  const talla = document.getElementById('size').value;
  const color = document.getElementById('color').value;
  const q = document.getElementById('search').value;
  const orden = document.getElementById('orden').value;
  console.log('Filtrar por:', { talla, color, q, orden });
  return {talla:talla,color:color,q:q,sort:orden};
}

init();