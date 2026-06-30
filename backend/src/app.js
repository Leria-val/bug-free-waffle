// src/app.js
// Inicialização do Express, middlewares globais e registro de rotas

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ============================================
// MIDDLEWARES GLOBAIS
// ============================================

// CORS — permite requisições apenas do frontend configurado
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Parse de JSON e URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos de upload (protegido — em produção use S3 com URLs assinadas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// ROTAS DA API
// ============================================
const authRoutes     = require('./routes/authRoutes.js');
const triagemRoutes  = require('./routes/triagemroutes.js');
const casosRoutes    = require('./routes/casosRoutes.js');
const chatRoutes     = require('./routes/chatRoutes.js');
const adminRoutes    = require('./routes/adminRoutes.js');

app.use('/api/auth',     authRoutes);
app.use('/api/triagem',  triagemRoutes);
app.use('/api/casos',    casosRoutes);
app.use('/api/admin',    adminRoutes);

// Rotas de chat aninhadas sob /api/casos/:id
app.use('/api/casos/:id', chatRoutes);

// ============================================
// ROTA DE HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Justiça & Direito API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ============================================
// HANDLER DE ERROS GLOBAL
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ [ERROR]', err.stack);

  // Erros do Multer (upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: `Arquivo muito grande. Tamanho máximo: ${process.env.MAX_FILE_SIZE_MB || 50}MB.`,
    });
  }

  return res.status(err.status || 500).json({
    error: err.message || 'Erro interno no servidor.',
  });
});

// 404 para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

module.exports = app;