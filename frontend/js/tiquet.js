const LOCAL_STORAGE_KEY = 'comanda';
const LOCAL_STORAGE_SENT_FLAG = 'comanda_enviada';
const LOCAL_STORAGE_COMANDA_ID = 'comanda_id';

function initTiquet() {
    const section = document.getElementById('tiquet_section');
    const urlParams = new URLSearchParams(window.location.search);
    const comandaIdFromUrl = urlParams.get('id');
    const comandaIdFromStorage = localStorage.getItem('comanda_id');

    const comandaId = comandaIdFromUrl || comandaIdFromStorage;

    if (comandaId) {
        fetchComandaById(comandaId, section);
        return;
    }

    const comanda = loadComanda();
    if (!comanda || comanda.length === 0) {
        showNoOrderMessage(section);
        return;
    }

    const sent = localStorage.getItem(LOCAL_STORAGE_SENT_FLAG);
    if (sent === 'true') {
        handleExistingOrder(section);
    } else {
        handleNewOrder(comanda, section);
    }
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

function handleExistingOrder(section) {
    const comandaId = localStorage.getItem(LOCAL_STORAGE_COMANDA_ID);
    if (!comandaId) {
        showNoIdMessage(section);
        return;
    }

    fetchComanda(comandaId).then(comandaData => {
        if (!comandaData) {
            showErrorMessage(section);
            return;
        }
        renderTiquet(comandaData);
    }).catch(error => {
        console.error('Error fetching comanda:', error);
        showErrorMessage(section);
    });
}

function handleNewOrder(comanda, section) {
    sendComandaIfNeeded(comanda).then(() => {
        const comandaId = localStorage.getItem(LOCAL_STORAGE_COMANDA_ID);
        if (comandaId) {
            fetchComanda(comandaId).then(comandaData => {
                renderTiquet(comandaData);
            }).catch(error => {
                console.error('Error fetching comanda after send:', error);
                renderTiquetFromLocal(comanda);
            });
        } else {
            renderTiquetFromLocal(comanda);
        }
    }).catch(error => {
        console.error('Error sending comanda:', error);
        renderTiquetFromLocal(comanda);
    });
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

function renderTiquetFromLocal(comanda) {
    const section = document.getElementById('tiquet_section');
    let totalItems = 0;
    let totalPrice = 0;
    let inner = '<h2>Tu tiquet (local)</h2>';

    inner += renderLocalItems(comanda, (item) => {
        const itemTotal = item.precio * item.cantidad;
        totalItems += item.cantidad;
        totalPrice += itemTotal;
    });

    inner += `
        <p>Total de articulos: ${totalItems}</p>
        <p>Precio total: $${totalPrice.toFixed(2)}</p>
    `;

    section.innerHTML = inner;
    appendBackButton(section);
}

function renderLocalItems(comanda, callback) {
    let html = '';
    comanda.forEach(item => {
        callback(item);
        html += `
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
            </article>
        `;
    });
    return html;
}

function renderTiquet(comanda) {
    const section = document.getElementById('tiquet_section');
    const fecha = new Date(comanda.fecha).toLocaleDateString('es-ES');
    let totalItems = 0;

    let inner = `
        <div class="tiquet-header">
            <p><strong>ID Pedido:</strong> ${comanda.id}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
            <p><strong>Estado:</strong> ${comanda.estado}</p>
        </div>
        <h2>Líneas de pedido</h2>
    `;

    inner += renderOrderItems(comanda.items, (item) => totalItems += item.cantidad);

    inner += `
        <div class="tiquet-total">
            <p>Total de artículos: ${totalItems}</p>
            <p>Precio total: $${comanda.total.toFixed(2)}</p>
        </div>
    `;

    section.innerHTML = inner;
    appendBackButton(section);
}

function renderOrderItems(items, callback) {
    let html = '';
    items.forEach(item => {
        callback(item);
        html += `
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
            </article>
        `;
    });
    return html;
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

function loadClienteData() {
    const stored = localStorage.getItem('cliente');
    if (!stored) {
        return {
            nombre: 'Cliente TeeLab',
            email: 'cliente@teelab.local',
            direccion: 'Dirección de entrega TeeLab'
        };
    }
    try {
        return JSON.parse(stored);
    } catch (error) {
        console.error('Error al parsear datos del cliente:', error);
        return {
            nombre: 'Cliente TeeLab',
            email: 'cliente@teelab.local',
            direccion: 'Dirección de entrega TeeLab'
        };
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
