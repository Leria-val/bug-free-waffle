// src/middleware/sigiloMiddleware.js
// REGRA DE NEGÓCIO CENTRAL: Isolamento de casos por advogado
// Garante que Advogado A jamais acesse dados do Advogado B

const { query } = require('../config/database.js');

/**
 * Verifica se o advogado logado tem permissão para acessar o caso solicitado.
 * Se req.user.id !== caso.lawyer_id → 403 Acesso Restrito/Confidencial
 *
 * Uso: aplique APÓS authMiddleware nas rotas /api/casos/:id
 */
const sigiloMiddleware = async (req, res, next) => {
  // Admins têm acesso total
  if (req.user.role === 'ADMIN') {
    return next();
  }

  const { id: caseId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Busca o caso no banco
    const result = await query(
      'SELECT id, client_id, lawyer_id FROM cases WHERE id = $1',
      [caseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Caso não encontrado.',
      });
    }

    const caso = result.rows[0];

    // CLIENT: só pode acessar seus próprios casos
    if (userRole === 'CLIENT') {
      if (caso.client_id !== userId) {
        console.warn(`⚠️ [SIGILO] Cliente ${userId} tentou acessar caso de outro cliente.`);
        return res.status(403).json({
          error: 'Acesso Restrito/Confidencial',
          message: 'Você não tem permissão para acessar este caso.',
        });
      }
      return next();
    }

    // LAWYER: só pode acessar casos atribuídos a ele
    if (userRole === 'LAWYER') {
      if (caso.lawyer_id !== userId) {
        console.warn(
          `⚠️ [SIGILO] Advogado ${req.user.email} tentou acessar caso do Advogado ID ${caso.lawyer_id}. BLOQUEADO.`
        );
        return res.status(403).json({
          error: 'Acesso Restrito/Confidencial',
          message:
            'Este caso está sob sigilo de outro advogado. Seu acesso foi registrado.',
        });
      }
      return next();
    }

    // Role desconhecido — bloqueia por padrão
    return res.status(403).json({ error: 'Acesso Restrito/Confidencial' });

  } catch (error) {
    console.error('[SIGILO] Erro ao verificar permissão:', error.message);
    return res.status(500).json({ error: 'Erro interno ao verificar permissões.' });
  }
};

module.exports = sigiloMiddleware;