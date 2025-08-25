-- ADICIONAR COLUNAS FALTANTES NA TABELA FILES - VERSÃO SIMPLIFICADA
-- Execute este SQL no painel do Supabase > SQL Editor

-- 1. Verificar estrutura atual
SELECT 'Verificando estrutura atual...' as status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;

-- 2. Adicionar coluna para título
SELECT 'Adicionando coluna title...' as status;
ALTER TABLE files ADD COLUMN IF NOT EXISTS title VARCHAR(255);

-- 3. Adicionar coluna para assunto principal
SELECT 'Adicionando coluna main_subject...' as status;
ALTER TABLE files ADD COLUMN IF NOT EXISTS main_subject VARCHAR(255);

-- 4. Adicionar coluna para categoria
SELECT 'Adicionando coluna file_category...' as status;
ALTER TABLE files ADD COLUMN IF NOT EXISTS file_category VARCHAR(100);

-- 5. Adicionar coluna para usuário
SELECT 'Adicionando coluna uploaded_by...' as status;
ALTER TABLE files ADD COLUMN IF NOT EXISTS uploaded_by VARCHAR(100);

-- 6. Adicionar coluna para checksum
SELECT 'Adicionando coluna file_checksum...' as status;
ALTER TABLE files ADD COLUMN IF NOT EXISTS file_checksum VARCHAR(64);

-- 7. Adicionar coluna para visibilidade
SELECT 'Adicionando coluna is_public...' as status;
ALTER TABLE files ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- 8. Adicionar coluna para contador de downloads
SELECT 'Adicionando coluna download_count...' as status;
ALTER TABLE files ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- 9. Adicionar coluna para último acesso
SELECT 'Adicionando coluna last_accessed...' as status;
ALTER TABLE files ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP;

-- 10. Verificar estrutura final
SELECT 'Verificando estrutura final...' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;

-- 11. Criar índices básicos
SELECT 'Criando índices...' as status;
CREATE INDEX IF NOT EXISTS idx_files_title ON files(title);
CREATE INDEX IF NOT EXISTS idx_files_main_subject ON files(main_subject);
CREATE INDEX IF NOT EXISTS idx_files_file_category ON files(file_category);

SELECT 'Colunas adicionadas com sucesso!' as status;
