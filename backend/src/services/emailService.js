// src/services/emailService.js
// ⚠️  Notificações simuladas — sem envio real de email.
// Os logs aparecem no console do servidor para fins de demonstração/homologação.

/**
 * Simula o email enviado ao CLIENTE após submissão da triagem.
 */
const sendTriagemConfirmation = async (clientEmail, clientName) => {
  console.log('\n📧 [EMAIL SIMULADO] ─────────────────────────────────────');
  console.log(`   Para:    ${clientEmail}`);
  console.log(`   Assunto: ✅ Relato Recebido — Escritório Justiça & Direito`);
  console.log(`   Corpo:   Olá ${clientName}, recebemos seu relato.`);
  console.log('            Temos advogados disponíveis — faça login para');
  console.log('            ver seus perfis e entrar em contato.');
  console.log('   Status:  ✅ Notificação registrada (envio real desativado)\n');
  return { simulated: true };
};

/**
 * Simula a notificação ao ADVOGADO quando um caso é atribuído.
 */
const sendNewCaseNotification = async (lawyerEmail, lawyerName, clientName) => {
  console.log('\n📧 [EMAIL SIMULADO] ─────────────────────────────────────');
  console.log(`   Para:    ${lawyerEmail}`);
  console.log(`   Assunto: 🔔 Novo Caso Atribuído — Justiça & Direito`);
  console.log(`   Corpo:   Dr(a). ${lawyerName}, o caso de ${clientName} foi atribuído a você.`);
  console.log('   Status:  ✅ Notificação registrada (envio real desativado)\n');
  return { simulated: true };
};

module.exports = { sendTriagemConfirmation, sendNewCaseNotification };