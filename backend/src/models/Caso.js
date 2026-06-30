// src/models/Caso.js
// Helpers de queries para a tabela cases

const { query } = require('../config/database.js');

const Caso = {
  /**
   * Busca caso por ID (sem decriptografar — controller decide)
   */
  findById: async (id) => {
    const result = await query(
      `SELECT c.*, 
              u_client.name AS client_name, u_client.email AS client_email,
              u_lawyer.name AS lawyer_name, u_lawyer.email AS lawyer_email
       FROM cases c
       LEFT JOIN users u_client ON c.client_id = u_client.id
       LEFT JOIN users u_lawyer ON c.lawyer_id = u_lawyer.id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Lista casos de um cliente específico
   */
  findByClientId: async (clientId) => {
    const result = await query(
      `SELECT c.id, c.title_area, c.status, c.created_at, c.updated_at,
              u_lawyer.name AS lawyer_name
       FROM cases c
       LEFT JOIN users u_lawyer ON c.lawyer_id = u_lawyer.id
       WHERE c.client_id = $1
       ORDER BY c.created_at DESC`,
      [clientId]
    );
    return result.rows;
  },

  /**
   * Lista casos atribuídos a um advogado específico
   */
  findByLawyerId: async (lawyerId) => {
    const result = await query(
      `SELECT c.id, c.title_area, c.status, c.created_at, c.updated_at,
              u_client.name AS client_name, u_client.email AS client_email
       FROM cases c
       LEFT JOIN users u_client ON c.client_id = u_client.id
       WHERE c.lawyer_id = $1
       ORDER BY c.created_at DESC`,
      [lawyerId]
    );
    return result.rows;
  },

  /**
   * Lista todos os casos em triagem (sem advogado atribuído) — para Admin
   */
  findPendingAssignment: async () => {
    const result = await query(
      `SELECT c.id, c.title_area, c.status, c.created_at,
              u_client.name AS client_name
       FROM cases c
       LEFT JOIN users u_client ON c.client_id = u_client.id
       WHERE c.lawyer_id IS NULL AND c.status = 'TRIAGEM'
       ORDER BY c.created_at ASC`
    );
    return result.rows;
  },

  /**
   * Cria um novo caso (resumo já deve chegar criptografado)
   */
  create: async ({ clientId, titleArea, encryptedSummary }) => {
    const result = await query(
      `INSERT INTO cases (client_id, title_area, encrypted_summary, status)
       VALUES ($1, $2, $3, 'TRIAGEM')
       RETURNING id, title_area, status, created_at`,
      [clientId, titleArea, encryptedSummary]
    );
    return result.rows[0];
  },

  /**
   * Atualiza o status de um caso
   */
  updateStatus: async (id, status) => {
    const result = await query(
      `UPDATE cases SET status = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, status, updated_at`,
      [status, id]
    );
    return result.rows[0] || null;
  },

  /**
   * Atribui um advogado a um caso
   */
  assignLawyer: async (caseId, lawyerId) => {
    const result = await query(
      `UPDATE cases SET lawyer_id = $1, status = 'ANALISE', updated_at = NOW()
       WHERE id = $2 RETURNING id, lawyer_id, status`,
      [lawyerId, caseId]
    );
    return result.rows[0] || null;
  },

  /**
   * Conta casos por status — útil para dashboards
   */
  countByStatus: async (lawyerId = null) => {
    const params = lawyerId ? [lawyerId] : [];
    const where = lawyerId ? 'WHERE lawyer_id = $1' : '';
    const result = await query(
      `SELECT status, COUNT(*) AS total FROM cases ${where} GROUP BY status`,
      params
    );
    // Retorna objeto { TRIAGEM: 3, ANALISE: 1, ... }
    return result.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.total);
      return acc;
    }, {});
  },
};

module.exports = Caso;