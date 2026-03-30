import * as camisetasService from '../services/camisetas.services.js';

export function getAll(req, res, next) {
    const { talla, color, tag, q, sort } = req.query;

    const validSorts = ['precio_asc', 'precio_desc', 'nombre_asc', 'nombre_desc'];

    if (sort && !validSorts.includes(sort)) {
        return res.status(400).json({
            error: `Sort no reconocido. Valores permitidos: ${validSorts.join(', ')}`
        });
    }

    const camisetas = camisetasService.getAll({ talla, color, tag, q, sort });

    res.status(200).json(camisetas);

};


export function getByID(req, res) {
    const camiseta = camisetasService.getByID(req.params.id);

    if (!camiseta) return res.status(404).json({ message: "Not Found" });
    res.json(camiseta);
}