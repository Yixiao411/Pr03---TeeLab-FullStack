import * as camisetasService from '../services/camisetas.services.js';
import { nextId } from '../data/comandas.js';
import fs from 'fs/promises';
import path from 'path';

const COMANDAS_FILE = path.join(process.cwd(), 'data', 'comandas.json');

// Data Access Functions
export async function getAll() {
    try {
        const data = await fs.readFile(COMANDAS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

export async function getByID(id) {
    const comandas = await getAll();
    return comandas.find(c => c.id == id);
}

// Order Creation Functions
export async function create(comanda) {
    const camisetas = camisetasService.getAll({});
    const validationError = validateOrder(comanda, camisetas);
    if (validationError) {
        return { error: validationError };
    }
    const comandas = await getAll();
    const ticket = generateTicket(comanda, comandas);
    const newOrder = buildOrderObject(ticket, comanda);
    await saveOrder(newOrder);
    return ticket;
}

function validateOrder(body, catalogoCamisetas) {
    const clientError = validateClient(body.cliente);
    if (clientError) return clientError;
    const itemsError = validateItems(body.items, catalogoCamisetas);
    if (itemsError) return itemsError;
    return null;
}

function validateClient(cliente) {
    if (!cliente || !cliente.nombre || cliente.nombre.length < 2) {
        return "Error: El nombre es obligatorio y debe tener al menos 2 letras.";
    }
    if (!cliente.email || !cliente.email.includes('@')) {
        return "Error: El email es obligatorio y debe tener un formato válido.";
    }
    return null;
}

function validateItems(items, catalogoCamisetas) {
    if (!items || items.length === 0) {
        return "Error: El pedido debe tener al menos 1 item.";
    }
    for (const item of items) {
        const itemError = validateSingleItem(item, catalogoCamisetas);
        if (itemError) return itemError;
    }
    return null;
}

function validateSingleItem(item, catalogoCamisetas) {
    if (item.cantidad < 1 || !Number.isInteger(item.cantidad)) {
        return "Error: La cantidad debe ser un número entero de 1 en adelante.";
    }
    const camiseta = catalogoCamisetas.find(c => c.id === item.camisetaId);
    if (!camiseta) {
        return `Error: La camiseta ${item.camisetaId} no existe en el catálogo.`;
    }
    if (!camiseta.tallas.includes(item.talla)) {
        return `Error: La talla ${item.talla} no existe para esta camiseta.`;
    }
    if (!camiseta.colores.includes(item.color)) {
        return `Error: El color ${item.color} no existe para esta camiseta.`;
    }
    return null;
}

function generateTicket(comanda, existingComandas) {
    const items = buildOrderItems(comanda.items);
    const total = calculateTotal(items);
    const id = generateUniqueId(existingComandas);
    const fecha = new Date();
    const estado = "recibida";
    return { data: { id, fecha, estado, items, total } };
}

function buildOrderItems(items) {
    return items.map(c => {
        const camiseta = camisetasService.getByID(c.camisetaId);
        return {
            camisetaId: camiseta.id,
            nombre: camiseta.nombre,
            talla: c.talla,
            color: c.color,
            cantidad: c.cantidad,
            precioUnitario: camiseta.precioBase,
            subtotal: camiseta.precioBase * c.cantidad
        };
    });
}

function calculateTotal(items) {
    return items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
}

function generateUniqueId(existingComandas) {
    let id;
    do {
        id = nextId();
    } while (existingComandas.some(c => c.id === id));
    return id;
}

function buildOrderObject(ticket, comanda) {
    return {
        id: ticket.data.id,
        fecha: ticket.data.fecha,
        estado: ticket.data.estado,
        cliente: comanda.cliente,
        direccion: comanda.direccion,
        items: ticket.data.items,
        total: ticket.data.total
    };
}

async function saveOrder(newOrder) {
    const comandas = await getAll();
    comandas.push(newOrder);
    await fs.writeFile(COMANDAS_FILE, JSON.stringify(comandas, null, 2));
}