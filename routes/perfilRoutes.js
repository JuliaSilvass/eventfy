const express = require("express");
const router = express.Router();
const perfilController = require("../controllers/perfilController");

router.get("/", perfilController.getMeuPerfil);

router.get("/editar", perfilController.getEditarPerfilForm);
router.post("/editar", perfilController.updatePerfil);

router.post("/descricao", perfilController.updateDescricao);
router.post(
  "/upload-foto",
  perfilController.uploadMiddleware,
  perfilController.uploadFotoPerfil
);

router.get("/fornecedor/:id/avaliacoes", perfilController.getAvaliacoesFornecedor);


module.exports = router;