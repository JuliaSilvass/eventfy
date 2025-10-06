const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
=======
const { register, login, logout } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
>>>>>>> dfb333c2c8b9a75014e2b5fdda7ab8c04300381f

module.exports = router;