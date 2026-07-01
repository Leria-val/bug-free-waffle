// server.js
require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// Avisa se as variáveis de banco não foram preenchidas
const dbOk = (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('SUA_SENHA'))
  || (process.env.DB_PASSWORD && process.env.DB_PASSWORD !== 'SUA_SENHA_AQUI' && process.env.DB_PASSWORD !== '');

if (!dbOk) {
  console.warn('\n⚠️  [.env] Atenção: preencha DB_PASSWORD com a senha do seu pgAdmin4.');
  console.warn('    Edite o arquivo backend/.env e substitua SUA_SENHA_AQUI pela senha real.\n');
}

app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║     JUSTIÇA & DIREITO — API Server       ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔑 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});