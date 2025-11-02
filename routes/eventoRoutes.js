const express = require("express");
const router = express.Router();
const eventoController = require("../controllers/eventoController");

router.get("/novo", eventoController.getNovoEvento);

router.post("/novo", eventoController.createNovoEvento);

module.exports = router;
