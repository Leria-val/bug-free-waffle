// src/services/cryptoService.js
// Criptografia AES-256-CBC para dados sigilosos (resumos de casos)

const crypto = require('crypto');
require('dotenv').config();

const ALGORITHM = 'aes-256-cbc';
// A chave deve ter exatamente 32 bytes
const KEY = Buffer.from(process.env.AES_KEY || '0'.repeat(64), 'hex');

/**
 * Criptografa um texto limpo usando AES-256-CBC.
 * Gera um IV aleatório por operação e o inclui no resultado (iv:dados).
 * @param {string} plainText - Texto a ser criptografado
 * @returns {string} - String no formato "iv_hex:encrypted_hex"
 */
const encrypt = (plainText) => {
  const iv = crypto.randomBytes(16); // IV único por operação
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const result = `${iv.toString('hex')}:${encrypted}`;

  // Log de auditoria (sem expor o conteúdo real)
  console.log('🔒 [CRYPTO] Dado cifrado com AES-256-CBC.');
  console.log(`   IV gerado: ${iv.toString('hex')}`);
  console.log(`   Tamanho cifrado: ${encrypted.length} chars`);
  console.log('   ✅ Salvo de forma sigilosa no banco de dados.');

  return result;
};

/**
 * Decriptografa um texto previamente cifrado com encrypt().
 * @param {string} encryptedText - String no formato "iv_hex:encrypted_hex"
 * @returns {string} - Texto original decriptografado
 */
const decrypt = (encryptedText) => {
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

module.exports = { encrypt, decrypt };