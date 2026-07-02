// src/controllers/advogadoController.js
// Endpoints PÚBLICOS — usados pela BuscaAdvogados.jsx (sem login)

const { query } = require('../config/database.js');

// Áreas fixas por advogado (mock estático enquanto não há tabela de especialidades)
// Chave = email do advogado conforme seeds do schema.sql
const AREAS_POR_ADVOGADO = {
  'ricardo@justicaedireito.adv.br': ['Direito Civil', 'Direito Empresarial'],
  'ana@justicaedireito.adv.br':     ['Direito de Família', 'Direito Criminal'],
};

const BIO_POR_ADVOGADO = {
  'ricardo@justicaedireito.adv.br': 'Especialista em contratos e litígios empresariais com mais de 12 anos de experiência.',
  'ana@justicaedireito.adv.br':     'Atuação em divórcio, guarda de filhos e herança com abordagem humanizada.',
};

/**
 * GET /api/advogados?area=Direito Civil
 * Lista advogados ativos. Filtro por área feito em memória (sem coluna no BD).
 */
const getAdvogadosPublico = async (req, res) => {
  const { area } = req.query;

  try {
    // Busca só colunas que existem na tabela users do schema.sql
    const result = await query(
      `SELECT id, name, email, created_at
       FROM users
       WHERE role = 'LAWYER' AND is_active = TRUE
       ORDER BY name ASC`
    );

    // Enriquece com áreas e bio (mapeamento estático por email)
    let advogados = result.rows.map(adv => ({
      id:            adv.id,
      name:          adv.name,
      email:         adv.email,
      areas:         AREAS_POR_ADVOGADO[adv.email] || ['Direito Civil'],
      bio:           BIO_POR_ADVOGADO[adv.email]   || 'Advogado especializado do escritório Justiça & Direito.',
      membro_desde:  adv.created_at,
    }));

    // Filtro por área se informado
    if (area && area.trim() !== '') {
      advogados = advogados.filter(a => a.areas.includes(area.trim()));
    }

    return res.json({ advogados, total: advogados.length });

  } catch (err) {
    console.error('[ADVOGADOS] Erro:', err.message);
    return res.status(500).json({ error: 'Erro ao buscar advogados.' });
  }
};

/**
 * GET /api/advogados/:id
 */
const getAdvogadoPreview = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT id, name, email, created_at FROM users
       WHERE id = $1 AND role = 'LAWYER' AND is_active = TRUE`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Advogado não encontrado.' });
    }

    const adv = result.rows[0];
    return res.json({
      advogado: {
        ...adv,
        areas: AREAS_POR_ADVOGADO[adv.email] || ['Direito Civil'],
        bio:   BIO_POR_ADVOGADO[adv.email]   || 'Advogado do escritório Justiça & Direito.',
      }
    });

  } catch (err) {
    console.error('[ADVOGADOS] Erro:', err.message);
    return res.status(500).json({ error: 'Erro ao buscar advogado.' });
  }
};

module.exports = { getAdvogadosPublico, getAdvogadoPreview };