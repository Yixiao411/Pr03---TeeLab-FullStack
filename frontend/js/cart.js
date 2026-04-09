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

    let countItems = 0;
    let totalPrice = 0;

    if (cartData) {
        cart = JSON.parse(cartData);
        let inner = "";
        cart.forEach(p => {
            countItems += p.cantidad;
            totalPrice += p.precio * p.cantidad;
            console.log('Producto en carrito:', p);
            inner += `
                <article class="producto product-card">
                    <img src="${p.imagen || ''}" alt="${p.nombre}" width="200">
                    <div class="producto-body">
                        <h3>${p.nombre}</h3>
                        <div class="producto-meta-grid">
                            <span>Talla: ${p.talla}</span>
                            <span>Color: ${p.color}</span>
                            <span>Cantidad: ${p.cantidad}</span>
                        </div>
                        <p class="producto-price">Precio: $${p.precio.toFixed(2)}</p>
                        <p class="producto-price-subtotal">Total: $${(p.precio * p.cantidad).toFixed(2)}</p>
                        <button type="button" onclick="removeFromCart('${p.productoId}', '${p.talla}', '${p.color}')" class="button button-secondary">Eliminar</button>
                    </div>
                </article>
            `;
        });
        document.getElementById('total_items').textContent = `Total de artículos: ${countItems}`;
        document.getElementById('total_price').textContent = `Precio total: $${totalPrice.toFixed(2)}`;

        contenedor.innerHTML = inner;
    } else {
        console.log('No hay carrito guardado, iniciando uno nuevo.');
    }
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

function checkout() {
    if (cart.length === 0) {
        alert("El carrito está vacío. Agrega productos antes de finalizar la compra.");
        return;
    }
    saveOrderToLocalStorage(cart);
    alert("¡Compra finalizada! Gracias por tu pedido.");
    window.location.href = "tiquet.html";
    removeAllFromCart();
}

async function pushTiquet() {
  try {
    const response = await fetch("http://localhost:3001/comandas", {
        method: "POST",
        body: JSON.stringify({ items: cart }),
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
