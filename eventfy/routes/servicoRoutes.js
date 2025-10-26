const express = require('express');
const router = express.Router();
const servicoController = require('../controllers/servicoController');

const ensureUpload = (req, res, next) => {
  if (!req._upload) {
    const multer = require('multer');
    const path = require('path');
    req._upload = multer({ dest: path.join(__dirname, '..', 'public', 'uploads') });
  }
  next();
};

router.get('/', servicoController.listarServicos);
router.get('/cadastrar', servicoController.getServicoForm);
router.post('/cadastrar', ensureUpload, (req, res, next) => req._upload.array('imagens', 5)(req, res, next), servicoController.createServicoPost);
router.delete('/apagar/:id', servicoController.apagarServico);

module.exports = router;
