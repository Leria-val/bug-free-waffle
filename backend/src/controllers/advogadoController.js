// src/controllers/advogadoController.js
// Endpoints PÚBLICOS — usados pela página de Busca de Advogados (sem login)
// Expõe apenas dados não sigilosos: nome, email profissional, área e bio

const { query } = require('../config/database.js');

/**
 * GET /api/advogados
 * Lista advogados ativos, com filtro opcional por área de atuação.
 * Query params: ?area=Direito Civil
 *
 * IMPORTANTE: nunca retorna dados de casos, mensagens ou documentos.
 * Esta rota é pública e não passa por authMiddleware.
 */
const getAdvogadosPublico = async (req, res) => {
  const { area } = req.query;

  try {
    let sql = `
      SELECT u.id, u.name, u.email, u.area_atuacao, u.bio, u.created_at,
             COUNT(DISTINCT c.id) FILTER (WHERE c.lawyer_id = u.id) AS casos_atendidos
      FROM users u
      LEFT JOIN cases c ON c.lawyer_id = u.id
      WHERE u.role = 'LAWYER' AND u.is_active = TRUE
    `;
    const params = [];

    if (area && area.trim() !== '') {
      sql += ` AND u.area_atuacao = $1`;
      params.push(area.trim());
    }

    sql += ` GROUP BY u.id, u.name, u.email, u.area_atuacao, u.bio, u.created_at ORDER BY u.name ASC`;

    const result = await query(sql, params);

    // Resposta enxuta — nenhum dado sigiloso é exposto aqui
    const advogados = result.rows.map((adv) => ({
      id: adv.id,
      name: adv.name,
      email: adv.email,
      area_atuacao: adv.area_atuacao,
      bio: adv.bio,
      membro_desde: adv.created_at,
      casos_atendidos: parseInt(adv.casos_atendidos) || 0,
    }));

    return res.json({ advogados, total: advogados.length });

  } catch (err) {
    console.error('[ADVOGADOS] Erro ao listar advogados públicos:', err.message);
    return res.status(500).json({ error: 'Erro ao buscar advogados.' });
  }
};

/**
 * GET /api/advogados/:id
 * Perfil público resumido de um advogado específico (prévia do card).
 * Para informações completas e contato direto, o cliente deve logar.
 */
const getAdvogadoPreview = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT id, name, email, area_atuacao, bio, created_at FROM users
       WHERE id = $1 AND role = 'LAWYER' AND is_active = TRUE`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Advogado não encontrado.' });
    }

    return res.json({ advogado: result.rows[0] });

  } catch (err) {
    console.error('[ADVOGADOS] Erro ao buscar advogado:', err.message);
    return res.status(500).json({ error: 'Erro ao buscar advogado.' });
  }
};

module.exports = { getAdvogadosPublico, getAdvogadoPreview };