// src/controllers/authController.js
// Login, registro de clientes e simulação de MFA (duas etapas)

const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { query } = require('../config/database.js');
require('dotenv').config();

// ──────────────────────────────────────────────
// POST /api/auth/login
// Valida credenciais. Clientes → JWT direto.
// Advogados/Admin → retorna código MFA fictício.
// ──────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const result = await query(
      `SELECT id, name, email, password_hash, role, mfa_secret, is_active
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        error: 'Conta desativada. Entre em contato com o administrador.',
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // CLIENTE → login direto sem MFA
    if (user.role === 'CLIENT') {
      return res.json({
        token: generateToken(user),
        user: sanitize(user),
        requiresMfa: false,
      });
    }

    // ADVOGADO / ADMIN → exige segunda etapa (MFA simulado)
    // Em produção o código seria enviado por SMS ou TOTP real
    return res.json({
      requiresMfa: true,
      mfaCode: user.mfa_secret,              // exibido na tela (fictício)
      tempToken: generateTempToken(user),    // expira em 5 min
      message: `Código MFA enviado para ${maskEmail(user.email)}`,
    });

  } catch (err) {
    console.error('[AUTH] Erro no login:', err.message);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

// ──────────────────────────────────────────────
// POST /api/auth/verify-mfa
// Segunda etapa: valida código MFA e emite JWT final
// ──────────────────────────────────────────────
const verifyMfa = async (req, res) => {
  const { tempToken, mfaCode } = req.body;

  if (!tempToken || !mfaCode) {
    return res.status(400).json({
      error: 'Token temporário e código MFA são obrigatórios.',
    });
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET + '_temp');
    } catch {
      return res.status(401).json({
        error: 'Sessão de MFA expirada. Faça login novamente.',
      });
    }

    const result = await query(
      'SELECT id, name, email, role, mfa_secret FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    const user = result.rows[0];

    if (mfaCode.trim() !== user.mfa_secret) {
      return res.status(401).json({ error: 'Código MFA inválido.' });
    }

    return res.json({
      token: generateToken(user),
      user: sanitize(user),
      requiresMfa: false,
    });

  } catch (err) {
    console.error('[AUTH] Erro no MFA:', err.message);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

// ──────────────────────────────────────────────
// POST /api/auth/register
// Registro público — apenas CLIENTES
// ──────────────────────────────────────────────
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: 'Nome, email e senha são obrigatórios.',
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      error: 'A senha deve ter no mínimo 8 caracteres.',
    });
  }

  try {
    const existing = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Este email já está cadastrado.' });
    }

    const hash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'CLIENT')
       RETURNING id, name, email, role, created_at`,
      [name.trim(), email.toLowerCase().trim(), hash]
    );

    const newUser = result.rows[0];

    return res.status(201).json({
      token: generateToken(newUser),
      user: newUser,
      message: 'Conta criada com sucesso.',
    });

  } catch (err) {
    console.error('[AUTH] Erro no registro:', err.message);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

// ──────────────────────────────────────────────
// GET /api/auth/me
// Retorna dados do usuário autenticado
// ──────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('[AUTH] Erro em getMe:', err.message);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

// ── Helpers ─────────────────────────────────
const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

const generateTempToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET + '_temp',
    { expiresIn: '5m' }
  );

const sanitize = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  return `${local[0]}***@${domain}`;
};

module.exports = { login, verifyMfa, register, getMe };