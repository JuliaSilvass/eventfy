const express = require("express");
const router = express.Router();
const empresaController = require("../controllers/empresaController");

router.get("/", empresaController.listarEmpresas);

router.post("/favorito", empresaController.toggleFavorito);

module.exports = router;