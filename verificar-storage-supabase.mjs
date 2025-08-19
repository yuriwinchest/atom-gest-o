import { createClient } from '@supabase/supabase-js';

console.log('📁 Verificando Storage do Supabase...\n');

const supabaseUrl = 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cm5ocHF6Ymh3aXFhc3V5d2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTIxMTYsImV4cCI6MjA2NjU4ODExNn0.6-jfb70OUjegikt8zBWmZGzcb6QZ-4jJiEXaxsVWez4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarStorage() {
  try {
    // 1. Listar todos os buckets
    console.log('🔍 Listando buckets disponíveis...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.log('❌ Erro ao listar buckets:', bucketsError.message);
      return;
    }

    console.log(`✅ Buckets encontrados: ${buckets.length}`);
    buckets.forEach(bucket => {
      console.log(`   📁 ${bucket.name} (${bucket.public ? 'Público' : 'Privado'})`);
    });

    // 2. Verificar bucket 'documents' se existir
    if (buckets.some(b => b.name === 'documents')) {
      console.log('\n📋 Verificando bucket "documents"...');
      const { data: files, error: filesError } = await supabase.storage
        .from('documents')
        .list('', { limit: 100 });

      if (filesError) {
        console.log('❌ Erro ao listar arquivos:', filesError.message);
      } else {
        console.log(`✅ Arquivos no bucket "documents": ${files.length}`);
        files.forEach(file => {
          console.log(`   📄 ${file.name} (${file.metadata?.size || 'N/A'} bytes)`);
        });
      }
    }

    // 3. Verificar bucket 'uploads' se existir
    if (buckets.some(b => b.name === 'uploads')) {
      console.log('\n📋 Verificando bucket "uploads"...');
      const { data: files, error: filesError } = await supabase.storage
        .from('uploads')
        .list('', { limit: 100 });

      if (filesError) {
        console.log('❌ Erro ao listar arquivos:', filesError.message);
      } else {
        console.log(`✅ Arquivos no bucket "uploads": ${files.length}`);
        files.forEach(file => {
          console.log(`   📄 ${file.name} (${file.metadata?.size || 'N/A'} bytes)`);
        });
      }
    }

    // 4. Tentar criar um bucket de teste se não existir nenhum
    if (buckets.length === 0) {
      console.log('\n⚠️ Nenhum bucket encontrado. Tentando criar bucket "documents"...');
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('documents', {
        public: true,
        allowedMimeTypes: ['*/*'],
        fileSizeLimit: 52428800 // 50MB
      });

      if (createError) {
        console.log('❌ Erro ao criar bucket:', createError.message);
      } else {
        console.log('✅ Bucket "documents" criado com sucesso!');
      }
    }

  } catch (error) {
    console.log('💥 Erro geral:', error.message);
  }
}

verificarStorage().then(() => {
  console.log('\n🏁 Verificação de Storage concluída!');
});
