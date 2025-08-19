# ⚠️ CONFIGURAÇÃO URGENTE DO SUPABASE ⚠️

## 🔴 AS CATEGORIAS NÃO ESTÃO FUNCIONANDO PORQUE AS TABELAS NÃO EXISTEM NO SUPABASE

Para resolver o problema das categorias que não estão salvando, você precisa executar o SQL abaixo no Supabase Dashboard.

## 📋 INSTRUÇÕES RÁPIDAS (5 MINUTOS)

### 1️⃣ Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard/projects
- Faça login com sua conta
- Selecione o projeto: **fbqocpozjmuzrdeacktb**

### 2️⃣ Abra o SQL Editor
- No menu lateral esquerdo, clique em **"SQL Editor"**
- Clique em **"New query"** ou **"+ Nova consulta"**

### 3️⃣ Cole TODO o código SQL abaixo:

```sql
-- ========================================
-- CRIAR TODAS AS TABELAS DE CATEGORIAS
-- ========================================

-- 1. Tipos de Documento
CREATE TABLE IF NOT EXISTS document_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Órgãos Públicos
CREATE TABLE IF NOT EXISTS public_organs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Setores Responsáveis
CREATE TABLE IF NOT EXISTS responsible_sectors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Assuntos Principais
CREATE TABLE IF NOT EXISTS main_subjects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Níveis de Confidencialidade
CREATE TABLE IF NOT EXISTS confidentiality_levels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Opções de Disponibilidade
CREATE TABLE IF NOT EXISTS availability_options (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Opções de Idioma
CREATE TABLE IF NOT EXISTS language_options (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Opções de Direitos
CREATE TABLE IF NOT EXISTS rights_options (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Autoridades de Documento
CREATE TABLE IF NOT EXISTS document_authorities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- INSERIR DADOS INICIAIS NAS CATEGORIAS
-- ========================================

-- Tipos de Documento
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

-- Órgãos Públicos
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

-- Setores Responsáveis
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

-- Assuntos Principais
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

-- Níveis de Confidencialidade
INSERT INTO confidentiality_levels (name) VALUES
  ('Público'),
  ('Restrito'),
  ('Confidencial'),
  ('Secreto'),
  ('Ultra-secreto')
ON CONFLICT (name) DO NOTHING;

-- Opções de Disponibilidade
INSERT INTO availability_options (name) VALUES
  ('Disponível Online'),
  ('Arquivo Físico'),
  ('Biblioteca'),
  ('Acesso Restrito'),
  ('Em Digitalização'),
  ('Temporariamente Indisponível')
ON CONFLICT (name) DO NOTHING;

-- Opções de Idioma
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

-- Opções de Direitos
INSERT INTO rights_options (name) VALUES
  ('Domínio Público'),
  ('Direitos Reservados'),
  ('Creative Commons'),
  ('Uso Interno'),
  ('Licença Comercial'),
  ('Uso Educacional')
ON CONFLICT (name) DO NOTHING;

-- Autoridades de Documento
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
```

### 4️⃣ Execute o SQL
- Clique no botão **"Run"** ou **"Executar"** (geralmente um botão verde)
- Aguarde a confirmação de sucesso

### 5️⃣ Pronto!
Após executar o SQL acima, as categorias funcionarão corretamente:
- ✅ Os dropdowns mostrarão as opções
- ✅ Novas categorias serão salvas
- ✅ Tudo funcionará no Supabase

## 🔍 Verificação
Para verificar se funcionou, você pode executar este SQL no mesmo editor:

```sql
SELECT 'document_types' as tabela, COUNT(*) as total FROM document_types
UNION ALL
SELECT 'public_organs', COUNT(*) FROM public_organs
UNION ALL
SELECT 'responsible_sectors', COUNT(*) FROM responsible_sectors
UNION ALL
SELECT 'main_subjects', COUNT(*) FROM main_subjects;
```

Você deve ver números maiores que zero em cada tabela.

## ⚡ Após executar o SQL no Supabase:
1. Recarregue a página do sistema
2. As categorias aparecerão nos dropdowns
3. Você poderá criar novas categorias usando o botão "+"

---
**IMPORTANTE:** Este SQL precisa ser executado DIRETAMENTE no Supabase Dashboard, não pode ser executado via código.
