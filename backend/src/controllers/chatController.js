// src/controllers/chatController.js
// Chat seguro: mensagens em tempo real e upload de documentos confidenciais

const { query } = require('../config/database.js');

// ──────────────────────────────────────────────
// GET /api/casos/:id/mensagens
// Histórico do chat de um caso
// ──────────────────────────────────────────────
const getMensagens = async (req, res) => {
  const { id: caseId } = req.params;

  try {
    const result = await query(
      `SELECT m.id, m.message_text, m.is_read, m.created_at,
              u.id AS sender_id, u.name AS sender_name, u.role AS sender_role
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.case_id = $1
       ORDER BY m.created_at ASC`,
      [caseId]
    );

    // Marca como lidas as mensagens do outro participante
    await query(
      `UPDATE messages SET is_read = TRUE
       WHERE case_id = $1 AND sender_id != $2 AND is_read = FALSE`,
      [caseId, req.user.id]
    );

    return res.json({ messages: result.rows });
  } catch (err) {
    console.error('[CHAT] Erro ao buscar mensagens:', err.message);
    return res.status(500).json({ error: 'Erro ao carregar mensagens.' });
  }
};

// ──────────────────────────────────────────────
// POST /api/casos/:id/mensagens
// Envia nova mensagem no chat do caso
// ──────────────────────────────────────────────
const sendMensagem = async (req, res) => {
  const { id: caseId } = req.params;
  const { message_text } = req.body;

  if (!message_text || message_text.trim().length === 0) {
    return res.status(400).json({ error: 'A mensagem não pode estar vazia.' });
  }
  if (message_text.trim().length > 5000) {
    return res.status(400).json({ error: 'Mensagem muito longa (máximo 5000 caracteres).' });
  }

  try {
    const result = await query(
      `INSERT INTO messages (case_id, sender_id, message_text)
       VALUES ($1, $2, $3)
       RETURNING id, message_text, is_read, created_at`,
      [caseId, req.user.id, message_text.trim()]
    );

    return res.status(201).json({
      message: {
        ...result.rows[0],
        sender_id:   req.user.id,
        sender_name: req.user.name,
        sender_role: req.user.role,
      },
    });
  } catch (err) {
    console.error('[CHAT] Erro ao enviar mensagem:', err.message);
    return res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
};

// ──────────────────────────────────────────────
// POST /api/casos/:id/documentos
// Upload de documento confidencial (multer já processou o arquivo)
// ──────────────────────────────────────────────
const uploadDocumento = async (req, res) => {
  const { id: caseId } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  try {
    const result = await query(
      `INSERT INTO documents (case_id, file_name, file_path, file_size, mime_type, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, file_name, file_size, mime_type, created_at`,
      [
        caseId,
        req.file.originalname,
        req.file.filename,    // UUID gerado pelo multer
        req.file.size,
        req.file.mimetype,
        req.user.id,
      ]
    );

    console.log(`📎 [CHAT] Documento "${req.file.originalname}" enviado para caso ${caseId}`);

    return res.status(201).json({
      message: 'Documento enviado com sucesso.',
      document: result.rows[0],
    });
  } catch (err) {
    console.error('[CHAT] Erro ao salvar documento:', err.message);
    return res.status(500).json({ error: 'Erro ao salvar documento.' });
  }
};

// ──────────────────────────────────────────────
// GET /api/casos/:id/documentos
// Lista documentos anexados ao caso
// ──────────────────────────────────────────────
const getDocumentos = async (req, res) => {
  const { id: caseId } = req.params;

  try {
    const result = await query(
      `SELECT d.id, d.file_name, d.file_size, d.mime_type, d.created_at,
              u.name AS uploaded_by_name
       FROM documents d
       JOIN users u ON d.uploaded_by = u.id
       WHERE d.case_id = $1
       ORDER BY d.created_at DESC`,
      [caseId]
    );
    return res.json({ documents: result.rows });
  } catch (err) {
    console.error('[CHAT] Erro ao listar documentos:', err.message);
    return res.status(500).json({ error: 'Erro ao listar documentos.' });
  }
};

module.exports = { getMensagens, sendMensagem, uploadDocumento, getDocumentos };