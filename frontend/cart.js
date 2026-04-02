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
    if (cartData) {
        cart = JSON.parse(cartData);
        let inner = "";
        cart.forEach(p => {
            inner += `
                <div class="producto">
                    <h3>${p.nombre}</h3>
                    <p>Talla: ${p.talla}</p>
                    <p>Color: ${p.color}</p>
                    <p>Cantidad: ${p.cantidad}</p>
                    <p>Precio: $${p.precio.toFixed(2)}</p>
                    <p>Total: $${(p.precio * p.cantidad).toFixed(2)}</p>
                </div>
        `;
        });
        contenedor.innerHTML = inner;
    } else {
        console.log('No hay carrito guardado, iniciando uno nuevo.');
    }
}