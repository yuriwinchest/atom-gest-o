import { supabase } from './supabase';

// Configuração dos buckets conforme PRD
const BUCKETS = [
  {
    id: 'documents',
    name: 'documents',
    public: false,
    file_size_limit: 52428800, // 50MB
    allowed_mime_types: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
  },
  {
    id: 'images',
    name: 'images',
    public: true,
    file_size_limit: 10485760, // 10MB
    allowed_mime_types: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ]
  },
  {
    id: 'spreadsheets',
    name: 'spreadsheets',
    public: false,
    file_size_limit: 52428800, // 50MB
    allowed_mime_types: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ]
  },
  {
    id: 'presentations',
    name: 'presentations',
    public: false,
    file_size_limit: 52428800, // 50MB
    allowed_mime_types: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
  },
  {
    id: 'archives',
    name: 'archives',
    public: false,
    file_size_limit: 104857600, // 100MB
    allowed_mime_types: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed'
    ]
  },
  {
    id: 'videos',
    name: 'videos',
    public: false,
    file_size_limit: 524288000, // 500MB
    allowed_mime_types: [
      'video/mp4',
      'video/avi',
      'video/quicktime'
    ]
  },
  {
    id: 'audio',
    name: 'audio',
    public: false,
    file_size_limit: 52428800, // 50MB
    allowed_mime_types: [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg'
    ]
  }
];

export async function setupSupabaseStorage() {
  console.log('🚀 Configurando Supabase Storage...');
  
  try {
    // Verificar buckets existentes
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      return false;
    }

    const existingBucketIds = existingBuckets?.map(b => b.id) || [];
    console.log('📁 Buckets existentes:', existingBucketIds);

    // Criar buckets que não existem
    let createdCount = 0;
    let errorCount = 0;

    for (const bucket of BUCKETS) {
      if (!existingBucketIds.includes(bucket.id)) {
        console.log(`📦 Criando bucket: ${bucket.id}...`);
        
        const { data, error } = await supabase.storage.createBucket(bucket.id, {
          public: bucket.public,
          fileSizeLimit: bucket.file_size_limit,
          allowedMimeTypes: bucket.allowed_mime_types
        });

        if (error) {
          console.error(`❌ Erro ao criar bucket ${bucket.id}:`, error);
          errorCount++;
        } else {
          console.log(`✅ Bucket ${bucket.id} criado com sucesso`);
          createdCount++;
        }
      } else {
        console.log(`ℹ️ Bucket ${bucket.id} já existe`);
      }
    }

    console.log(`\n📊 Resumo da configuração:`);
    console.log(`✅ Buckets criados: ${createdCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📁 Total de buckets: ${BUCKETS.length}`);

    return errorCount === 0;

  } catch (error) {
    console.error('💥 Erro geral na configuração:', error);
    return false;
  }
}

export async function testStorageConnection() {
  console.log('🧪 Testando conexão com Supabase Storage...');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Erro na conexão:', error);
      return false;
    }

    console.log('✅ Conexão com Storage funcionando');
    console.log('📁 Buckets disponíveis:', buckets?.map(b => b.id) || []);
    
    return true;
  } catch (error) {
    console.error('💥 Erro no teste de conexão:', error);
    return false;
  }
}

// Executar configuração
export async function runSetup() {
  console.log('🏗️ Iniciando configuração do Supabase Storage...\n');
  
  const connectionOk = await testStorageConnection();
  if (!connectionOk) {
    console.log('❌ Falha na conexão. Abortando configuração.');
    return false;
  }

  const setupOk = await setupSupabaseStorage();
  if (setupOk) {
    console.log('\n🎉 Configuração concluída com sucesso!');
    console.log('💡 Os buckets estão prontos para receber arquivos.');
  } else {
    console.log('\n⚠️ Configuração concluída com alguns erros.');
    console.log('💡 Verifique as permissões e tente novamente.');
  }
  
  return setupOk;
}