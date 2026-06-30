// src/config/multer.js
// Configuração de upload de arquivos PDF/Imagens (até 50MB)

const multer = require('multer');
const path   = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Nome único com UUID para evitar colisões
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});

// Apenas PDF e imagens permitidos
const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Envie apenas PDF ou imagens.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 50) * 1024 * 1024,
  },
});

module.exports = upload;