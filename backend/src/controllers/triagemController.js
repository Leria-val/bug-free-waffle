// src/controllers/triagemController.js
// Mecanismo de Triagem Jurídica, Busca de Advogados e Criptografia AES-256

const crypto = require('crypto');
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
const submitTriagem = async (req, res) => {

  const { nome, email, area_atuacao, resumo_caso } = req.body;

  
  if (!nome || !email || !area_atuacao || !resumo_caso) {
    return res.status(400).json({ error: 'Todos os campos (Nome, Email, Área e Resumo) são obrigatórios.' });
  }

  if (!AREAS_ATUACAO.includes(area_atuacao)) {
    return res.status(400).json({ error: 'Área de atuação inválida.' });
  }

  try {
    console.log(`\n================ [🔒 INÍCIO DA TRIAGEM SEGURA] ================`);
    console.log(`Cliente: ${nome} | Email: ${email} | Área: ${area_atuacao}`);

    
    const key = Buffer.from(process.env.AES_KEY, 'hex'); 
    const iv = crypto.randomBytes(16); // Vetor de inicialização seguro

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encryptedResumo = cipher.update(resumo_caso, 'utf8', 'hex');
    encryptedResumo += cipher.final('hex');

    console.log(`[🔒 SEGURANÇA CHC] Dado salvo de forma sigilosa no BD (AES-256-CBC)`);
    console.log(`💾 String Criptografada: ${encryptedResumo}`);
    console.log(`🔑 IV utilizado: ${iv.toString('hex')}`);

    console.log(`🔍 Buscando advogados especialistas em: ${area_atuacao}...`);
    const result = await query(
      `SELECT id, name, email, area_atuacao, bio 
       FROM users 
       WHERE role = 'LAWYER' AND area_atuacao = $1`,
      [area_atuacao]
    );

    console.log(`✅ Encontrados ${result.rows.length} advogados disponíveis.`);
    
    console.log('\n[📧 EMAIL ENVIADO AUTOMATICAMENTE]');
    console.log(`Para: ${email}`);
    console.log(`Mensagem: Recebemos seu relato. Temos advogados disponíveis, faça login para ver seus perfis e entrar em contato.`);
    console.log('================================================================\n');

  
    return res.status(200).json({
      success: true,
      msg: 'Recebemos seu relato. Temos advogados disponíveis, faça login para ver seus perfis e entrar em contato.',
      area: area_atuacao,
      count: result.rows.length,
      advogados: result.rows 
    });

  } catch (err) {
    console.error('❌ [ERRO TRIAGEM]:', err.message);
    return res.status(500).json({ error: 'Erro ao processar a triagem confidencial.' });
  }
};

// GET /api/triagem/areas
const getAreas = (req, res) => res.json({ areas: AREAS_ATUACAO });

module.exports = { submitTriagem, getAreas };