import express from "express";
import {
  obtenerSesiones,
  crearSesion,
  finalizarSesion,
  editarDuracion,
  cancelarSesion,
  cancelarSesionEnProgreso,
  restaurarSesion,
  obtenerSesionEnProgreso,
} from "../controllers/sesionesController.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verificarToken, obtenerSesiones);
router.post("/", verificarToken, crearSesion);
router.put("/:id", verificarToken, finalizarSesion);
router.patch("/:id/duracion", verificarToken, editarDuracion);
router.patch("/:id/cancelar", verificarToken, cancelarSesion);
router.patch(
  "/:id/cancelar-en-progreso",
  verificarToken,
  cancelarSesionEnProgreso,
);
router.patch("/:id/restaurar", verificarToken, restaurarSesion);
router.get("/en-progreso", verificarToken, obtenerSesionEnProgreso);

export default router;
