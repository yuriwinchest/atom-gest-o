-- CORREÇÃO COMPLETA RLS PARA TABELA FILES
-- Execute este SQL no painel do Supabase > SQL Editor

-- 1. Verificar se a tabela files existe
SELECT 'Verificando se tabela files existe...' as status;
SELECT table_name, table_type
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;

-- 2. Verificar estrutura atual da tabela
SELECT 'Verificando estrutura atual...' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS existentes
SELECT 'Verificando políticas RLS existentes...' as status;
SELECT policyname, cmd, permissive
FROM pg_policies
WHERE tablename = 'files';

-- 4. Desabilitar RLS temporariamente
SELECT 'Desabilitando RLS...' as status;
ALTER TABLE files DISABLE ROW LEVEL SECURITY;

-- 5. Reabilitar RLS
SELECT 'Reabilitando RLS...' as status;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- 6. Remover TODAS as políticas existentes
SELECT 'Removendo políticas existentes...' as status;
DROP POLICY IF EXISTS "Allow all operations for service_role" ON files;
DROP POLICY IF EXISTS "Allow public read" ON files;
DROP POLICY IF EXISTS "Allow authenticated insert" ON files;
DROP POLICY IF EXISTS "Allow authenticated update" ON files;
DROP POLICY IF EXISTS "Allow authenticated delete" ON files;
DROP POLICY IF EXISTS "Allow public read" ON files;
DROP POLICY IF EXISTS "Allow public insert" ON files;
DROP POLICY IF EXISTS "Allow public update" ON files;
DROP POLICY IF EXISTS "Allow public delete" ON files;

-- 7. Criar política para service_role (bypass completo RLS)
SELECT 'Criando política para service_role...' as status;
CREATE POLICY "service_role_bypass_all" ON files
FOR ALL USING (auth.role() = 'service_role');

-- 8. Criar política para leitura pública
SELECT 'Criando política de leitura pública...' as status;
CREATE POLICY "public_read_all" ON files
FOR SELECT USING (true);

-- 9. Criar política para inserção por qualquer usuário autenticado
SELECT 'Criando política de inserção...' as status;
CREATE POLICY "authenticated_insert_all" ON files
FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 10. Criar política para atualização por service_role
SELECT 'Criando política de atualização...' as status;
CREATE POLICY "service_role_update_all" ON files
FOR UPDATE USING (auth.role() = 'service_role');

-- 11. Criar política para exclusão por service_role
SELECT 'Criando política de exclusão...' as status;
CREATE POLICY "service_role_delete_all" ON files
FOR DELETE USING (auth.role() = 'service_role');

-- 12. Verificar políticas criadas
SELECT 'Verificando políticas criadas...' as status;
SELECT policyname, cmd, permissive
FROM pg_policies
WHERE tablename = 'files';

-- 13. Verificar configuração RLS da tabela
SELECT 'Verificando configuração RLS...' as status;
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'files';

-- 14. Teste de inserção com TODOS os campos obrigatórios
SELECT 'Testando inserção...' as status;
INSERT INTO files (
    filename,
    original_name,
    file_path,
    file_size,
    mime_type,
    file_type,
    title,
    main_subject,
    uploaded_by,
    is_public,
    environment,
    metadata
) VALUES (
    'teste-rls.txt',
    'teste-rls.txt',
    'teste/teste.txt',
    100,
    'text/plain',
    'documents',
    'Teste RLS',
    'Teste',
    'system',
    true,
    'production',
    '{"teste": true, "status": "funcionando"}'
) ON CONFLICT DO NOTHING;

-- 15. Verificar se o teste foi inserido
SELECT 'Verificando teste de inserção...' as status;
SELECT id, filename, original_name, title, created_at
FROM files
WHERE filename = 'teste-rls.txt'
ORDER BY created_at DESC
LIMIT 1;

-- 16. Limpar teste
SELECT 'Limpando teste...' as status;
DELETE FROM files WHERE filename = 'teste-rls.txt';

-- 17. Verificar estrutura final
SELECT 'Verificando estrutura final...' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;

SELECT 'Correção RLS COMPLETA concluída com sucesso!' as status;
