-- CORRE??O RLS PARA TABELA FILES
-- Execute este SQL no painel do Supabase > SQL Editor

-- 1. Desabilitar RLS temporariamente
ALTER TABLE files DISABLE ROW LEVEL SECURITY;

-- 2. Reabilitar RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- 3. Criar pol?tica para permitir todas as opera??es para service_role (bypass RLS)
CREATE POLICY "Allow all operations for service_role" ON files
FOR ALL USING (auth.role() = 'service_role');

-- 4. Criar pol?tica para permitir leitura p?blica
CREATE POLICY "Allow public read" ON files
FOR SELECT USING (true);

-- 5. Criar pol?tica para permitir inser??o por usu?rios autenticados ou service_role
CREATE POLICY "Allow authenticated insert" ON files
FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 6. Criar pol?tica para permitir atualiza??o por service_role
CREATE POLICY "Allow authenticated update" ON files
FOR UPDATE USING (auth.role() = 'service_role');

-- 7. Criar pol?tica para permitir exclus?o por service_role
CREATE POLICY "Allow authenticated delete" ON files
FOR DELETE USING (auth.role() = 'service_role');

-- 8. Verificar se as pol?ticas foram criadas (consulta simplificada)
SELECT policyname, cmd, permissive
FROM pg_policies
WHERE tablename = 'files';

-- 9. Verificar configura??o RLS da tabela (consulta simplificada)
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'files';

-- 10. Verificar se a tabela files existe
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'files';

-- 11. Listar todas as colunas da tabela files
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;
