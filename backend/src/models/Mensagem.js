// src/models/Mensagem.js
// Helpers de queries para a tabela messages (chat seguro)

const { query } = require('../config/database.js');

const Mensagem = {
  /**
   * Busca todas as mensagens de um caso, com dados do remetente
   */
  findByCaseId: async (caseId) => {
    const result = await query(
      `SELECT m.id, m.message_text, m.is_read, m.created_at,
              u.id AS sender_id, u.name AS sender_name, u.role AS sender_role
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.case_id = $1
       ORDER BY m.created_at ASC`,
      [caseId]
    );
    return result.rows;
  },

  /**
   * Cria uma nova mensagem
   */
  create: async ({ caseId, senderId, messageText }) => {
    const result = await query(
      `INSERT INTO messages (case_id, sender_id, message_text)
       VALUES ($1, $2, $3)
       RETURNING id, message_text, is_read, created_at`,
      [caseId, senderId, messageText]
    );
    return result.rows[0];
  },

  /**
   * Marca como lidas todas as mensagens de outro remetente em um caso
   */
  markAsRead: async (caseId, currentUserId) => {
    const result = await query(
      `UPDATE messages SET is_read = TRUE
       WHERE case_id = $1 AND sender_id != $2 AND is_read = FALSE
       RETURNING id`,
      [caseId, currentUserId]
    );
    return result.rowCount; // Quantas mensagens foram marcadas
  },

  /**
   * Conta mensagens não lidas para um usuário em todos os seus casos
   */
  countUnreadForUser: async (userId, role) => {
    // Busca casos do usuário para contar não lidas
    const caseField = role === 'LAWYER' ? 'lawyer_id' : 'client_id';
    const result = await query(
      `SELECT COUNT(m.id) AS total
       FROM messages m
       JOIN cases c ON m.case_id = c.id
       WHERE c.${caseField} = $1
         AND m.sender_id != $1
         AND m.is_read = FALSE`,
      [userId]
    );
    return parseInt(result.rows[0]?.total || 0);
  },

  /**
   * Conta não lidas por caso (para badge no feed do advogado)
   */
  countUnreadByCaseId: async (caseId, currentUserId) => {
    const result = await query(
      `SELECT COUNT(*) AS total FROM messages
       WHERE case_id = $1 AND sender_id != $2 AND is_read = FALSE`,
      [caseId, currentUserId]
    );
    return parseInt(result.rows[0]?.total || 0);
  },
};

module.exports = Mensagem;