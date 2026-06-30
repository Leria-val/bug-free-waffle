// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getUsuarios, criarAdvogado, toggleAtivacao, getRelatorio } = require('../controllers/adminController.js');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware.js');

// Todas as rotas admin exigem autenticação + role ADMIN
router.use(authMiddleware, requireRole('ADMIN'));

router.get('/usuarios',              getUsuarios);
router.post('/advogados',            criarAdvogado);
router.patch('/usuarios/:id/ativar', toggleAtivacao);
router.get('/relatorio',             getRelatorio);

module.exports = router;