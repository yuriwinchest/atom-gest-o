-- VERIFICAR ESTRUTURA DA TABELA FILES - VERSÃO SIMPLIFICADA
-- Execute este SQL no painel do Supabase > SQL Editor

-- 1. Verificar se a tabela existe
SELECT 'Verificando se tabela files existe...' as status;
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'files';

-- 2. Listar todas as colunas
SELECT 'Listando colunas da tabela...' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS
SELECT 'Verificando políticas RLS...' as status;
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'files';

-- 4. Verificar se RLS está habilitado
SELECT 'Verificando se RLS está habilitado...' as status;
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'files';

-- 5. Contar registros na tabela
SELECT 'Contando registros...' as status;
SELECT COUNT(*) as total_registros
FROM files;

-- 6. Verificar registros mais recentes
SELECT 'Verificando registros recentes...' as status;
SELECT id, filename, created_at
FROM files
ORDER BY created_at DESC
LIMIT 5;

SELECT 'Verificação concluída!' as status;
