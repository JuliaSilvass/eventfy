const express = require('express');
const router = express.Router();
const servicoController = require('../controllers/servicoController');
const multer = require('multer');
const upload = multer();

//Formulário de cadastro
router.get('/cadastrar', servicoController.getServicoForm);

//Receber dados do formulário
router.post('/cadastrar', upload.any(), servicoController.createServicoPost);

// Listar serviços
router.get('/', servicoController.listarServicos);

module.exports = router;
