-- Configuração de políticas RLS para o Supabase
-- Execute este SQL no painel do Supabase > SQL Editor

-- 1. Habilitar RLS na tabela homepage_content
ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;

-- 2. Criar política para permitir leitura pública (qualquer pessoa pode ver o conteúdo)
CREATE POLICY "Permitir leitura pública de homepage_content" ON homepage_content
FOR SELECT USING (true);

-- 3. Criar política para permitir inserção por usuários autenticados
CREATE POLICY "Permitir inserção por usuários autenticados" ON homepage_content
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Criar política para permitir atualização por usuários autenticados
CREATE POLICY "Permitir atualização por usuários autenticados" ON homepage_content
FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. Criar política para permitir exclusão por usuários autenticados
CREATE POLICY "Permitir exclusão por usuários autenticados" ON homepage_content
FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Criar política para permitir todas as operações por usuários com role 'service_role'
-- Esta política permite bypass completo do RLS para operações administrativas
CREATE POLICY "Permitir todas as operações para service_role" ON homepage_content
FOR ALL USING (auth.role() = 'service_role');

-- 7. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'homepage_content';

-- 8. Verificar configuração RLS da tabela
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'homepage_content';

-- 9. Política alternativa: permitir todas as operações para qualquer usuário autenticado
-- (Use esta se a anterior não funcionar)
-- DROP POLICY IF EXISTS "Permitir todas as operações para service_role" ON homepage_content;
-- CREATE POLICY "Permitir todas as operações para usuários autenticados" ON homepage_content
-- FOR ALL USING (auth.role() = 'authenticated');

-- 10. Política mais permissiva: desabilitar RLS temporariamente para testes
-- (Use apenas para testes, remova em produção)
-- ALTER TABLE homepage_content DISABLE ROW LEVEL SECURITY;
