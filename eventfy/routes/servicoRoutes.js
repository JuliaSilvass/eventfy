const express = require('express');
const router = express.Router();
const servicoController = require('../controllers/servicoController');

// Importa o multer, que é o nosso "tradutor" de formulários
const multer = require('multer');

// Configura o multer. A opção vazia já é suficiente para ele ler os dados.
const upload = multer();

// Rota para MOSTRAR o formulário (GET)
router.get('/cadastrar', servicoController.getServicoForm);

// Rota para RECEBER os dados do formulário (POST)
// A linha abaixo é a mais importante.
// O `upload.any()` ativa o multer para LER o formulário antes de continuar.
router.post('/cadastrar', upload.any(), servicoController.createServicoPost);

module.exports = router;