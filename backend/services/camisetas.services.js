import { camisetas } from '../data/camisetas.js';
/*
export function getAll(){
    //... hace una copia
    return camisetas.map(({ imagenes, tags, ...rest }) => rest);
}
*/
export function getAll(filtros) {
    let resultados = [...camisetas];

    //FILTROS
    if (filtros.talla) {
        resultados = resultados.filter(c => c.tallas.includes(filtros.talla));
    }

    if (filtros.color) {
        resultados = resultados.filter(c => c.colores.includes(filtros.color));
    }

    if (filtros.tag) {
        resultados = resultados.filter(c => c.tag === filtros.tag || c.tags?.includes(filtros.tag));
    }

    if (filtros.q) {
        const busqueda = filtros.q.toLowerCase();
        resultados = resultados.filter(c => 
            c.nombre.toLowerCase().includes(busqueda) || 
            c.descripcion.toLowerCase().includes(busqueda)
        );
    }

    //SORT
    if (filtros.sort) {
        switch (filtros.sort) {
            case 'precio_asc':
                resultados.sort((a, b) => a.precioBase - b.precioBase);
                break;
            case 'precio_desc':
                resultados.sort((a, b) => b.precioBase - a.precioBase);
                break;
            case 'nombre_asc':
                resultados.sort((a, b) => a.nombre.localeCompare(b.nombre));
                break;
            case 'nombre_desc':
                resultados.sort((a, b) => b.nombre.localeCompare(a.nombre));
                break;
        }
    }

    return resultados;
}


export function getByID(id){
    return camisetas.find(c => c.id == id);
}