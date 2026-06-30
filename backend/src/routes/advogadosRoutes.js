// src/routes/advogados.routes.js
// Rotas PÚBLICAS — sem authMiddleware. Usadas pela BuscaAdvogados.jsx

const express = require('express');
const router  = express.Router();
const { getAdvogadosPublico, getAdvogadoPreview } = require('../controllers/advogadoController');

router.get('/',     getAdvogadosPublico);  // GET /api/advogados?area=Direito Civil
router.get('/:id',  getAdvogadoPreview);   // GET /api/advogados/:id

module.exports = router;