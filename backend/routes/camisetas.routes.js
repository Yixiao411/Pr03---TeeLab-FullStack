import { Router } from "express"
import * as camisetasController from '../controllers/camisetas.controller.js';

const router = Router();

//Opcional query params
router.get("/", camisetasController.getAll);
router.get("/:id", camisetasController.getByID);


export default router;