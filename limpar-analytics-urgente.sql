-- ⚠️ URGENTE: Limpar COMPLETAMENTE as tabelas de analytics
-- Execute este script NO SUPABASE SQL EDITOR AGORA!

-- 1. Limpar TODOS os dados das tabelas
TRUNCATE TABLE search_analytics RESTART IDENTITY CASCADE;
TRUNCATE TABLE document_analytics RESTART IDENTITY CASCADE;

-- 2. Verificar se foram limpas
SELECT 'search_analytics' as tabela, COUNT(*) as total FROM search_analytics
UNION ALL
SELECT 'document_analytics' as tabela, COUNT(*) as total FROM document_analytics;

-- 3. Resultado esperado: ambas devem retornar 0
-- Depois disso, os contadores da homepage começarão do zero!
