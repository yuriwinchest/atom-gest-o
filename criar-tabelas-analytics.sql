-- CRIAR TABELAS DE ANALYTICS NO SUPABASE
-- Execute este SQL no Editor SQL do Supabase para rastrear visitas e downloads

-- 1. TABELA PARA RASTREAR BUSCAS (VISITAS)
CREATE TABLE IF NOT EXISTS search_analytics (
    id SERIAL PRIMARY KEY,
    search_term VARCHAR(255) NOT NULL,
    search_type VARCHAR(100) DEFAULT 'general',
    results_count INTEGER DEFAULT 0,
    page_url TEXT,
    user_ip VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. TABELA PARA RASTREAR AÇÕES EM DOCUMENTOS (DOWNLOADS, VISUALIZAÇÕES)
CREATE TABLE IF NOT EXISTS document_analytics (
    id SERIAL PRIMARY KEY,
    document_id INTEGER,
    action_type VARCHAR(100) NOT NULL, -- 'download', 'view', 'share'
    referrer TEXT,
    user_ip VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. DESABILITAR RLS PARA PERMITIR INSERÇÃO
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analytics ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS DE ACESSO
CREATE POLICY "Allow public insert on search_analytics" ON search_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on search_analytics" ON search_analytics FOR SELECT USING (true);

CREATE POLICY "Allow public insert on document_analytics" ON document_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on document_analytics" ON document_analytics FOR SELECT USING (true);

-- 5. CRIAR ÍNDICES PARA MELHOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_search_analytics_created_at ON search_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_search_analytics_search_term ON search_analytics(search_term);

CREATE INDEX IF NOT EXISTS idx_document_analytics_created_at ON document_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_document_analytics_action_type ON document_analytics(action_type);
CREATE INDEX IF NOT EXISTS idx_document_analytics_document_id ON document_analytics(document_id);

-- 6. INSERIR DADOS DE EXEMPLO PARA TESTE
INSERT INTO search_analytics (search_term, search_type, results_count, page_url, user_ip, user_agent, session_id) VALUES
('documento teste', 'general', 5, '/documentos-publicos', '127.0.0.1', 'Mozilla/5.0', 'test-session-1'),
('relatório', 'general', 3, '/documentos-publicos', '127.0.0.1', 'Mozilla/5.0', 'test-session-2')
ON CONFLICT (id) DO NOTHING;

INSERT INTO document_analytics (document_id, action_type, referrer, user_ip, user_agent, session_id) VALUES
(1, 'download', '/document/1', '127.0.0.1', 'Mozilla/5.0', 'test-session-1'),
(1, 'view', '/document/1', '127.0.0.1', 'Mozilla/5.0', 'test-session-1'),
(2, 'download', '/document/2', '127.0.0.1', 'Mozilla/5.0', 'test-session-2')
ON CONFLICT (id) DO NOTHING;

-- 7. VERIFICAR SE AS TABELAS FORAM CRIADAS
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('search_analytics', 'document_analytics')
ORDER BY table_name, ordinal_position;

-- 8. VERIFICAR DADOS INSERIDOS
SELECT 'search_analytics' as tabela, COUNT(*) as total FROM search_analytics
UNION ALL
SELECT 'document_analytics' as tabela, COUNT(*) as total FROM document_analytics;
