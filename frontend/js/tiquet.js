const LOCAL_STORAGE_KEY = 'comanda';
const LOCAL_STORAGE_SENT_FLAG = 'comanda_enviada';
const LOCAL_STORAGE_COMANDA_ID = 'comanda_id';

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

async function fetchComandaById(id, section) {
    try {
        const response = await fetch(`http://localhost:3001/comandas/${id}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const comanda = await response.json();
        renderTiquet(comanda);
    } catch (error) {
        console.error('Error fetching comanda:', error);
        showErrorMessage(section);
    }
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

function showNoOrderMessage(section) {
    section.innerHTML = '<p>No se ha encontrado ninguna comanda. Vuelve al inicio y realiza un pedido.</p>';
    appendBackButton(section);
}

function showNoIdMessage(section) {
    section.innerHTML = '<p>No se ha encontrado el ID de la comanda. Vuelve al inicio y realiza un pedido.</p>';
    appendBackButton(section);
}

function showErrorMessage(section) {
    section.innerHTML = '<p>Error al cargar la comanda. Vuelve al inicio y realiza un pedido.</p>';
    appendBackButton(section);
}

function loadComanda() {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch (error) {
        console.error('Error al parsear la comanda desde localStorage:', error);
        return [];
    }
}

function saveComanda(comanda) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(comanda));
}

async function fetchComanda(id) {
    try {
        const response = await fetch(`http://localhost:3001/comandas/${id}`);
        if (!response.ok) {
            throw new Error(`Error fetching comanda: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching comanda:', error);
        return null;
    }
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

function appendBackButton(container) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button';
    button.textContent = 'Volver al inicio';
    button.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    container.appendChild(button);
}

async function sendComandaIfNeeded(comanda) {
    const sent = localStorage.getItem(LOCAL_STORAGE_SENT_FLAG);
    if (sent === 'true') {
        console.log('La comanda ya se ha enviado.');
        return Promise.resolve();
    }

    const payload = buildOrderPayload(comanda);
    return sendOrderRequest(payload).then(result => {
        handleOrderResponse(result);
    });
}

function buildOrderPayload(comanda) {
    const clienteData = loadClienteData();
    return {
        cliente: {
            nombre: clienteData.nombre,
            email: clienteData.email
        },
        direccion: clienteData.direccion,
        items: comanda.map(item => ({
            camisetaId: item.productoId,
            talla: item.talla,
            color: item.color,
            cantidad: item.cantidad
        }))
    };
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

function sendOrderRequest(payload) {
    return fetch('http://localhost:3001/comandas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).then(response => {
        if (!response.ok) {
            return response.text().then(errorText => {
                throw new Error(`Error en la petición de tiquet ${response.status}: ${errorText}`);
            });
        }
        return response.json();
    });
}

function handleOrderResponse(resultado) {
    console.log('Respuesta de la API:', resultado);
    localStorage.setItem(LOCAL_STORAGE_SENT_FLAG, 'true');
    localStorage.setItem(LOCAL_STORAGE_COMANDA_ID, resultado.tiquet.id);
    localStorage.removeItem('cliente');
}

initTiquet();
