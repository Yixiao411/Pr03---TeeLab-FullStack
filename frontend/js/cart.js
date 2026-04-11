function loadCart(name = "cart") {
    const cookieValue = document.cookie
        .split("; ")
        .find(c => c.startsWith(name + '='))
        ?.split('=')[1] ?? null;

    return cookieValue ? decodeURIComponent(cookieValue) : null;
}

function renderCart() {
    const cartData = loadCart();
    const contenedor = document.getElementById('cart_section');

    if (!cartData) {
        console.log('No hay carrito guardado, iniciando uno nuevo.');
        return;
    }

    cart = JSON.parse(cartData);
    const { countItems, totalPrice, inner } = buildCartContent(cart);
    setCartTotals(countItems, totalPrice);
    contenedor.innerHTML = inner;
}

function buildCartContent(cart) {
    let countItems = 0;
    let totalPrice = 0;
    let inner = "";

    cart.forEach(p => {
        countItems += p.cantidad;
        totalPrice += p.precio * p.cantidad;
        console.log('Producto en carrito:', p);
        inner += buildCartItemHTML(p);
    });

    return { countItems, totalPrice, inner };
}

function buildCartItemHTML(p) {
    return `
        <article class="cart-item">
            <img src="${p.imagen || ''}" alt="${p.nombre}" width="150">
            <div class="producto-body">
                <h3>${p.nombre}</h3>
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
                </div>
                <button type="button" onclick="removeFromCart('${p.productoId}', '${p.talla}', '${p.color}')" class="button button-secondary">Eliminar</button>
            </div>
        </article>
    `;
}

function setCartTotals(countItems, totalPrice) {
    document.getElementById('total_items').textContent = `Total de artículos: ${countItems}`;
    document.getElementById('total_price').textContent = `Precio total: $${totalPrice.toFixed(2)}`;
}

function removeFromCart(productoId, talla, color) {
    cart = cart.filter(p => !(p.productoId === productoId && p.talla === talla && p.color === color));
    saveCart(JSON.stringify(cart));
    renderCart();
}

function removeAllFromCart() {
    cart = [];
    saveCart(JSON.stringify(cart));
    renderCart();
}

function saveOrderToLocalStorage(order) {
    localStorage.setItem('comanda', JSON.stringify(order));
    localStorage.removeItem('comanda_enviada');
}

const modal = document.querySelector("#formPopup");
const btnCheckout = document.getElementById('checkout');
const btnCancelar = document.querySelector("#btnCancelar");
const formulario = document.querySelector("#formulario-envio");

btnCheckout.addEventListener('click', () => {
    if (cart.length === 0) {
        alert("El carrito está vacío. Agrega productos antes de finalizar la compra.");
        return;
    }
    modal.showModal();
});

btnCancelar.addEventListener("click", () => {
    modal.close();
});

formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = new FormData(formulario);
    const clienteData = {
        nombre: datos.get("nombre"),
        email: datos.get("email"),
        direccion: datos.get("direccion")
    };
    console.log("Cliente:", clienteData);
    localStorage.setItem('cliente', JSON.stringify(clienteData));
    modal.close();
    formulario.reset();
    checkout();
});


function checkout() {
    saveOrderToLocalStorage(cart);
    alert("¡Compra finalizada! Gracias por tu pedido.");
    window.location.href = "tiquet.html";
    removeAllFromCart();
}

async function pushTiquet() {
    try {
        const data = new FormData(formulario);
        const response = await fetch("http://localhost:3001/comandas", {
            method: "POST",
            body: JSON.stringify({ 
                client: [data.get("nombre"), data.get("email")],
                items: cart
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la petición de tiquet ${response.status}`);
        }
        const resultado = await response.json();
        console.log('Respuesta de la API:', resultado);
    } catch (error) {
        console.error('Error al enviar los datos:', error);
    }
}
