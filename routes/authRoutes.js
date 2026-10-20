const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validateData');

router.get('/register', authController.showRegister);
router.post('/register', validateRegistration, authController.register);

router.get('/login', authController.showLogin);
router.post('/login', validateLogin, authController.login);

router.post('/logout', isAuthenticated, authController.logout);

router.get('/profile', isAuthenticated, authController.profile);

module.exports = router;
