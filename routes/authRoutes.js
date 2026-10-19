const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/register', authController.showRegister);
router.post('/register', authController.register);

router.get('/login', authController.showLogin);
router.post('/login', authController.login);

router.post('/logout', isAuthenticated, authController.logout);

router.get('/profile', isAuthenticated, authController.profile);

module.exports = router;
