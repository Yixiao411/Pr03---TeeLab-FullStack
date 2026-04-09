import * as comandasService from '../services/comandas.services.js';

export async function getAll(req, res) {
    try {
        const comandas = await comandasService.getAll();
        res.json(comandas);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getByID(req, res) {
    try {
        const comanda = await comandasService.getByID(req.params.id);

        if (!comanda) return res.status(404).json({ message: "Not Found" });
        res.json(comanda);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function create(req, res){
    try {
        let result = await comandasService.create(req.body);

        if (result.error) {
            const status = result.status || 400;
            return res.status(status).json({ message: result.error });
        }

        res.status(201).json({ message: "Created", tiquet: result.data });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}