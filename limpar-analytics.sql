-- Script para limpar dados de exemplo das tabelas de analytics
-- Execute este script no Supabase SQL Editor

-- Limpar dados de exemplo da tabela search_analytics
DELETE FROM search_analytics WHERE search_term IN ('exemplo', 'teste', 'busca');

-- Limpar dados de exemplo da tabela document_analytics
DELETE FROM document_analytics WHERE action_type IN ('download', 'view') AND user_ip = '127.0.0.1';

-- Verificar se as tabelas foram limpas
SELECT 'search_analytics' as tabela, COUNT(*) as total FROM search_analytics
UNION ALL
SELECT 'document_analytics' as tabela, COUNT(*) as total FROM document_analytics;

-- Verificar dados restantes
SELECT 'search_analytics restante:' as info;
SELECT * FROM search_analytics LIMIT 5;

SELECT 'document_analytics restante:' as info;
SELECT * FROM document_analytics LIMIT 5;
