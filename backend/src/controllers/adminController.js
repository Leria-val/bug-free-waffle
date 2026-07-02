// src/controllers/adminController.js
const { query }  = require('../config/database.js');
const Usuario    = require('../models/Usuario.js');

const AREAS_ATUACAO = [
  'Direito Civil','Direito Criminal','Direito Trabalhista','Direito de Família',
  'Direito Empresarial','Direito Tributário','Direito Previdenciário',
  'Direito do Consumidor','Direito Imobiliário','Direito Digital',
];

// GET /api/admin/usuarios
const getUsuarios = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, role, is_active, created_at
       FROM users ORDER BY role ASC, name ASC`
    );
    return res.json({ users: result.rows });
  } catch (err) {
    console.error('[ADMIN] Erro ao listar usuários:', err.message);
    return res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
};

// POST /api/admin/advogados
const criarAdvogado = async (req, res) => {
  const { name, email, password, mfa_secret } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }
  if (!email.endsWith('@justicaedireito.adv.br')) {
    return res.status(400).json({ error: 'O email deve usar o domínio @justicaedireito.adv.br' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'A senha deve ter no mínimo 8 caracteres.' });
  }

  try {
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Este email já está cadastrado.' });
    }

    const mfa = mfa_secret || String(Math.floor(100000 + Math.random() * 900000));

    // ✅ Não passa area_atuacao/bio — não existem na tabela
    const novoAdvogado = await Usuario.create({
      name, email, password, role: 'LAWYER', mfa_secret: mfa,
    });

    console.log(`👤 [ADMIN] Advogado criado: ${novoAdvogado.email}`);

    return res.status(201).json({
      message: `Advogado ${novoAdvogado.name} criado com sucesso.`,
      user: novoAdvogado,
      mfa_secret: mfa,
    });
  } catch (err) {
    console.error('[ADMIN] Erro ao criar advogado:', err.message);
    return res.status(500).json({ error: 'Erro ao criar advogado.' });
  }
};

// PATCH /api/admin/usuarios/:id/ativar
const toggleAtivacao = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'Campo is_active deve ser true ou false.' });
  }
  if (id === req.user.id) {
    return res.status(400).json({ error: 'Você não pode desativar sua própria conta.' });
  }

  try {
    const updated = await Usuario.setActive(id, is_active);
    if (!updated) return res.status(404).json({ error: 'Usuário não encontrado.' });
    return res.json({ message: `Conta ${is_active ? 'ativada' : 'desativada'}.`, user: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar conta.' });
  }
};

// GET /api/admin/relatorio
const getRelatorio = async (req, res) => {
  try {
    const [totalUsers, totalCases, pendingCases, lawyersStats] = await Promise.all([
      query(`SELECT role, COUNT(*) AS total FROM users GROUP BY role`),
      query(`SELECT status, COUNT(*) AS total FROM cases GROUP BY status`),
      query(`SELECT COUNT(*) AS total FROM cases WHERE lawyer_id IS NULL`),
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
      usuarios:           totalUsers.rows.reduce((a, r) => ({ ...a, [r.role]: parseInt(r.total) }), {}),
      casos:              totalCases.rows.reduce((a, r) => ({ ...a, [r.status]: parseInt(r.total) }), {}),
      casos_sem_advogado: parseInt(pendingCases.rows[0]?.total || 0),
      advogados:          lawyersStats.rows,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao gerar relatório.' });
  }
};

module.exports = { getUsuarios, criarAdvogado, toggleAtivacao, getRelatorio };