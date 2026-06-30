// src/routes/triagemRoutes.js
const express = require('express');
const router  = express.Router();
const { submitTriagem, getAreas } = require('../controllers/triagemController.js');
const { authMiddleware }          = require('../middleware/authMiddleware.js');

router.get('/areas', getAreas);                  // público — lista áreas
router.post('/', authMiddleware, submitTriagem); // requer login de cliente

module.exports = router;