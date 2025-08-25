-- VERIFICAR E ADICIONAR COLUNAS FALTANTES NA TABELA FILES
-- Execute este SQL no painel do Supabase > SQL Editor

-- 1. Verificar estrutura atual
SELECT 'Verificando estrutura atual da tabela files...' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;

-- 2. Adicionar colunas básicas se não existirem
SELECT 'Adicionando colunas básicas...' as status;

-- Coluna para título
ALTER TABLE files ADD COLUMN IF NOT EXISTS title VARCHAR(255);
COMMENT ON COLUMN files.title IS 'Título do documento';

-- Coluna para assunto principal
ALTER TABLE files ADD COLUMN IF NOT EXISTS main_subject VARCHAR(255);
COMMENT ON COLUMN files.main_subject IS 'Assunto principal do documento';

-- Coluna para categoria
ALTER TABLE files ADD COLUMN IF NOT EXISTS file_category VARCHAR(100);
COMMENT ON COLUMN files.file_category IS 'Categoria do arquivo';

-- Coluna para usuário que fez upload
ALTER TABLE files ADD COLUMN IF NOT EXISTS uploaded_by VARCHAR(100);
COMMENT ON COLUMN files.uploaded_by IS 'Usuário que fez o upload';

-- Coluna para checksum
ALTER TABLE files ADD COLUMN IF NOT EXISTS file_checksum VARCHAR(64);
COMMENT ON COLUMN files.file_checksum IS 'Hash SHA-256 do arquivo';

-- Coluna para visibilidade
ALTER TABLE files ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
COMMENT ON COLUMN files.is_public IS 'Indica se o arquivo é público';

-- Coluna para contador de downloads
ALTER TABLE files ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;
COMMENT ON COLUMN files.download_count IS 'Número de downloads';

-- Coluna para último acesso
ALTER TABLE files ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP;
COMMENT ON COLUMN files.last_accessed IS 'Data do último acesso';

-- Coluna para ambiente
ALTER TABLE files ADD COLUMN IF NOT EXISTS environment VARCHAR(50) DEFAULT 'production';
COMMENT ON COLUMN files.environment IS 'Ambiente do arquivo';

-- Coluna para metadados JSON
ALTER TABLE files ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
COMMENT ON COLUMN files.metadata IS 'Metadados adicionais do arquivo';

-- 3. Criar índices para performance
SELECT 'Criando índices...' as status;
CREATE INDEX IF NOT EXISTS idx_files_title ON files(title);
CREATE INDEX IF NOT EXISTS idx_files_main_subject ON files(main_subject);
CREATE INDEX IF NOT EXISTS idx_files_file_category ON files(file_category);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_environment ON files(environment);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);
CREATE INDEX IF NOT EXISTS idx_files_metadata_gin ON files USING GIN (metadata);

-- 4. Verificar estrutura final
SELECT 'Verificando estrutura final...' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;

-- 5. Verificar índices criados
SELECT 'Verificando índices...' as status;
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'files';

-- 6. Teste de inserção com todas as colunas
SELECT 'Testando inserção com todas as colunas...' as status;
INSERT INTO files (
    filename,
    original_name,
    file_path,
    file_size,
    mime_type,
    file_type,
    title,
    main_subject,
    file_category,
    uploaded_by,
    file_checksum,
    is_public,
    download_count,
    environment,
    metadata
) VALUES (
    'teste-completo.txt',
    'teste-completo.txt',
    'teste/teste-completo.txt',
    200,
    'text/plain',
    'documents',
    'Teste Completo',
    'Teste de Funcionalidade',
    'Documentos',
    'system',
    'abc123def456',
    true,
    0,
    'production',
    '{"teste": true, "colunas": "todas"}'
) ON CONFLICT DO NOTHING;

-- 7. Verificar se o teste foi inserido
SELECT 'Verificando teste de inserção...' as status;
SELECT id, filename, title, main_subject, file_category, uploaded_by
FROM files
WHERE filename = 'teste-completo.txt'
ORDER BY created_at DESC
LIMIT 1;

-- 8. Limpar teste
SELECT 'Limpando teste...' as status;
DELETE FROM files WHERE filename = 'teste-completo.txt';

-- 9. Resumo final
SELECT 'Resumo da verificação...' as status;
SELECT 
    COUNT(*) as total_colunas,
    COUNT(CASE WHEN column_name IN ('title', 'main_subject', 'file_category', 'uploaded_by', 'file_checksum', 'is_public', 'download_count', 'last_accessed', 'environment', 'metadata') THEN 1 END) as colunas_obrigatorias,
    COUNT(CASE WHEN column_name NOT IN ('title', 'main_subject', 'file_category', 'uploaded_by', 'file_checksum', 'is_public', 'download_count', 'last_accessed', 'environment', 'metadata') THEN 1 END) as outras_colunas
FROM information_schema.columns
WHERE table_name = 'files';

SELECT 'Verificação e correção de colunas concluída com sucesso!' as status;

