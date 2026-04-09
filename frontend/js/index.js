let cart = [];
let productos = [];

function init() {
  loadCatalogo();
  cart = loadCart();
  console.log('Carrito cargado:', cart);
}

async function loadCatalogo() {
  productos = await fetchCamisetas();
  const contenedor = document.getElementById('catalogo');
  let inner = '';
  productos.forEach(p => {
    inner += `
        <article class="producto product-card">
            <img id="imagen_${p.id}" src="${p.imagenes[p.colores[0]]}" alt="${p.nombre}" width="200">
            <div class="producto-body">
                <h3 id="nombre_${p.id}">${p.nombre}</h3>
                <p class="producto-description">${p.descripcion}</p>
                <div class="producto-meta">
                    <label for="talla_${p.id}">Talla:</label>
                    <select name="talla" id="talla_${p.id}" class="form-select">
                        ${p.tallas.map(talla => `<option value="${talla}">${talla}</option>`).join('')}
                    </select>
                </div>
                <div class="producto-meta">
                    <label for="color_${p.id}">Color:</label>
                    <select name="color" id="color_${p.id}" class="form-select">
                        ${p.colores.map(color => `<option value="${color}">${color}</option>`).join('')}
                    </select>
                </div>
                <div class="producto-meta">
                    <label for="cantidad_${p.id}">Cantidad:</label>
                    <input type="number" id="cantidad_${p.id}" name="cantidad" min="1" value="1" class="form-input"/>
                </div>
                <div class="producto-price-row">
                    <span class="producto-price" id="precio_${p.id}">$${p.precioBase.toFixed(2)}</span>
                    <button type="button" onclick="addToCart('${p.id}')" class="button">Añadir al carrito</button>
                </div>
            </div>
        </article>
        `;
  });
  contenedor.innerHTML = inner;
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

function addToCart(productoId) {
  const nombre = document.getElementById(`nombre_${productoId}`).textContent;
  const talla = document.getElementById(`talla_${productoId}`).value;
  const color = document.getElementById(`color_${productoId}`).value;
  const cantidad = parseInt(document.getElementById(`cantidad_${productoId}`).value,10);
  const precio = parseFloat(document.getElementById(`precio_${productoId}`).textContent.replace('$',''));
  const existing = cart.find(i=>i.productoId===productoId&&i.talla===talla&&i.color===color);
  const imagen = document.getElementById(`imagen_${productoId}`).src||'';
  if(existing){ existing.cantidad+=cantidad; existing.imagen=imagen; }
  else{ cart.push({productoId,nombre,talla,color,cantidad,precio,imagen}); }
  saveCart(JSON.stringify(cart));
}

function applyFilter(){
  return {
    talla: document.getElementById('size').value,
    color: document.getElementById('color').value,
    q: document.getElementById('search').value,
    sort: document.getElementById('orden').value
  };
}

init();