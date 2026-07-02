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
  area_atuacao  VARCHAR(100),       -- Especialidade do advogado (só para role = LAWYER)
  bio           TEXT,               -- Mini-bio pública do advogado (só para role = LAWYER)
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
INSERT INTO users (name, email, password_hash, role, mfa_secret, area_atuacao, bio) VALUES
(
  'Dr. Ricardo Alves',
  'ricardo@justicaedireito.adv.br',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6uk6l5GiNS', -- Senha@123
  'LAWYER',
  '112233',
  'Direito Civil',
  'Especialista em contratos e litígios empresariais com mais de 12 anos de experiência.'
)
ON CONFLICT (email) DO NOTHING;

-- Advogado B (Ana)
INSERT INTO users (name, email, password_hash, role, mfa_secret, area_atuacao, bio) VALUES
(
  'Dra. Ana Costa',
  'ana@justicaedireito.adv.br',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6uk6l5GiNS', -- Senha@123
  'LAWYER',
  '445566',
  'Direito de Família',
  'Atuação em divórcio, guarda de filhos e processos de herança com abordagem humanizada.'
)
ON CONFLICT (email) DO NOTHING;

-- 8 advogados adicionais — um para cada área restante
INSERT INTO users (name, email, password_hash, role, mfa_secret, area_atuacao, bio) VALUES
('Dr. Paulo Mendes',   'paulo@justicaedireito.adv.br',   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6uk6l5GiNS', 'LAWYER', '111111', 'Direito Criminal',
  'Defesa criminal e casos de crimes cibernéticos. Membro da Comissão de Direito Digital da OAB.'),
('Dra. Clara Rocha',   'clara@justicaedireito.adv.br',   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6uk6l5GiNS', 'LAWYER', '222222', 'Direito Trabalhista',
  'Especialista em direito do trabalho, demissões, assédio e direitos do empregado.'),
('Dr. Henrique Lima',  'henrique@justicaedireito.adv.br','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6uk6l5GiNS', 'LAWYER', '333333', 'Direito Empresarial',
  'Planejamento societário, fusões e aquisições para pequenas e médias empresas.'),
('Dra. Beatriz Souza', 'beatriz@justicaedireito.adv.br', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6uk6l5GiNS', 'LAWYER', '444444', 'Direito Tributário',
  'Planejamento tributário e recuperação de créditos fiscais para pessoas físicas e jurídicas.'),
('Dr. Marcos Teixeira','marcos@justicaedireito.adv.br',  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6uk6l5GiNS', 'LAWYER', '555555', 'Direito Previdenciário',
  'Aposentadorias, revisões de benefício e ações contra o INSS.'),
('Dra. Juliana Ferraz','juliana@justicaedireito.adv.br', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6uk6l5GiNS', 'LAWYER', '666666', 'Direito do Consumidor',
  'Defesa de consumidores em disputas com bancos, varejo e companhias aéreas.'),
('Dr. Fernando Duarte','fernando@justicaedireito.adv.br','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6uk6l5GiNS', 'LAWYER', '777777', 'Direito Imobiliário',
  'Contratos de compra e venda, usucapião e regularização de imóveis.'),
('Dra. Camila Nogueira','camila@justicaedireito.adv.br', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6uk6l5GiNS', 'LAWYER', '888888', 'Direito Digital',
  'Proteção de dados (LGPD), crimes cibernéticos e contratos de tecnologia.')
ON CONFLICT (email) DO NOTHING;

-- 1 cliente de demonstração
INSERT INTO users (name, email, password_hash, role) VALUES
('Cliente Demo', 'cliente@teste.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6uk6l5GiNS', 'CLIENT')
ON CONFLICT (email) DO NOTHING;