-- ADICIONAR COLUNAS FALTANTES NA TABELA FILES
-- Execute este SQL no painel do Supabase > SQL Editor

-- 1. Adicionar coluna para título do documento
ALTER TABLE files ADD COLUMN IF NOT EXISTS title VARCHAR(255);

-- 2. Adicionar coluna para assunto principal
ALTER TABLE files ADD COLUMN IF NOT EXISTS main_subject VARCHAR(255);

-- 3. Adicionar coluna para categoria do arquivo
ALTER TABLE files ADD COLUMN IF NOT EXISTS file_category VARCHAR(100);

-- 4. Adicionar coluna para usuário que fez upload
ALTER TABLE files ADD COLUMN IF NOT EXISTS uploaded_by VARCHAR(100);

-- 5. Adicionar coluna para checksum do arquivo
ALTER TABLE files ADD COLUMN IF NOT EXISTS file_checksum VARCHAR(64);

-- 6. Adicionar coluna para controle de visibilidade
ALTER TABLE files ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- 7. Adicionar coluna para contador de downloads
ALTER TABLE files ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- 8. Adicionar coluna para último acesso
ALTER TABLE files ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP;

-- 9. Adicionar comentários para documentação
COMMENT ON COLUMN files.title IS 'Título do documento';
COMMENT ON COLUMN files.main_subject IS 'Assunto principal do documento';
COMMENT ON COLUMN files.file_category IS 'Categoria do arquivo';
COMMENT ON COLUMN files.uploaded_by IS 'Usuário que fez o upload';
COMMENT ON COLUMN files.file_checksum IS 'Hash SHA-256 do arquivo para verificação de integridade';
COMMENT ON COLUMN files.is_public IS 'Indica se o arquivo é público';
COMMENT ON COLUMN files.download_count IS 'Número de downloads do arquivo';
COMMENT ON COLUMN files.last_accessed IS 'Data e hora do último acesso ao arquivo';

-- 10. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_files_title ON files(title);
CREATE INDEX IF NOT EXISTS idx_files_main_subject ON files(main_subject);
CREATE INDEX IF NOT EXISTS idx_files_file_category ON files(file_category);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);

-- 11. Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'files'
AND column_name IN ('title', 'main_subject', 'file_category', 'uploaded_by', 'file_checksum', 'is_public', 'download_count', 'last_accessed')
ORDER BY ordinal_position;
