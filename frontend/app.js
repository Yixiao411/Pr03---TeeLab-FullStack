function init() {
  loadCatalogo();
  fetchCamisetas();
}

async function loadCatalogo() {
  const productos = await fetchCamisetas();
  const contenedor = document.getElementById('catalogo');
  let innner = '';
  productos.forEach(p => {
    innner += `
        <div class="producto">
            <img src="${p.imagenes[p.colores[0]]}" alt="${p.nombre}" width="200">
            <h3>${p.nombre}</h3>

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

            <button type="button" onclick="addToCart()">Añadir al carrito</button>

            <p>${p.descripcion}</p>
            <span>$${p.precioBase.toFixed(2)}</span>
        </div>
        `;
  });
  contenedor.innerHTML = innner;
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

function addToCart() {
  alert('Producto añadido al carrito');
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