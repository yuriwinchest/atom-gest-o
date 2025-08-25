-- CRIAR TABELA FILES NO SUPABASE
-- Execute este SQL no Editor SQL do Supabase para armazenar metadados dos arquivos

-- Tabela para armazenar metadados dos arquivos
CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_type VARCHAR(100) DEFAULT 'document',
    file_path VARCHAR(500) NOT NULL,
    tags TEXT[],
    environment VARCHAR(50) DEFAULT 'production',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Desabilitar RLS para permitir acesso público
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso público
CREATE POLICY "Allow public read" ON files FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON files FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON files FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON files FOR DELETE USING (true);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_files_file_type ON files(file_type);
CREATE INDEX IF NOT EXISTS idx_files_environment ON files(environment);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);
CREATE INDEX IF NOT EXISTS idx_files_metadata_storage_type ON files USING GIN ((metadata->>'storage_type'));

-- Inserir dados de exemplo
INSERT INTO files (name, description, file_type, file_path, tags, metadata) VALUES
('documento_exemplo.pdf', 'Documento de exemplo para teste', 'document', 'documents/1234567890_exemplo.pdf', ARRAY['exemplo', 'teste'], '{"storage_type": "supabase", "category": "Documentos", "author": "Sistema"}'),
('imagem_exemplo.jpg', 'Imagem de exemplo para teste', 'image', 'images/1234567890_exemplo.jpg', ARRAY['exemplo', 'imagem'], '{"storage_type": "supabase", "category": "Imagens", "author": "Sistema"}')
ON CONFLICT (id) DO NOTHING;

-- Verificar se a tabela foi criada
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;
