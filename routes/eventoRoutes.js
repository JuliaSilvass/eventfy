const express = require("express");
const router = express.Router();
const eventoController = require("../controllers/eventoController");

router.get("/", eventoController.listarEventos); 
router.get("/novo", eventoController.getNovoEvento);
router.post("/novo", eventoController.createNovoEvento);

router.get("/editar/:id", eventoController.getEditarEvento);
router.post("/editar/:id", eventoController.editarEventoPost);
router.delete("/excluir/:id", eventoController.excluirEvento);


module.exports = router;
