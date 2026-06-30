// src/routes/authRoutes.js
const express = require('express');
const router  = express.Router();
const { login, verifyMfa, register, getMe } = require('../controllers/authController.js');
const { authMiddleware } = require('../middleware/authMiddleware.js');

router.post('/login',       login);
router.post('/verify-mfa',  verifyMfa);
router.post('/register',    register);
router.get('/me',           authMiddleware, getMe);

module.exports = router;