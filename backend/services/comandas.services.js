import * as camisetasService from '../services/camisetas.services.js';
import { nextId } from '../data/comandas.js';
import fs from 'fs/promises';
import path from 'path';

const COMANDAS_FILE = path.join(process.cwd(), 'data', 'comandas.json');

export async function getAll(){
    try {
        const data = await fs.readFile(COMANDAS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty array
        return [];
    }
}

export async function getByID(id){
    const comandas = await getAll();
    return comandas.find(c => c.id == id);
}

export async function create(comanda){
    const camisetas = camisetasService.getAll({});
    const valida = validarPedido(comanda, camisetas);

    if(valida){
        return { error : valida };
    }

    const comandas = await getAll();
    const tiquetGenerado = await generarTiquet(comanda, comandas);

    let newComanda = {
        id: tiquetGenerado.data.id,
        fecha: tiquetGenerado.data.fecha,
        estado: tiquetGenerado.data.estado,
        cliente: comanda.cliente,       
        direccion: comanda.direccion,   
        items: tiquetGenerado.data.items,    
        total: tiquetGenerado.data.total     
    };
    
    // Save to file
    try {
        comandas.push(newComanda);
        await fs.writeFile(COMANDAS_FILE, JSON.stringify(comandas, null, 2));
    } catch (error) {
        console.error('Error saving order to file:', error);
        return { error: 'Error saving order' };
    }

    return tiquetGenerado;
}

async function generarTiquet(comanda, existingComandas){
    let precio = 0;
    let compras = [];

    for (let c of comanda.items){
        let camiseta = camisetasService.getByID(c.camisetaId);
        
        let obj = {
            camisetaId: camiseta.id,
            nombre: camiseta.nombre,
            talla: c.talla,
            color: c.color,
            cantidad: c.cantidad,
            precioUnitario: camiseta.precioBase,
            subtotal: camiseta.precioBase*c.cantidad
        };

        precio += parseFloat(obj.subtotal);
        compras.push(obj);
    }

    let id;
    do {
        id = nextId();
    } while (existingComandas.some(c => c.id === id));

    let tiquet = {
        id,
        fecha: new Date(),
        estado: "recibida",
        items: compras,
        total: precio
    }

    return { data: tiquet };
}

export const validarPedido = (body, catalogoCamisetas) => {
  // 1. Validar Cliente
  if (!body.cliente || !body.cliente.nombre || body.cliente.nombre.length < 2) {
    return "Error: El nombre es obligatorio y debe tener al menos 2 letras.";
  }

  // Formato de email
  if (!body.cliente.email || !body.cliente.email.includes('@')) {
    return "Error: El email es obligatorio y debe tener un formato válido.";
  }

  // 2. Validar que no sea vacio
  if (!body.items || body.items.length == 0) {
    return "Error: El pedido debe tener al menos 1 item.";
  }

  // 3. Validar los items
  for (const item of body.items) {
    
    if (item.cantidad < 1 || !Number.isInteger(item.cantidad)) {
      return "Error: La cantidad debe ser un número entero de 1 en adelante.";
    }

    // Buscamos la camiseta
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
  }

  return null; 
};