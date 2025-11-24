const express = require('express');
const router = express.Router();
const empresasController = require('../controllers/empresaController');

router.get('/', empresasController.listarEmpresas);

router.get('/empresas/buscar', empresasController.buscarEmpresas);

router.post('/favorito', empresasController.toggleFavorito);

module.exports = router;
