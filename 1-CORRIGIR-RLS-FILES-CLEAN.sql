-- CORREÇÃO RLS PARA TABELA FILES
-- Execute este SQL no painel do Supabase > SQL Editor

ALTER TABLE files DISABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for service_role" ON files
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow public read" ON files
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON files
FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow authenticated update" ON files
FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Allow authenticated delete" ON files
FOR DELETE USING (auth.role() = 'service_role');

SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'files';

SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'files';

SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'files';

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;
