-- ============================================
-- SCHEMA DO BANCO DE DADOS - JUSTIÇA & DIREITO
-- ============================================
-- Execute este script para criar as tabelas no PostgreSQL
-- psql -U postgres -d justica_direito -f schema.sql

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: users
-- Perfis: ADMIN, LAWYER, CLIENT
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(10) NOT NULL CHECK (role IN ('ADMIN', 'LAWYER', 'CLIENT')),
  mfa_secret    VARCHAR(10),        -- Código MFA fictício de 6 dígitos
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: cases
-- Relatos confidenciais de clientes
-- ============================================
CREATE TABLE IF NOT EXISTS cases (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lawyer_id         UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL até atribuição
  title_area        VARCHAR(100) NOT NULL,  -- Área do direito (Civil, Criminal, etc.)
  encrypted_summary TEXT NOT NULL,          -- Resumo cifrado com AES-256
  status            VARCHAR(20) DEFAULT 'TRIAGEM' CHECK (
                      status IN ('TRIAGEM', 'ANALISE', 'EM_ANDAMENTO', 'CONCLUIDO', 'ARQUIVADO')
                    ),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: documents
-- Documentos confidenciais anexados
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id      UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  file_name    VARCHAR(255) NOT NULL,   -- Nome original do arquivo
  file_path    VARCHAR(500) NOT NULL,   -- Caminho no servidor
  file_size    INTEGER,                 -- Tamanho em bytes
  mime_type    VARCHAR(100),
  uploaded_by  UUID NOT NULL REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: messages
-- Histórico de chat seguro por caso
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id      UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  sender_id    UUID NOT NULL REFERENCES users(id),
  message_text TEXT NOT NULL,
  is_read      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_cases_client    ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer    ON cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_status    ON cases(status);
CREATE INDEX IF NOT EXISTS idx_messages_case   ON messages(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_case  ON documents(case_id);

-- ============================================
-- DADOS INICIAIS DE TESTE
-- Senhas: Senha@123 (hash bcrypt gerado separadamente)
-- ============================================

-- Admin supremo
INSERT INTO users (name, email, password_hash, role, mfa_secret) VALUES
(
  'Administrador',
  'admin@justicaedireito.adv.br',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6uk6l5GiNS', -- Senha@123
  'ADMIN',
  '000000'
)
ON CONFLICT (email) DO NOTHING;

-- Advogado A (Ricardo)
INSERT INTO users (name, email, password_hash, role, mfa_secret) VALUES
(
  'Dr. Ricardo Alves',
  'ricardo@justicaedireito.adv.br',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6uk6l5GiNS', -- Senha@123
  'LAWYER',
  '112233'
)
ON CONFLICT (email) DO NOTHING;

-- Advogado B (Ana)
INSERT INTO users (name, email, password_hash, role, mfa_secret) VALUES
(
  'Dra. Ana Costa',
  'ana@justicaedireito.adv.br',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6uk6l5GiNS', -- Senha@123
  'LAWYER',
  '445566'
)
ON CONFLICT (email) DO NOTHING;