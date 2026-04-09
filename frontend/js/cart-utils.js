function saveCart(value, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `cart=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function loadCart(name = "cart") {
    const cookieValue = document.cookie
        .split("; ")
        .find(c => c.startsWith(name + '='))
        ?.split('=')[1] ?? null;

    return cookieValue ? JSON.parse(decodeURIComponent(cookieValue)) : [];
}