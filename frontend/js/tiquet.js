const LOCAL_STORAGE_KEY = 'comanda';
const LOCAL_STORAGE_SENT_FLAG = 'comanda_enviada';

function initTiquet() {
    const comanda = loadComanda();
    const section = document.getElementById('tiquet_section');

    if (!comanda || comanda.length === 0) {
        section.innerHTML = '<p>No se ha encontrado ninguna comanda. Vuelve al inicio y realiza un pedido.</p>';
        appendBackButton(section);
        return;
    }

    saveComanda(comanda);
    renderTiquet(comanda);
    sendComandaIfNeeded(comanda);
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

function renderTiquet(comanda) {
    const section = document.getElementById('tiquet_section');
    let totalItems = 0;
    let totalPrice = 0;
    let inner = '<h2>Tu tiquet</h2>';

    comanda.forEach(item => {
        const itemTotal = item.precio * item.cantidad;
        totalItems += item.cantidad;
        totalPrice += itemTotal;
        inner += `
            <article class="producto product-card">
                <div class="producto-body">
                    <h3>${item.nombre}</h3>
                    <div class="producto-meta-grid">
                        <span>Talla: ${item.talla}</span>
                        <span>Color: ${item.color}</span>
                        <span>Cantidad: ${item.cantidad}</span>
                    </div>
                    <p class="producto-price">Precio unitario: $${item.precio.toFixed(2)}</p>
                    <p class="producto-price-subtotal">Subtotal: $${itemTotal.toFixed(2)}</p>
                </div>
            </article>
        `;
    });

    inner += `
        <p>Total de articulos: ${totalItems}</p>
        <p>Precio total: $${totalPrice.toFixed(2)}</p>
    `;

    section.innerHTML = inner;
    appendBackButton(section);
}

function appendBackButton(container) {
    const button = document.createElement('button');
    button.type = 'button';
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
        return;
    }

    const payload = {
        cliente: {
            nombre: 'Cliente TeeLab',
            email: 'cliente@teelab.local'
        },
        direccion: 'Dirección de entrega TeeLab',
        items: comanda.map(item => ({
            camisetaId: item.productoId,
            talla: item.talla,
            color: item.color,
            cantidad: item.cantidad
        }))
    };

    try {
        const response = await fetch('http://localhost:3001/comandas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error en la petición de tiquet ${response.status}: ${errorText}`);
        }

        const resultado = await response.json();
        console.log('Respuesta de la API:', resultado);
        localStorage.setItem(LOCAL_STORAGE_SENT_FLAG, 'true');
    } catch (error) {
        console.error('Error al enviar la comanda:', error);
    }
}

initTiquet();
