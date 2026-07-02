// gerar-hash.js
// Execute NA SUA MÁQUINA dentro da pasta backend:
//   node gerar-hash.js
// Ele vai imprimir o SQL para colar no pgAdmin4

const bcrypt = require('bcryptjs');

async function main() {
  const senha = 'Senha@123';
  const hash  = await bcrypt.hash(senha, 10);

  console.log('\n✅ Hash gerado para "Senha@123":', hash);
  console.log('\n📋 Cole este SQL no pgAdmin4 → Query Tool e execute:\n');
  console.log('-- ================================================');
  console.log('-- ATUALIZA OS SEEDS COM HASH CORRETO');
  console.log('-- ================================================');
  console.log(`
UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@justicaedireito.adv.br';
UPDATE users SET password_hash = '${hash}' WHERE email = 'ricardo@justicaedireito.adv.br';
UPDATE users SET password_hash = '${hash}' WHERE email = 'ana@justicaedireito.adv.br';

-- Confirma:
SELECT name, email, role, mfa_secret, LEFT(password_hash, 10) AS hash_preview FROM users WHERE role != 'CLIENT';
  `);
}

main();