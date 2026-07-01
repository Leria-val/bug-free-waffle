// src/config/database.js
const { Pool } = require('pg');
require('dotenv').config();

// Usa DATABASE_URL se existir, senão monta a partir das variáveis individuais
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: String(process.env.DATABASE_URL).trim(),
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }
    : {
        host:     process.env.DB_HOST     || 'localhost',
        port:     Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME     || 'justica_direito',
        user:     process.env.DB_USER     || 'postgres',
        password: String(process.env.DB_PASSWORD || ''),
        ssl: false,
      }
);

pool.connect((err, client, release) => {
  if (err) {
    console.error('\n Erro ao conectar ao PostgreSQL:', err.message);
    console.error('   Dica: confirme DB_HOST, DB_PORT, DB_NAME, DB_USER e DB_PASSWORD no .env\n');
  } else {
    console.log(' Conexão com PostgreSQL estabelecida com sucesso.');
    release();
  }
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB] Query em ${Date.now() - start}ms | Linhas: ${result.rowCount}`);
    }
    return result;
  } catch (error) {
    console.error('[DB] Erro na query:', error.message);
    throw error;
  }
};

module.exports = { pool, query };