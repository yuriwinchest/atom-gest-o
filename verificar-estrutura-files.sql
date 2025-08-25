-- VERIFICAR ESTRUTURA DA TABELA FILES
-- Execute este SQL no painel do Supabase > SQL Editor

-- 1. Verificar todas as colunas da tabela files
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;

-- 2. Verificar se a tabela existe
SELECT
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name = 'files';

-- 3. Verificar políticas RLS ativas
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'files';

-- 4. Verificar índices da tabela
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'files';

-- 5. Verificar constraints da tabela
SELECT
    conname,
    contype,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'files'::regclass;

-- 6. Verificar se RLS está habilitado
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'files';

-- 7. Verificar estatísticas da tabela (se disponível)
SELECT
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables
WHERE tablename = 'files';

-- 8. Verificar permissões da tabela
SELECT
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants
WHERE table_name = 'files';

-- 9. Verificar colunas com comentários
SELECT
    c.column_name,
    c.data_type,
    c.is_nullable,
    pgd.description as column_comment
FROM information_schema.columns c
LEFT JOIN pg_catalog.pg_statio_all_tables st ON (c.table_name = st.relname)
LEFT JOIN pg_catalog.pg_description pgd ON (
    pgd.objoid = st.relid AND
    pgd.objsubid = c.ordinal_position
)
WHERE c.table_name = 'files'
ORDER BY c.ordinal_position;
