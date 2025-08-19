-- Script para adicionar o campo is_published à tabela homepage_content
-- Execute este SQL no painel do Supabase > SQL Editor

-- 1. Adicionar o campo is_published se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM informclsation_schema.columns
        WHERE table_name = 'homepage_content'
        AND column_name = 'is_published'
    ) THEN
        ALTER TABLE homepage_content
        ADD COLUMN is_published BOOLEAN DEFAULT FALSE;

        RAISE NOTICE 'Campo is_published adicionado com sucesso!';
    ELSE
        RAISE NOTICE 'Campo is_published já existe!';
    END IF;
END $$;

-- 2. Verificar se o campo foi adicionado
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'homepage_content'
AND column_name = 'is_published';

-- 3. Atualizar registros existentes para definir is_published = true (opcional)
-- Descomente a linha abaixo se quiser marcar todos os cards existentes como publicados
-- UPDATE homepage_content SET is_published = true WHERE is_published IS NULL;

-- 4. Verificar a estrutura atual da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'homepage_content'
ORDER BY ordinal_position;
