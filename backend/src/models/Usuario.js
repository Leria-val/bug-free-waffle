// src/models/Usuario.js
const { query } = require('../config/database.js');
const bcrypt    = require('bcryptjs');

const Usuario = {
  findById: async (id) => {
    const result = await query(
      'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  findByEmail: async (email) => {
    const result = await query(
      'SELECT id, name, email, password_hash, role, mfa_secret, is_active FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    return result.rows[0] || null;
  },

  findAllLawyers: async () => {
    const result = await query(
      `SELECT id, name, email, created_at FROM users
       WHERE role = 'LAWYER' AND is_active = TRUE ORDER BY name ASC`
    );
    return result.rows;
  },

  findAllClients: async () => {
    const result = await query(
      `SELECT id, name, email, created_at FROM users
       WHERE role = 'CLIENT' AND is_active = TRUE ORDER BY name ASC`
    );
    return result.rows;
  },

  // ✅ Sem area_atuacao/bio — colunas não existem na tabela users
  create: async ({ name, email, password, role, mfa_secret }) => {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, mfa_secret)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, created_at`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, role, mfa_secret || null]
    );
    return result.rows[0];
  },

  setActive: async (id, is_active) => {
    const result = await query(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, is_active',
      [is_active, id]
    );
    return result.rows[0] || null;
  },

  updateMfaSecret: async (id, mfa_secret) => {
    await query(
      'UPDATE users SET mfa_secret = $1, updated_at = NOW() WHERE id = $2',
      [mfa_secret, id]
    );
  },
};

module.exports = Usuario;