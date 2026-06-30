// server.js
// Ponto de entrada — levanta o servidor HTTP na porta configurada

require('dotenv').config();
const app = require('./src/app.js');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║     JUSTIÇA & DIREITO — API Server       ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});