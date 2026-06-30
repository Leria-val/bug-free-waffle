// src/middleware/authMiddleware.js
// Valida o token JWT e extrai o perfil do usuário (id, email, role, name)

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware principal de autenticação.
 * Deve ser usado em todas as rotas protegidas.
 * Injeta req.user = { id, email, role, name }
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Acesso não autorizado.',
      message: 'Token de autenticação não fornecido.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, name, iat, exp }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Sessão expirada.',
        message: 'Faça login novamente para continuar.',
      });
    }
    return res.status(401).json({
      error: 'Token inválido.',
      message: 'Autenticação falhou.',
    });
  }
};

/**
 * Middleware de autorização por role.
 * Uso: requireRole('ADMIN') ou requireRole(['ADMIN', 'LAWYER'])
 */
const requireRole = (roles) => {
  const allowed = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acesso Restrito/Confidencial',
        message: `Área restrita a: ${allowed.join(', ')}.`,
      });
    }
    next();
  };
};

module.exports = { authMiddleware, requireRole };