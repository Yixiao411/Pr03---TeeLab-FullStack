import * as comandasService from '../services/comandas.services.js';

export function getAll(req, res) {
 res.json(comandasService.getAll());
}

export function getByID(req, res) {
 const comanda = comandasService.getByID(req.params.id);

 if (!comanda) return res.status(404).json({ message: "Not Found" });
 res.json(comanda);
}

export function create(req, res){
    let result = comandasService.create(req.body);

    if (result.error) {
        const status = result.status || 400;
        return res.status(status).json({ message: result.error });
    }

    res.status(201).json({ message: "Created", tiquet: result.data });
}