-- CORREÇÃO COMPLETA DE PERMISSÕES SUPABASE
-- Execute este script no SQL Editor do Supabase

-- 1. Desabilitar RLS temporariamente para todas as tabelas
ALTER TABLE document_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE main_subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public_organs DISABLE ROW LEVEL SECURITY;
ALTER TABLE responsible_sectors DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE news DISABLE ROW LEVEL SECURITY;
ALTER TABLE features DISABLE ROW LEVEL SECURITY;

-- 2. Garantir que as tabelas existem
CREATE TABLE IF NOT EXISTS document_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS main_subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public_organs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS responsible_sectors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Inserir dados de teste se não existirem
INSERT INTO document_types (name, category)
VALUES
  ('Ofício', 'Administrativo'),
  ('Memorando', 'Administrativo'),
  ('Relatório', 'Técnico'),
  ('Ata', 'Reunião'),
  ('Contrato', 'Jurídico')
ON CONFLICT (name) DO NOTHING;

INSERT INTO main_subjects (name)
VALUES
  ('Administração'),
  ('Finanças'),
  ('Recursos Humanos'),
  ('Tecnologia'),
  ('Jurídico')
ON CONFLICT (name) DO NOTHING;

-- 4. Verificar se os dados foram inseridos
SELECT 'document_types' as tabela, COUNT(*) as total FROM document_types
UNION ALL
SELECT 'main_subjects' as tabela, COUNT(*) as total FROM main_subjects;

-- 5. Garantir permissões públicas (TEMPORÁRIO - apenas para teste)
GRANT ALL ON document_types TO anon;
GRANT ALL ON main_subjects TO anon;
GRANT ALL ON public_organs TO anon;
GRANT ALL ON responsible_sectors TO anon;
GRANT ALL ON documents TO anon;

-- 6. Garantir sequências
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
