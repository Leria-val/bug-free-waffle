// src/controllers/triagemController.js
// REFACTOR: Agora funciona como o mecanismo de busca e filtro público de advogados

const { query } = require('../config/database.js');

const AREAS_ATUACAO = [
  'Direito Civil',
  'Direito Criminal',
  'Direito Trabalhista',
  'Direito de Família',
  'Direito Empresarial',
  'Direito Tributário',
  'Direito Previdenciário',
  'Direito do Consumidor',
  'Direito Imobiliário',
  'Direito Digital',
];

// ──────────────────────────────────────────────
// POST /api/triagem
// Mecanismo de Busca: Filtra advogados pela área selecionada
// ──────────────────────────────────────────────
const submitTriagem = async (req, res) => {
  const { area_atuacao } = req.body;

  if (!area_atuacao) {
    return res.status(400).json({ error: 'Selecione uma área de atuação para buscar.' });
  }

  if (!AREAS_ATUACAO.includes(area_atuacao)) {
    return res.status(400).json({ error: 'Área de atuação inválida.' });
  }

  try {
    console.log(`\n🔍 [BUSCA/TRIAGEM] Buscando advogados especialistas em: ${area_atuacao}...`);

    // Busca os advogados correspondentes na tabela de usuários. 
    // Retorna apenas dados públicos essenciais (Nome, Bio, Email profissional)
    const result = await query(
      `SELECT id, name, email, area_atuacao, bio 
       FROM users 
       WHERE role = 'LAWYER' AND area_atuacao = $1`,
      [area_atuacao]
    );

    console.log(`✅ [BUSCA/TRIAGEM] Encontrados ${result.rows.length} advogados disponíveis.\n`);

    return res.status(200).json({
      success: true,
      area: area_atuacao,
      count: result.rows.length,
      advogados: result.rows // Envia a lista para renderizar os cards no frontend
    });

  } catch (err) {
    console.error('[BUSCA/TRIAGEM] Erro ao buscar advogados:', err.message);
    return res.status(500).json({ error: 'Erro ao processar a busca. Tente novamente.' });
  }
};

// GET /api/triagem/areas — público, lista as áreas disponíveis no select do front
const getAreas = (req, res) => res.json({ areas: AREAS_ATUACAO });

module.exports = { submitTriagem, getAreas };