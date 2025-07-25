-- SQL para criar todas as tabelas no Supabase
-- Execute este arquivo no SQL Editor do Supabase Dashboard

-- 1. Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabela de documentos
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB,
  author TEXT,
  category TEXT,
  tags TEXT[],
  file_path TEXT,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  user_id INTEGER
);

-- 3. Tabelas de categorias dinâmicas
CREATE TABLE IF NOT EXISTS document_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public_organs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS responsible_sectors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS main_subjects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS confidentiality_levels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS availability_options (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS language_options (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rights_options (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_authorities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Inserir usuário admin padrão
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@empresa.com', 'admin123', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 5. Inserir dados padrão nas tabelas de categorias
INSERT INTO document_types (name) VALUES 
  ('Ofício'),
  ('Memorando'),
  ('Relatório'),
  ('Ata'),
  ('Decreto'),
  ('Lei')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public_organs (name) VALUES 
  ('Presidência da República'),
  ('Ministério da Fazenda'),
  ('Ministério da Justiça'),
  ('Câmara dos Deputados'),
  ('Senado Federal')
ON CONFLICT (name) DO NOTHING;

INSERT INTO responsible_sectors (name) VALUES 
  ('Departamento Jurídico'),
  ('Secretaria Executiva'),
  ('Assessoria de Comunicação'),
  ('Gabinete'),
  ('Diretoria Administrativa')
ON CONFLICT (name) DO NOTHING;

INSERT INTO main_subjects (name) VALUES 
  ('Administração Pública'),
  ('Orçamento e Finanças'),
  ('Recursos Humanos'),
  ('Tecnologia da Informação'),
  ('Meio Ambiente')
ON CONFLICT (name) DO NOTHING;

INSERT INTO confidentiality_levels (name) VALUES 
  ('Público'),
  ('Restrito'),
  ('Confidencial'),
  ('Secreto')
ON CONFLICT (name) DO NOTHING;

INSERT INTO availability_options (name) VALUES 
  ('Disponível Online'),
  ('Arquivo Físico'),
  ('Biblioteca'),
  ('Acesso Restrito')
ON CONFLICT (name) DO NOTHING;

INSERT INTO language_options (name) VALUES 
  ('Português'),
  ('Inglês'),
  ('Espanhol'),
  ('Francês')
ON CONFLICT (name) DO NOTHING;

INSERT INTO rights_options (name) VALUES 
  ('Domínio Público'),
  ('Direitos Reservados'),
  ('Creative Commons'),
  ('Uso Interno')
ON CONFLICT (name) DO NOTHING;

INSERT INTO document_authorities (name) VALUES 
  ('Presidente da República'),
  ('Ministro de Estado'),
  ('Secretário Executivo'),
  ('Diretor Geral'),
  ('Coordenador')
ON CONFLICT (name) DO NOTHING;

-- Concluído
SELECT 'Todas as tabelas e dados foram criados com sucesso!' as status;