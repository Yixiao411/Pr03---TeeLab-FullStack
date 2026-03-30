export const comandas = [];

let contadorPedidos = 0;

export const nextId = () => {
    contadorPedidos++;

    return `ORD-${contadorPedidos.toString().padStart(4, '0')}`;
}
