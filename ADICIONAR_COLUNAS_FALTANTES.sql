-- =====================================================
-- SCRIPT: Adicionar Colunas Faltantes na Tabela FILES
-- =====================================================
-- Este script adiciona as colunas 'title' e 'main_subject'
-- que são obrigatórias no formulário mas estão ausentes no banco

-- 1. Adicionar colunas faltantes
ALTER TABLE files
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS main_subject VARCHAR(255);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_files_title ON files(title);
CREATE INDEX IF NOT EXISTS idx_files_main_subject ON files(main_subject);

-- 3. Adicionar comentários para documentação
COMMENT ON COLUMN files.title IS 'Título do documento';
COMMENT ON COLUMN files.main_subject IS 'Assunto principal do documento';

-- 4. Verificar se as colunas foram criadas corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'files'
AND column_name IN ('title', 'main_subject')
ORDER BY ordinal_position;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- column_name  | data_type         | is_nullable | column_default
-- -------------|-------------------|-------------|---------------
-- title        | character varying | YES         | NULL
-- main_subject | character varying | YES         | NULL
-- =====================================================

