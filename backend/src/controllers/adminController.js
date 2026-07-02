// src/controllers/adminController.js
// Funções exclusivas do Admin: criar advogados, gerenciar contas, ver relatórios

const { query } = require('../config/database.js');
const Usuario = require('../models/Usuario.js');
const Caso = require('../models/Caso.js');
const bcrypt = require('bcryptjs');

/**
 * GET /api/admin/usuarios
 * Lista todos os usuários (Admin only)
 */
const getUsuarios = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, role, is_active, created_at
       FROM users ORDER BY role ASC, name ASC`
    );
    return res.json({ users: result.rows });
  } catch (error) {
    console.error('[ADMIN] Erro ao listar usuários:', error.message);
    return res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
};

/**
 * POST /api/admin/advogados
 * Cria um novo advogado com email profissional da firma
 * Apenas Admin pode criar contas de LAWYER
 */
const AREAS_ATUACAO = [
  'Direito Civil', 'Direito Criminal', 'Direito Trabalhista', 'Direito de Família',
  'Direito Empresarial', 'Direito Tributário', 'Direito Previdenciário',
  'Direito do Consumidor', 'Direito Imobiliário', 'Direito Digital',
];

const criarAdvogado = async (req, res) => {
  const { name, email, password, mfa_secret, area_atuacao, bio } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }

  if (!area_atuacao || !AREAS_ATUACAO.includes(area_atuacao)) {
    return res.status(400).json({ error: 'Selecione uma área de atuação válida para o advogado.' });
  }

  // Email deve ser do domínio da firma
  if (!email.endsWith('@justicaedireito.adv.br')) {
    return res.status(400).json({
      error: 'O email do advogado deve usar o domínio @justicaedireito.adv.br',
    });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'A senha deve ter no mínimo 8 caracteres.' });
  }

  try {
    // Verifica duplicidade
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Este email já está cadastrado.' });
    }

    // Gera MFA secret padrão se não informado (6 dígitos aleatórios)
    const mfa = mfa_secret || String(Math.floor(100000 + Math.random() * 900000));

    const novoAdvogado = await Usuario.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'LAWYER',
      mfa_secret: mfa,
      area_atuacao,
      bio: bio || null,
    });

    console.log(`👤 [ADMIN] Advogado criado: ${novoAdvogado.email} por Admin ${req.user.email}`);

    return res.status(201).json({
      message: `Advogado ${novoAdvogado.name} criado com sucesso.`,
      user: novoAdvogado,
      mfa_secret: mfa, // Exibido uma vez para o Admin repassar ao advogado
    });

  } catch (error) {
    console.error('[ADMIN] Erro ao criar advogado:', error.message);
    return res.status(500).json({ error: 'Erro ao criar advogado.' });
  }
};

/**
 * PATCH /api/admin/usuarios/:id/ativar
 * Ativa ou desativa uma conta
 */
const toggleAtivacao = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'Campo is_active deve ser true ou false.' });
  }

  // Protege a conta do próprio Admin
  if (id === req.user.id) {
    return res.status(400).json({ error: 'Você não pode desativar sua própria conta.' });
  }

  try {
    const updated = await Usuario.setActive(id, is_active);
    if (!updated) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json({
      message: `Conta ${is_active ? 'ativada' : 'desativada'} com sucesso.`,
      user: updated,
    });
  } catch (error) {
    console.error('[ADMIN] Erro ao atualizar ativação:', error.message);
    return res.status(500).json({ error: 'Erro ao atualizar conta.' });
  }
};

/**
 * GET /api/admin/relatorio
 * Painel de relatório geral para o Admin
 */
const getRelatorio = async (req, res) => {
  try {
    const [totalUsers, totalCases, pendingCases, lawyersStats] = await Promise.all([
      // Total de usuários por role
      query(`SELECT role, COUNT(*) AS total FROM users GROUP BY role`),

      // Total de casos por status
      query(`SELECT status, COUNT(*) AS total FROM cases GROUP BY status`),

      // Casos sem advogado atribuído
      query(`SELECT COUNT(*) AS total FROM cases WHERE lawyer_id IS NULL`),

      // Performance por advogado
      query(`
        SELECT u.name, u.email, COUNT(c.id) AS total_casos,
               COUNT(CASE WHEN c.status = 'CONCLUIDO' THEN 1 END) AS concluidos
        FROM users u
        LEFT JOIN cases c ON c.lawyer_id = u.id
        WHERE u.role = 'LAWYER'
        GROUP BY u.id, u.name, u.email
        ORDER BY total_casos DESC
      `),
    ]);

    return res.json({
      usuarios: totalUsers.rows.reduce((acc, r) => ({ ...acc, [r.role]: parseInt(r.total) }), {}),
      casos: totalCases.rows.reduce((acc, r) => ({ ...acc, [r.status]: parseInt(r.total) }), {}),
      casos_sem_advogado: parseInt(pendingCases.rows[0]?.total || 0),
      advogados: lawyersStats.rows,
    });

  } catch (error) {
    console.error('[ADMIN] Erro ao gerar relatório:', error.message);
    return res.status(500).json({ error: 'Erro ao gerar relatório.' });
  }
};

module.exports = { getUsuarios, criarAdvogado, toggleAtivacao, getRelatorio };