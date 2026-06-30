// src/config/database.js
// Pool de conexão com PostgreSQL (compatível com AWS RDS)

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', err.message);
  } else {
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso.');
    release();
  }
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB] Query em ${duration}ms | Linhas: ${result.rowCount}`);
    }
    return result;
  } catch (error) {
    console.error('[DB] Erro na query:', error.message);
    throw error;
  }
};

module.exports = { pool, query };