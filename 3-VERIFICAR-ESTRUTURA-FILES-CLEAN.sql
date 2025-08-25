-- VERIFICAR ESTRUTURA DA TABELA FILES
-- Execute este SQL no painel do Supabase > SQL Editor

SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'files';

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;

SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'files';

SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'files';

SELECT COUNT(*) as total_registros
FROM files;

SELECT id, filename, created_at
FROM files
ORDER BY created_at DESC
LIMIT 5;
