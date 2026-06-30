// src/models/Usuario.js
// Helpers de queries para a tabela users

const { query } = require('../config/database,js');
const bcrypt = require('bcryptjs');

const Usuario = {
  /**
   * Busca usuário por ID
   */
  findById: async (id) => {
    const result = await query(
      'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Busca usuário por email (inclui password_hash para auth)
   */
  findByEmail: async (email) => {
    const result = await query(
      'SELECT id, name, email, password_hash, role, mfa_secret, is_active FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    return result.rows[0] || null;
  },

  /**
   * Lista todos os advogados (para Admin e clientes verem perfis)
   */
  findAllLawyers: async () => {
    const result = await query(
      `SELECT id, name, email, created_at FROM users WHERE role = 'LAWYER' AND is_active = TRUE ORDER BY name ASC`
    );
    return result.rows;
  },

  /**
   * Lista todos os clientes (para Admin)
   */
  findAllClients: async () => {
    const result = await query(
      `SELECT id, name, email, created_at FROM users WHERE role = 'CLIENT' AND is_active = TRUE ORDER BY name ASC`
    );
    return result.rows;
  },

  /**
   * Cria um novo usuário (ADMIN cria advogados; registro público cria clientes)
   */
  create: async ({ name, email, password, role, mfa_secret }) => {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, mfa_secret)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, created_at`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, role, mfa_secret || null]
    );
    return result.rows[0];
  },

  /**
   * Ativa ou desativa uma conta (Admin)
   */
  setActive: async (id, is_active) => {
    const result = await query(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, is_active',
      [is_active, id]
    );
    return result.rows[0] || null;
  },

  /**
   * Atualiza o MFA secret de um usuário
   */
  updateMfaSecret: async (id, mfa_secret) => {
    await query(
      'UPDATE users SET mfa_secret = $1, updated_at = NOW() WHERE id = $2',
      [mfa_secret, id]
    );
  },
};

module.exports = Usuario;