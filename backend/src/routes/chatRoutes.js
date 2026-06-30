// src/routes/chatRoutes.js
// Rotas aninhadas sob /api/casos/:id — todas protegidas por sigilo
const express = require('express');
const router  = express.Router({ mergeParams: true }); // herda :id do parent
const { getMensagens, sendMensagem, uploadDocumento, getDocumentos } = require('../controllers/chatController.js');
const { authMiddleware }  = require('../middleware/authMiddleware.js');
const sigiloMiddleware    = require('../middleware/sigiloMiddleware.js');
const upload              = require('../config/multer.js');

// authMiddleware + sigiloMiddleware em todas as rotas do chat
router.use(authMiddleware, sigiloMiddleware);

router.get('/mensagens',                        getMensagens);
router.post('/mensagens',                       sendMensagem);
router.get('/documentos',                       getDocumentos);
router.post('/documentos', upload.single('file'), uploadDocumento);

module.exports = router;