const express = require("express");
const router = express.Router();
const notificacaoController = require("../controllers/notificacaoController");

router.get("/dados", notificacaoController.obterNotificacoes);
router.post("/lida/:id", notificacaoController.marcarComoLida);

module.exports = router;