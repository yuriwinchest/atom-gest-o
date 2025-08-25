-- Script para limpar COMPLETAMENTE as tabelas de analytics
-- Execute este script no Supabase SQL Editor

-- Limpar TODOS os dados das tabelas de analytics
TRUNCATE TABLE search_analytics RESTART IDENTITY CASCADE;
TRUNCATE TABLE document_analytics RESTART IDENTITY CASCADE;

-- Verificar se as tabelas foram limpas
SELECT 'search_analytics' as tabela, COUNT(*) as total FROM search_analytics
UNION ALL
SELECT 'document_analytics' as tabela, COUNT(*) as total FROM document_analytics;

-- As tabelas devem estar vazias agora
-- Os contadores da homepage começarão do zero e funcionarão com dados reais
