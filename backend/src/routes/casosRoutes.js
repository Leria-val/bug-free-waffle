// src/routes/casosRoutes.js
const express = require('express');
const router  = express.Router();
const { getCasos, getCasoById, updateStatus, assignLawyer } = require('../controllers/casoController.js');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware.js');
const sigiloMiddleware                = require('../middleware/sigiloMiddleware.js');

router.get('/',    authMiddleware, getCasos);

// sigiloMiddleware verifica se o usuário tem acesso a este caso específico
router.get('/:id', authMiddleware, sigiloMiddleware, getCasoById);

router.patch('/:id/status',
  authMiddleware,
  requireRole(['LAWYER', 'ADMIN']),
  sigiloMiddleware,
  updateStatus
);

// Apenas Admin pode atribuir advogados
router.patch('/:id/assign',
  authMiddleware,
  requireRole('ADMIN'),
  assignLawyer
);

module.exports = router;