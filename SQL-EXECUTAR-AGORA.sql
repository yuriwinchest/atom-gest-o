-- =====================================================
-- EXECUTE ESTE SQL COMPLETO NO SUPABASE SQL EDITOR
-- =====================================================

-- PARTE 1: CRIAR TODAS AS TABELAS DE CATEGORIAS
-- =====================================================

CREATE TABLE IF NOT EXISTS document_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
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

-- PARTE 2: INSERIR DADOS NAS TABELAS
-- =====================================================

INSERT INTO document_types (name) VALUES
  ('Ofício'),
  ('Memorando'),
  ('Relatório'),
  ('Ata'),
  ('Decreto'),
  ('Lei'),
  ('Portaria'),
  ('Resolução'),
  ('Circular'),
  ('Edital'),
  ('Contrato'),
  ('Convênio'),
  ('Parecer'),
  ('Nota Técnica'),
  ('Carta')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public_organs (name) VALUES
  ('Presidência da República'),
  ('Ministério da Fazenda'),
  ('Ministério da Justiça'),
  ('Câmara dos Deputados'),
  ('Senado Federal'),
  ('Ministério da Saúde'),
  ('Ministério da Educação'),
  ('Tribunal de Contas da União'),
  ('Ministério do Meio Ambiente'),
  ('Controladoria-Geral da União')
ON CONFLICT (name) DO NOTHING;

INSERT INTO responsible_sectors (name) VALUES
  ('Departamento Jurídico'),
  ('Secretaria Executiva'),
  ('Assessoria de Comunicação'),
  ('Gabinete'),
  ('Diretoria Administrativa'),
  ('Departamento de Recursos Humanos'),
  ('Departamento Financeiro'),
  ('Departamento de TI'),
  ('Ouvidoria'),
  ('Controladoria Interna')
ON CONFLICT (name) DO NOTHING;

INSERT INTO main_subjects (name) VALUES
  ('Administração Pública'),
  ('Orçamento e Finanças'),
  ('Recursos Humanos'),
  ('Tecnologia da Informação'),
  ('Meio Ambiente'),
  ('Saúde'),
  ('Educação'),
  ('Segurança Pública'),
  ('Infraestrutura'),
  ('Cultura e Esporte')
ON CONFLICT (name) DO NOTHING;

INSERT INTO confidentiality_levels (name) VALUES
  ('Público'),
  ('Restrito'),
  ('Confidencial'),
  ('Secreto'),
  ('Ultra-secreto')
ON CONFLICT (name) DO NOTHING;

INSERT INTO availability_options (name) VALUES
  ('Disponível Online'),
  ('Arquivo Físico'),
  ('Biblioteca'),
  ('Acesso Restrito'),
  ('Em Digitalização'),
  ('Temporariamente Indisponível')
ON CONFLICT (name) DO NOTHING;

INSERT INTO language_options (name) VALUES
  ('Português'),
  ('Inglês'),
  ('Espanhol'),
  ('Francês'),
  ('Alemão'),
  ('Italiano'),
  ('Chinês'),
  ('Japonês')
ON CONFLICT (name) DO NOTHING;

INSERT INTO rights_options (name) VALUES
  ('Domínio Público'),
  ('Direitos Reservados'),
  ('Creative Commons'),
  ('Uso Interno'),
  ('Licença Comercial'),
  ('Uso Educacional')
ON CONFLICT (name) DO NOTHING;

INSERT INTO document_authorities (name) VALUES
  ('Presidente'),
  ('Ministro'),
  ('Secretário'),
  ('Diretor'),
  ('Coordenador'),
  ('Chefe de Gabinete'),
  ('Procurador'),
  ('Auditor'),
  ('Assessor'),
  ('Gerente')
ON CONFLICT (name) DO NOTHING;

-- PARTE 3: VERIFICAR SE FUNCIONOU
-- =====================================================

SELECT 'VERIFICAÇÃO DE TABELAS CRIADAS:' as info;

SELECT
  'document_types' as tabela,
  COUNT(*) as total_registros
FROM document_types

UNION ALL

SELECT
  'public_organs',
  COUNT(*)
FROM public_organs

UNION ALL

SELECT
  'responsible_sectors',
  COUNT(*)
FROM responsible_sectors

UNION ALL

SELECT
  'main_subjects',
  COUNT(*)
FROM main_subjects

UNION ALL

SELECT
  'confidentiality_levels',
  COUNT(*)
FROM confidentiality_levels

UNION ALL

SELECT
  'availability_options',
  COUNT(*)
FROM availability_options

UNION ALL

SELECT
  'language_options',
  COUNT(*)
FROM language_options

UNION ALL

SELECT
  'rights_options',
  COUNT(*)
FROM rights_options

UNION ALL

SELECT
  'document_authorities',
  COUNT(*)
FROM document_authorities;
