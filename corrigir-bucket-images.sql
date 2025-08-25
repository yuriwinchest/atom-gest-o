-- 🔧 CORRIGIR CONFIGURAÇÃO DO BUCKET DE IMAGENS
-- Execute este script no Supabase SQL Editor

-- 1. Verificar buckets existentes
SELECT name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE name = 'images';

-- 2. Corrigir configurações do bucket images (se existir)
UPDATE storage.buckets
SET
  public = true,
  file_size_limit = 0, -- Sem limite de tamanho
  allowed_mime_types = ARRAY['image/*', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
WHERE name = 'images';

-- 3. Criar bucket images se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  gen_random_uuid(),
  'images',
  true,
  0, -- Sem limite de tamanho
  ARRAY['image/*', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (name) DO NOTHING;

-- 4. Verificar políticas RLS do bucket images
SELECT * FROM storage.policies
WHERE bucket_id = (SELECT id FROM storage.buckets WHERE name = 'images');

-- 5. Criar política para acesso público às imagens
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Allow public access to images',
  (SELECT id FROM storage.buckets WHERE name = 'images'),
  'SELECT',
  'true'
)
ON CONFLICT (name) DO NOTHING;

-- 6. Verificar resultado final
SELECT 'Configuração final:' as status;
SELECT name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE name = 'images';
