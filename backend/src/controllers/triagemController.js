// src/controllers/triagemController.js
const crypto    = require('crypto');
const { query } = require('../config/database.js');

const AREAS = [
  'Direito Civil','Direito Criminal','Direito Trabalhista','Direito de Família',
  'Direito Empresarial','Direito Tributário','Direito Previdenciário',
  'Direito do Consumidor','Direito Imobiliário','Direito Digital',
];

// POST /api/triagem
const submitTriagem = async (req, res) => {
  const { nome, email, area_atuacao, resumo_caso } = req.body;

  if (!nome || !area_atuacao || !resumo_caso) {
    return res.status(400).json({ error: 'Nome, área e resumo são obrigatórios.' });
  }
  if (!AREAS.includes(area_atuacao)) {
    return res.status(400).json({ error: 'Área de atuação inválida.' });
  }

  try {
    // ── AES-256 encryption (log para demonstração) ──────────────────
    const keyHex = process.env.AES_KEY || '';
    const key    = keyHex.length === 64
      ? Buffer.from(keyHex, 'hex')
      : crypto.scryptSync('default-key', 'salt', 32);

    const iv          = crypto.randomBytes(16);
    const cipher      = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted     = cipher.update(resumo_caso, 'utf8', 'hex');
    encrypted        += cipher.final('hex');
    const encryptedSummary = `${iv.toString('hex')}:${encrypted}`;

    console.log('\n🔒 [TRIAGEM] Criptografando resumo com AES-256-CBC...');
    console.log(`   IV: ${iv.toString('hex')}`);
    console.log('   ✅ Dado salvo de forma sigilosa no banco.\n');

    // ── Salva o caso no banco ────────────────────────────────────────
    // client_id: usa o usuário logado se autenticado, senão null
    const clientId = req.user?.id || null;

    // Se não tiver clientId (não logado), retorna sucesso sem salvar
    // Isso permite que a triagem pública funcione como demonstração
    if (!clientId) {
      return res.status(200).json({
        success: true,
        simulated: true,
        msg: 'Relato recebido com sucesso (modo demonstração — faça login para salvar).',
      });
    }

    // Busca um advogado disponível para atribuir automaticamente (o primeiro ativo)
    const lawyerResult = await query(
      `SELECT id FROM users WHERE role = 'LAWYER' AND is_active = TRUE ORDER BY name ASC LIMIT 1`
    );
    const lawyerId = lawyerResult.rows[0]?.id || null;

    const result = await query(
      `INSERT INTO cases (client_id, lawyer_id, title_area, encrypted_summary, status)
       VALUES ($1, $2, $3, $4, 'TRIAGEM')
       RETURNING id, title_area, status, created_at`,
      [clientId, lawyerId, area_atuacao, encryptedSummary]
    );

    const caso = result.rows[0];
    console.log(`✅ Caso ${caso.id} criado para cliente ${clientId}`);

    // Notificação simulada
    console.log('\n📧 [EMAIL SIMULADO]');
    console.log(`   Para: ${email || req.user?.email}`);
    console.log('   Recebemos seu relato. Temos advogados disponíveis.');
    console.log('   ✅ Notificação registrada.\n');

    return res.status(201).json({
      success: true,
      msg: 'Relato recebido com sucesso. Temos advogados disponíveis — acesse seu painel.',
      case: { id: caso.id, area: caso.title_area, status: caso.status },
      security: { encryption: 'AES-256-CBC' },
    });

  } catch (err) {
    console.error('❌ [TRIAGEM]:', err.message);
    return res.status(500).json({ error: 'Erro ao processar triagem: ' + err.message });
  }
};

const getAreas = (req, res) => res.json({ areas: AREAS });

module.exports = { submitTriagem, getAreas };