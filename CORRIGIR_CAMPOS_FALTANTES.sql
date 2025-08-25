-- =====================================================
-- SCRIPT PARA CORRIGIR CAMPOS FALTANTES NO SUPABASE
-- =====================================================
-- Data: 2025-08-23
-- Objetivo: Adicionar campos 'title' e 'main_subject_id' na tabela 'files'
-- =====================================================

-- 1. ADICIONAR COLUNA 'title' PARA TÍTULO DO DOCUMENTO
-- =====================================================
DO $$
BEGIN
    -- Verificar se a coluna já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'files' AND column_name = 'title'
    ) THEN
        -- Adicionar coluna title
        ALTER TABLE files ADD COLUMN title VARCHAR(255);

        -- Adicionar comentário para documentação
        COMMENT ON COLUMN files.title IS 'Título do documento (campo obrigatório do formulário)';

        RAISE NOTICE 'Coluna "title" adicionada com sucesso na tabela "files"';
    ELSE
        RAISE NOTICE 'Coluna "title" já existe na tabela "files"';
    END IF;
END $$;

-- 2. ADICIONAR COLUNA 'main_subject_id' PARA ASSUNTO PRINCIPAL
-- =====================================================
DO $$
BEGIN
    -- Verificar se a coluna já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'files' AND column_name = 'main_subject_id'
    ) THEN
        -- Adicionar coluna main_subject_id com referência para main_subjects
        ALTER TABLE files ADD COLUMN main_subject_id INTEGER;

        -- Adicionar comentário para documentação
        COMMENT ON COLUMN files.main_subject_id IS 'ID do assunto principal (referência para main_subjects.id)';

        RAISE NOTICE 'Coluna "main_subject_id" adicionada com sucesso na tabela "files"';
    ELSE
        RAISE NOTICE 'Coluna "main_subject_id" já existe na tabela "files"';
    END IF;
END $$;

-- 3. ATUALIZAR REGISTROS EXISTENTES
-- =====================================================

-- Atualizar campo 'title' com valores padrão
UPDATE files
SET title = COALESCE(original_name, filename, 'Documento sem título')
WHERE title IS NULL OR title = '';

-- Atualizar campo 'main_subject_id' com valores padrão baseados na categoria
UPDATE files
SET main_subject_id = (
    SELECT ms.id
    FROM main_subjects ms
    WHERE ms.name ILIKE '%' || files.file_category || '%'
    LIMIT 1
)
WHERE main_subject_id IS NULL;

-- Se não encontrar correspondência, usar o primeiro assunto principal
UPDATE files
SET main_subject_id = (SELECT id FROM main_subjects ORDER BY id LIMIT 1)
WHERE main_subject_id IS NULL;

-- 4. ADICIONAR CONSTRAINTS E ÍNDICES
-- =====================================================

-- Adicionar índice para performance na busca por título
CREATE INDEX IF NOT EXISTS idx_files_title ON files(title);

-- Adicionar índice para performance na busca por assunto principal
CREATE INDEX IF NOT EXISTS idx_files_main_subject ON files(main_subject_id);

-- Adicionar constraint para garantir que title não seja nulo
ALTER TABLE files ALTER COLUMN title SET NOT NULL;

-- 5. VERIFICAR RESULTADO
-- =====================================================
SELECT
    'files' as tabela,
    COUNT(*) as total_registros,
    COUNT(title) as registros_com_titulo,
    COUNT(main_subject_id) as registros_com_assunto,
    COUNT(*) - COUNT(title) as titulos_faltando,
    COUNT(*) - COUNT(main_subject_id) as assuntos_faltando
FROM files;

-- 6. MOSTRAR EXEMPLOS DE REGISTROS ATUALIZADOS
-- =====================================================
SELECT
    id,
    filename,
    title,
    main_subject_id,
    file_category,
    created_at
FROM files
ORDER BY created_at DESC
LIMIT 5;

-- 7. VERIFICAR RELACIONAMENTOS
-- =====================================================
SELECT
    f.id,
    f.filename,
    f.title,
    f.main_subject_id,
    ms.name as assunto_principal,
    f.file_category
FROM files f
LEFT JOIN main_subjects ms ON f.main_subject_id = ms.id
ORDER BY f.created_at DESC
LIMIT 10;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- Após executar este script, todos os campos obrigatórios
-- do formulário estarão disponíveis no banco de dados.
-- =====================================================
