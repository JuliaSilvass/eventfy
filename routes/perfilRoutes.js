const express = require("express");
const router = express.Router();
const perfilController = require("../controllers/perfilController");


router.get("/", perfilController.getPerfilOrganizador);

module.exports = router;
