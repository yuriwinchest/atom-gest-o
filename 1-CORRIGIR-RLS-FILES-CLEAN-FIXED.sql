-- CORREÇÃO RLS PARA TABELA FILES - VERSÃO CORRIGIDA
-- Execute este SQL no painel do Supabase > SQL Editor

-- 1. Verificar se a tabela files existe
SELECT 'Verificando se tabela files existe...' as status;
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'files';

-- 2. Desabilitar RLS temporariamente
SELECT 'Desabilitando RLS...' as status;
ALTER TABLE files DISABLE ROW LEVEL SECURITY;

-- 3. Reabilitar RLS
SELECT 'Reabilitando RLS...' as status;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas existentes (se houver)
SELECT 'Removendo políticas existentes...' as status;
DROP POLICY IF EXISTS "Allow all operations for service_role" ON files;
DROP POLICY IF EXISTS "Allow public read" ON files;
DROP POLICY IF EXISTS "Allow authenticated insert" ON files;
DROP POLICY IF EXISTS "Allow authenticated update" ON files;
DROP POLICY IF EXISTS "Allow authenticated delete" ON files;

-- 5. Criar política para service_role (bypass RLS)
SELECT 'Criando política para service_role...' as status;
CREATE POLICY "Allow all operations for service_role" ON files
FOR ALL USING (auth.role() = 'service_role');

-- 6. Criar política para leitura pública
SELECT 'Criando política de leitura pública...' as status;
CREATE POLICY "Allow public read" ON files
FOR SELECT USING (true);

-- 7. Criar política para inserção
SELECT 'Criando política de inserção...' as status;
CREATE POLICY "Allow authenticated insert" ON files
FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 8. Criar política para atualização
SELECT 'Criando política de atualização...' as status;
CREATE POLICY "Allow authenticated update" ON files
FOR UPDATE USING (auth.role() = 'service_role');

-- 9. Criar política para exclusão
SELECT 'Criando política de exclusão...' as status;
CREATE POLICY "Allow authenticated delete" ON files
FOR DELETE USING (auth.role() = 'service_role');

-- 10. Verificar políticas criadas
SELECT 'Verificando políticas criadas...' as status;
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'files';

-- 11. Verificar estrutura da tabela
SELECT 'Verificando estrutura da tabela...' as status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;

SELECT 'Correção RLS concluída com sucesso!' as status;
