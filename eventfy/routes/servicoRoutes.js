const express = require('express');
const router = express.Router();
const servicoController = require('../controllers/servicoController');

router.get('/cadastrar', servicoController.getServicoForm);

module.exports = router;