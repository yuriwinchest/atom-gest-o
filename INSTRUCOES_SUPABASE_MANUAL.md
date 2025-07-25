# INSTRUÇÕES PARA CRIAR TABELAS NO SUPABASE MANUALMENTE

## SITUAÇÃO ATUAL
- ✅ Supabase Storage funcionando 100%
- ❌ Tabelas PostgreSQL não existem no projeto Supabase
- ❌ APIs RPC não disponíveis para execução programática
- 🎯 SOLUÇÃO: Executar SQL manualmente no Dashboard

## COMO EXECUTAR (5 MINUTOS)

### 1. Acesse o Dashboard Supabase
- URL: https://supabase.com/dashboard/projects
- Faça login na sua conta
- Selecione o projeto: `fbqocpozjmuzrdeacktb`

### 2. Vá para o SQL Editor
- No menu lateral esquerdo, clique em **"SQL Editor"**
- Clique em **"New query"** ou **"+ Nova consulta"**

### 3. Cole e Execute o SQL Completo
Copie TODO o código abaixo e cole no editor SQL:

```sql
-- ========================================
-- CRIAÇÃO COMPLETA DAS TABELAS DO SISTEMA
-- ========================================

-- 1. Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabela principal de documentos
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

-- ========================================
-- INSERÇÃO DE DADOS INICIAIS
-- ========================================

-- Usuário administrador
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@empresa.com', 'admin123', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Tipos de documento
INSERT INTO document_types (name) VALUES 
  ('Ofício'),
  ('Memorando'),
  ('Relatório'),
  ('Ata'),
  ('Decreto'),
  ('Lei')
ON CONFLICT (name) DO NOTHING;

-- Órgãos públicos
INSERT INTO public_organs (name) VALUES 
  ('Presidência da República'),
  ('Ministério da Fazenda'),
  ('Ministério da Justiça'),
  ('Câmara dos Deputados'),
  ('Senado Federal')
ON CONFLICT (name) DO NOTHING;

-- Setores responsáveis
INSERT INTO responsible_sectors (name) VALUES 
  ('Departamento Jurídico'),
  ('Secretaria Executiva'),
  ('Assessoria de Comunicação'),
  ('Gabinete'),
  ('Diretoria Administrativa')
ON CONFLICT (name) DO NOTHING;

-- Assuntos principais
INSERT INTO main_subjects (name) VALUES 
  ('Administração Pública'),
  ('Orçamento e Finanças'),
  ('Recursos Humanos'),
  ('Tecnologia da Informação'),
  ('Meio Ambiente')
ON CONFLICT (name) DO NOTHING;

-- Níveis de confidencialidade
INSERT INTO confidentiality_levels (name) VALUES 
  ('Público'),
  ('Restrito'),
  ('Confidencial'),
  ('Secreto')
ON CONFLICT (name) DO NOTHING;

-- Opções de disponibilidade
INSERT INTO availability_options (name) VALUES 
  ('Disponível Online'),
  ('Arquivo Físico'),
  ('Biblioteca'),
  ('Acesso Restrito')
ON CONFLICT (name) DO NOTHING;

-- Opções de idioma
INSERT INTO language_options (name) VALUES 
  ('Português'),
  ('Inglês'),
  ('Espanhol'),
  ('Francês')
ON CONFLICT (name) DO NOTHING;

-- Opções de direitos
INSERT INTO rights_options (name) VALUES 
  ('Domínio Público'),
  ('Direitos Reservados'),
  ('Creative Commons'),
  ('Uso Interno')
ON CONFLICT (name) DO NOTHING;

-- Autoridades do documento
INSERT INTO document_authorities (name) VALUES 
  ('Presidente da República'),
  ('Ministro de Estado'),
  ('Secretário Executivo'),
  ('Diretor Geral'),
  ('Coordenador')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================
SELECT 'Todas as tabelas foram criadas com sucesso!' as status,
       'Total de tabelas: 11' as info,
       'Usuário admin criado: admin@empresa.com / admin123' as credenciais;
```

### 4. Execute o SQL
- Clique no botão **"Run"** ou **"Executar"** (geralmente tem ícone ▶️)
- Aguarde a execução (pode levar alguns segundos)

### 5. Verifique o Resultado
- Se tudo correu bem, você verá uma mensagem de sucesso
- Se houver erros, copie a mensagem de erro e me informe

## RESULTADO ESPERADO
- ✅ 11 tabelas criadas
- ✅ Usuário admin: admin@empresa.com / admin123
- ✅ Dados iniciais em todas as categorias
- ✅ Sistema funcionando com dados autênticos

## EM CASO DE ERRO
Se houver algum erro:
1. Copie a mensagem de erro completa
2. Me informe qual linha causou o problema
3. Vou ajustar o SQL conforme necessário

## APÓS A EXECUÇÃO
Assim que executar, o sistema estará 100% funcional com dados autênticos do PostgreSQL + Supabase Storage!