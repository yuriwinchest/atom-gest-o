-- CORREÇÃO RLS PARA TABELA FILES - VERSÃO SIMPLIFICADA
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

-- 4. Criar política para service_role (bypass RLS)
SELECT 'Criando política para service_role...' as status;
CREATE POLICY "Allow all operations for service_role" ON files
FOR ALL USING (auth.role() = 'service_role');

-- 5. Criar política para leitura pública
SELECT 'Criando política de leitura pública...' as status;
CREATE POLICY "Allow public read" ON files
FOR SELECT USING (true);

-- 6. Criar política para inserção
SELECT 'Criando política de inserção...' as status;
CREATE POLICY "Allow authenticated insert" ON files
FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 7. Criar política para atualização
SELECT 'Criando política de atualização...' as status;
CREATE POLICY "Allow authenticated update" ON files
FOR UPDATE USING (auth.role() = 'service_role');

-- 8. Criar política para exclusão
SELECT 'Criando política de exclusão...' as status;
CREATE POLICY "Allow authenticated delete" ON files
FOR DELETE USING (auth.role() = 'service_role');

-- 9. Verificar políticas criadas
SELECT 'Verificando políticas criadas...' as status;
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'files';

-- 10. Verificar estrutura da tabela
SELECT 'Verificando estrutura da tabela...' as status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;

-- 11. Teste de inserção (opcional - remova se der erro)
-- SELECT 'Testando inserção...' as status;
-- INSERT INTO files (filename, file_path, file_size, mime_type)
-- VALUES ('teste-rls.txt', 'teste/teste.txt', 100, 'text/plain')
-- ON CONFLICT DO NOTHING;

SELECT 'Correção RLS concluída!' as status;
