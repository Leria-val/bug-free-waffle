// Pool de conexão com PostgreSQL (compatível com AWS RDS)
// src/config/database.js
// Pool de conexão com PostgreSQL (compatível com AWS RDS)

const { Pool } = require('pg');
// Garantiza la lectura por si acaso, aunque se recomienda inicializarlo en server.js
require('dotenv').config(); 

const connString = process.env.DATABASE_URL ? String(process.env.DATABASE_URL).trim() : null;

if (!connString) {
  console.error('\n[🚨 CRÍTICO] DATABASE_URL não foi definida no arquivo .env!\n');
}

const pool = new Pool({
  connectionString: connString,
  // AWS RDS requiere SSL con rejectUnauthorized: false en entornos externos (de producción/render)
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Subido a 5s para dar margen a AWS en el handshake inicial
});

// Verificación de conexión inicial con el Pool
pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao conectar ao PostgreSQL:', err.message);
    console.error('Verifique se a senha ou a URL no .env possuem caracteres especiais não escapados.');
  } else {
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso (AWS RDS/Local).');
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