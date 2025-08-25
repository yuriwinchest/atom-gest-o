-- 🔍 VERIFICAR SCHEMA REAL DA TABELA search_analytics
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'search_analytics' 
ORDER BY ordinal_position;

-- 2. Verificar se a tabela existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'search_analytics';

-- 3. Verificar dados existentes (se houver)
SELECT * FROM search_analytics LIMIT 5;

-- 4. Verificar constraints
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'search_analytics';
