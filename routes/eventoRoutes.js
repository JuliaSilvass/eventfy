const express = require("express");
const router = express.Router();
const eventoController = require("../controllers/eventoController");

router.get("/", eventoController.listarEventos); 
router.get("/novo", eventoController.getNovoEvento);
router.post("/novo", eventoController.createNovoEvento);

router.get("/:id/adicionar-servicos", eventoController.getAdicionarServicos);
router.post("/:idEvento/adicionar/:idServico", eventoController.postAdicionarServicoAoEvento);
router.post("/:idEvento/remover/:idServicoVinculado", eventoController.postRemoverServicoDoEvento);
router.post("/:id/cancelar", eventoController.cancelarCriacaoEvento);

router.get("/visualizar/:id", eventoController.visualizarEvento);
router.get("/editar/:id", eventoController.getEditarEvento);
router.post("/editar/:id", eventoController.editarEventoPost);
router.delete("/excluir/:id", eventoController.excluirEvento);

router.get("/:idEvento/avaliar/:idServico", eventoController.getAvaliacaoServico);
router.post("/:idEvento/avaliar/:idServico", eventoController.postAvaliacaoServico);

module.exports = router;