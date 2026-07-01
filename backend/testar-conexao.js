// testar-conexao.js
// Rode na raiz do backend: node testar-conexao.js
// Testa a conexão com o PostgreSQL sem depender do resto do projeto

require('dotenv').config();
const { Client } = require('pg');

console.log('\n🔍 Lendo variáveis do .env:');
console.log('   DB_HOST:    ', process.env.DB_HOST     || '(não definido)');
console.log('   DB_PORT:    ', process.env.DB_PORT     || '(não definido)');
console.log('   DB_NAME:    ', process.env.DB_NAME     || '(não definido)');
console.log('   DB_USER:    ', process.env.DB_USER     || '(não definido)');
console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? `"${process.env.DB_PASSWORD}" (${typeof process.env.DB_PASSWORD})` : '(não definido)');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'definida' : '(não definida — usando variáveis individuais)');

const client = new Client({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'justica_direito',
  user:     process.env.DB_USER     || 'postgres',
  password: String(process.env.DB_PASSWORD || ''),
  ssl: false,
  connectionTimeoutMillis: 5000,
});

console.log('\n⏳ Tentando conectar...\n');

client.connect()
  .then(() => {
    console.log('✅ CONEXÃO BEM-SUCEDIDA!\n');
    return client.query('SELECT current_database(), current_user, version()');
  })
  .then(res => {
    const r = res.rows[0];
    console.log('   Banco:   ', r.current_database);
    console.log('   Usuário: ', r.current_user);
    console.log('   Versão:  ', r.version.split(',')[0]);
    console.log('\n👍 Tudo certo! O backend vai conectar normalmente.\n');
    client.end();
  })
  .catch(err => {
    console.error('❌ FALHA NA CONEXÃO:', err.message);
    console.error('\n📋 Código do erro:', err.code);

    if (err.message.includes('password must be a string')) {
      console.error('\n💡 Causa: DB_PASSWORD está chegando como undefined/null.');
      console.error('   → Verifique se o .env está na pasta /backend (não na raiz do projeto)');
      console.error('   → Verifique se não há espaços em "DB_PASSWORD=suasenha"');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('\n💡 Causa: PostgreSQL não está aceitando conexões na porta', process.env.DB_PORT || 5432);
      console.error('   → Confirme a porta no pgAdmin4: clique no servidor → Properties → Connection → Port');
    }
    if (err.code === '3D000') {
      console.error('\n💡 Causa: Banco "' + (process.env.DB_NAME || 'justica_direito') + '" não existe.');
      console.error('   → Crie o banco no pgAdmin4: botão direito em Databases → Create → Database');
    }
    if (err.code === '28P01') {
      console.error('\n💡 Causa: Senha incorreta para o usuário', process.env.DB_USER || 'postgres');
      console.error('   → Confirme a senha no pgAdmin4 ou redefina com:');
      console.error('     ALTER USER postgres WITH PASSWORD \'nova_senha\';');
    }
    client.end();
  });