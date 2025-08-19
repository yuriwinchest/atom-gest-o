-- CRIAR TODAS AS TABELAS DE CATEGORIAS NO SUPABASE
-- Execute este SQL no Editor SQL do Supabase

-- 1. Criar tabela de tipos de documento
CREATE TABLE IF NOT EXISTS document_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Criar tabela de órgãos públicos
CREATE TABLE IF NOT EXISTS public_organs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Criar tabela de setores responsáveis
CREATE TABLE IF NOT EXISTS responsible_sectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Criar tabela de assuntos principais
CREATE TABLE IF NOT EXISTS main_subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Criar tabela de níveis de confidencialidade
CREATE TABLE IF NOT EXISTS confidentiality_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Criar tabela de opções de disponibilidade
CREATE TABLE IF NOT EXISTS availability_options (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Criar tabela de opções de idioma
CREATE TABLE IF NOT EXISTS language_options (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Criar tabela de opções de direitos
CREATE TABLE IF NOT EXISTS rights_options (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. Criar tabela de autoridades do documento
CREATE TABLE IF NOT EXISTS document_authorities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 10. Criar tabela de conteúdo da homepage
CREATE TABLE IF NOT EXISTS homepage_content (
    id SERIAL PRIMARY KEY,
    section VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 11. Criar tabela de páginas do rodapé
CREATE TABLE IF NOT EXISTS footer_pages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- DESABILITAR RLS PARA TODAS AS TABELAS (permitir acesso público)
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_organs ENABLE ROW LEVEL SECURITY;
ALTER TABLE responsible_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE main_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE confidentiality_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE language_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE rights_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_authorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_pages ENABLE ROW LEVEL SECURITY;

-- CRIAR POLÍTICAS DE ACESSO PÚBLICO
CREATE POLICY "Allow public read" ON document_types FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON document_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON document_types FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON document_types FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON public_organs FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public_organs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public_organs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public_organs FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON responsible_sectors FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON responsible_sectors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON responsible_sectors FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON responsible_sectors FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON main_subjects FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON main_subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON main_subjects FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON main_subjects FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON confidentiality_levels FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON confidentiality_levels FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON confidentiality_levels FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON confidentiality_levels FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON availability_options FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON availability_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON availability_options FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON availability_options FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON language_options FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON language_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON language_options FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON language_options FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON rights_options FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON rights_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON rights_options FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON rights_options FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON document_authorities FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON document_authorities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON document_authorities FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON document_authorities FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON homepage_content FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON homepage_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON homepage_content FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON homepage_content FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON footer_pages FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON footer_pages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON footer_pages FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON footer_pages FOR DELETE USING (true);

-- POPULAR COM DADOS INICIAIS
-- Tipos de documento
INSERT INTO document_types (name) VALUES
('Ofício'), ('Memorando'), ('Relatório'), ('Ata'), ('Decreto'),
('Lei'), ('Portaria'), ('Resolução'), ('Circular'), ('Edital'),
('Contrato'), ('Convênio'), ('Parecer'), ('Nota Técnica'), ('Carta')
ON CONFLICT (name) DO NOTHING;

-- Órgãos públicos
INSERT INTO public_organs (name) VALUES
('Presidência da República'), ('Ministério da Fazenda'),
('Ministério da Justiça'), ('Câmara dos Deputados'),
('Senado Federal'), ('Ministério da Saúde'),
('Ministério da Educação'), ('Tribunal de Contas da União'),
('Ministério do Meio Ambiente'), ('Controladoria-Geral da União')
ON CONFLICT (name) DO NOTHING;

-- Setores responsáveis
INSERT INTO responsible_sectors (name) VALUES
('Departamento Jurídico'), ('Secretaria Executiva'),
('Assessoria de Comunicação'), ('Gabinete'),
('Diretoria Administrativa'), ('Departamento de Recursos Humanos'),
('Departamento Financeiro'), ('Departamento de TI'),
('Ouvidoria'), ('Controladoria Interna')
ON CONFLICT (name) DO NOTHING;

-- Assuntos principais
INSERT INTO main_subjects (name) VALUES
('Administração Pública'), ('Orçamento e Finanças'),
('Recursos Humanos'), ('Tecnologia da Informação'),
('Meio Ambiente'), ('Saúde'), ('Educação'),
('Segurança Pública'), ('Infraestrutura'), ('Cultura e Esporte')
ON CONFLICT (name) DO NOTHING;

-- Níveis de confidencialidade
INSERT INTO confidentiality_levels (name) VALUES
('Público'), ('Restrito'), ('Confidencial'), ('Secreto'), ('Ultra-secreto')
ON CONFLICT (name) DO NOTHING;

-- Opções de disponibilidade
INSERT INTO availability_options (name) VALUES
('Disponível Online'), ('Arquivo Físico'), ('Biblioteca'),
('Acesso Restrito'), ('Em Digitalização'), ('Temporariamente Indisponível')
ON CONFLICT (name) DO NOTHING;

-- Opções de idioma
INSERT INTO language_options (name) VALUES
('Português'), ('Inglês'), ('Espanhol'), ('Francês'),
('Alemão'), ('Italiano'), ('Chinês'), ('Japonês')
ON CONFLICT (name) DO NOTHING;

-- Opções de direitos
INSERT INTO rights_options (name) VALUES
('Domínio Público'), ('Direitos Reservados'), ('Creative Commons'),
('Uso Interno'), ('Licença Comercial'), ('Uso Educacional')
ON CONFLICT (name) DO NOTHING;

-- Autoridades do documento
INSERT INTO document_authorities (name) VALUES
('Presidente'), ('Ministro'), ('Secretário'), ('Diretor'),
('Coordenador'), ('Chefe de Gabinete'), ('Procurador'),
('Auditor'), ('Assessor'), ('Gerente')
ON CONFLICT (name) DO NOTHING;
