// src/controllers/casoController.js
// Busca casos filtrados pelo ID do advogado logado (isolamento de sigilo)

const { query }   = require('../config/database.js');
const { decrypt } = require('../services/cryptoService.js');

// ──────────────────────────────────────────────
// GET /api/casos
// Lista casos conforme o role do usuário logado
// ──────────────────────────────────────────────
const getCasos = async (req, res) => {
  const { id: userId, role } = req.user;

  try {
    let sql, params;

    if (role === 'ADMIN') {
      sql = `
        SELECT c.id, c.title_area, c.status, c.created_at, c.updated_at,
               uc.name AS client_name, uc.email AS client_email,
               ul.name AS lawyer_name
        FROM cases c
        LEFT JOIN users uc ON c.client_id = uc.id
        LEFT JOIN users ul ON c.lawyer_id = ul.id
        ORDER BY c.created_at DESC`;
      params = [];

    } else if (role === 'LAWYER') {
      // ADVOGADO só vê seus próprios casos — isolamento de sigilo
      sql = `
        SELECT c.id, c.title_area, c.status, c.created_at, c.updated_at,
               uc.name AS client_name, uc.email AS client_email
        FROM cases c
        LEFT JOIN users uc ON c.client_id = uc.id
        WHERE c.lawyer_id = $1
        ORDER BY c.created_at DESC`;
      params = [userId];

    } else {
      // CLIENTE só vê seus próprios casos
      sql = `
        SELECT c.id, c.title_area, c.status, c.created_at, c.updated_at,
               ul.name AS lawyer_name
        FROM cases c
        LEFT JOIN users ul ON c.lawyer_id = ul.id
        WHERE c.client_id = $1
        ORDER BY c.created_at DESC`;
      params = [userId];
    }

    const result = await query(sql, params);
    return res.json({ cases: result.rows });

  } catch (err) {
    console.error('[CASOS] Erro ao listar casos:', err.message);
    return res.status(500).json({ error: 'Erro ao buscar casos.' });
  }
};

// ──────────────────────────────────────────────
// GET /api/casos/:id
// Detalhes + decriptografia do resumo
// (sigiloMiddleware já garantiu a permissão antes)
// ──────────────────────────────────────────────
const getCasoById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT c.id, c.title_area, c.encrypted_summary, c.status,
              c.created_at, c.updated_at,
              uc.name AS client_name, uc.email AS client_email,
              ul.name AS lawyer_name, ul.email AS lawyer_email
       FROM cases c
       LEFT JOIN users uc ON c.client_id = uc.id
       LEFT JOIN users ul ON c.lawyer_id = ul.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Caso não encontrado.' });
    }

    const caso = result.rows[0];

    // Decriptografa para exibição — nunca expõe o hex bruto
    let resumo_caso;
    try {
      resumo_caso = decrypt(caso.encrypted_summary);
    } catch {
      resumo_caso = '[Erro ao decriptografar resumo]';
    }

    return res.json({
      case: {
        ...caso,
        encrypted_summary: undefined,
        resumo_caso,
      },
    });

  } catch (err) {
    console.error('[CASOS] Erro ao buscar caso:', err.message);
    return res.status(500).json({ error: 'Erro ao buscar caso.' });
  }
};

// ──────────────────────────────────────────────
// PATCH /api/casos/:id/status
// Atualiza o status (stepper) — LAWYER e ADMIN
// ──────────────────────────────────────────────
const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const VALID = ['TRIAGEM', 'ANALISE', 'EM_ANDAMENTO', 'CONCLUIDO', 'ARQUIVADO'];

  if (!VALID.includes(status)) {
    return res.status(400).json({ error: `Status inválido. Use: ${VALID.join(', ')}` });
  }

  try {
    const result = await query(
      `UPDATE cases SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING id, status`,
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Caso não encontrado.' });
    }
    return res.json({ message: 'Status atualizado.', case: result.rows[0] });
  } catch (err) {
    console.error('[CASOS] Erro ao atualizar status:', err.message);
    return res.status(500).json({ error: 'Erro ao atualizar status.' });
  }
};

// ──────────────────────────────────────────────
// PATCH /api/casos/:id/assign
// Atribui advogado a um caso — apenas ADMIN
// ──────────────────────────────────────────────
const assignLawyer = async (req, res) => {
  const { id } = req.params;
  const { lawyer_id } = req.body;

  try {
    const check = await query(
      "SELECT id FROM users WHERE id = $1 AND role = 'LAWYER'",
      [lawyer_id]
    );
    if (check.rows.length === 0) {
      return res.status(400).json({ error: 'Advogado não encontrado.' });
    }

    const result = await query(
      `UPDATE cases
       SET lawyer_id = $1, status = 'ANALISE', updated_at = NOW()
       WHERE id = $2 RETURNING id, lawyer_id, status`,
      [lawyer_id, id]
    );

    return res.json({ message: 'Advogado atribuído.', case: result.rows[0] });
  } catch (err) {
    console.error('[CASOS] Erro ao atribuir advogado:', err.message);
    return res.status(500).json({ error: 'Erro ao atribuir advogado.' });
  }
};

module.exports = { getCasos, getCasoById, updateStatus, assignLawyer };