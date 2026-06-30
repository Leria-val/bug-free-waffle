// src/services/emailService.js
// Envio de emails automáticos via Nodemailer

const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Email enviado ao CLIENTE após submissão da triagem.
 * Conforme o enunciado: "recebemos seu relato. Temos advogados disponíveis,
 * faça login para ver seus perfis e entrar em contato."
 */
const sendTriagemConfirmation = async (clientEmail, clientName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Justiça & Direito" <contato@justicaedireito.adv.br>',
    to: clientEmail,
    subject: '✅ Relato Recebido — Escritório Justiça & Direito',
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;
                  background:#0a0a0a;color:#d4af37;padding:40px;
                  border:1px solid #d4af37;">
        <div style="text-align:center;margin-bottom:30px;">
          <h1 style="color:#d4af37;font-size:22px;letter-spacing:2px;">
            JUSTIÇA &amp; DIREITO
          </h1>
          <p style="color:#888;font-size:12px;letter-spacing:1px;">
            ESCRITÓRIO DE ADVOCACIA
          </p>
        </div>

        <p style="color:#e0e0e0;">
          Prezado(a) <strong style="color:#d4af37;">${clientName}</strong>,
        </p>
        <p style="color:#e0e0e0;line-height:1.8;">
          Recebemos seu relato. Temos advogados disponíveis — faça login para
          ver seus perfis e entrar em contato.
        </p>

        <div style="background:#111;border-left:3px solid #d4af37;
                    padding:20px;margin:25px 0;">
          <p style="color:#d4af37;margin:0;font-size:14px;">
            🔒 Seu relato foi armazenado com
            <strong>Criptografia de Ponta a Ponta (AES-256)</strong>.
          </p>
        </div>

        <div style="text-align:center;margin:30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login"
             style="background:#d4af37;color:#0a0a0a;padding:12px 30px;
                    text-decoration:none;font-weight:bold;letter-spacing:1px;">
            ACESSAR O PORTAL
          </a>
        </div>

        <hr style="border-color:#333;margin:30px 0;">
        <p style="color:#555;font-size:11px;text-align:center;">
          Este é um e-mail automático. Não responda diretamente.<br>
          Escritório de Advocacia Justiça &amp; Direito — Confidencialidade Garantida.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 [EMAIL] Confirmação de triagem enviada para: ${clientEmail}`);
  } catch (error) {
    // Não interrompe o fluxo principal
    console.error('❌ [EMAIL] Erro ao enviar email:', error.message);
  }
};

/**
 * Notifica ADVOGADO sobre novo caso atribuído a ele.
 */
const sendNewCaseNotification = async (lawyerEmail, lawyerName, clientName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: lawyerEmail,
    subject: '🔔 Novo Caso Atribuído — Justiça & Direito',
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;
                  background:#0a0a0a;color:#d4af37;padding:40px;
                  border:1px solid #d4af37;">
        <h2 style="color:#d4af37;">Dr(a). ${lawyerName},</h2>
        <p style="color:#e0e0e0;">
          Um novo caso foi atribuído a você: <strong>${clientName}</strong>.
        </p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/lawyer/dashboard"
             style="background:#d4af37;color:#0a0a0a;padding:12px 30px;
                    text-decoration:none;font-weight:bold;">
            VER PAINEL
          </a>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 [EMAIL] Notificação enviada para advogado: ${lawyerEmail}`);
  } catch (error) {
    console.error('❌ [EMAIL] Erro ao notificar advogado:', error.message);
  }
};

module.exports = { sendTriagemConfirmation, sendNewCaseNotification };