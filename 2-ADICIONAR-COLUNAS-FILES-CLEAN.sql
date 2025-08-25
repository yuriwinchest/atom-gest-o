-- ADICIONAR COLUNAS FALTANTES NA TABELA FILES
-- Execute este SQL no painel do Supabase > SQL Editor

ALTER TABLE files ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE files ADD COLUMN IF NOT EXISTS main_subject VARCHAR(255);
ALTER TABLE files ADD COLUMN IF NOT EXISTS file_category VARCHAR(100);
ALTER TABLE files ADD COLUMN IF NOT EXISTS uploaded_by VARCHAR(100);
ALTER TABLE files ADD COLUMN IF NOT EXISTS file_checksum VARCHAR(64);
ALTER TABLE files ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE files ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;
ALTER TABLE files ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_files_title ON files(title);
CREATE INDEX IF NOT EXISTS idx_files_main_subject ON files(main_subject);
CREATE INDEX IF NOT EXISTS idx_files_file_category ON files(file_category);

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;
