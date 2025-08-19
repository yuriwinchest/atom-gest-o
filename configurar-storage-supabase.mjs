import { createClient } from '@supabase/supabase-js';

console.log('🔧 Configurando Supabase Storage...\n');

const supabaseUrl = 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cm5ocHF6Ymh3aXFhc3V5d2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTIxMTYsImV4cCI6MjA2NjU4ODExNn0.6-jfb70OUjegikt8zBWmZGzcb6QZ-4jJiEXaxsVWez4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function configurarStorage() {
  try {
    console.log('📋 Status atual do Storage...');

    // 1. Verificar buckets existentes
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.log('❌ Erro ao listar buckets:', bucketsError.message);
      return;
    }

    console.log(`📁 Buckets encontrados: ${buckets.length}`);

    // 2. Criar bucket 'documents' se não existir
    if (!buckets.some(b => b.name === 'documents')) {
      console.log('\n🔧 Criando bucket "documents"...');

      const { data: newBucket, error: createError } = await supabase.storage.createBucket('documents', {
        public: true,
        allowedMimeTypes: ['*/*'],
        fileSizeLimit: 52428800 // 50MB
      });

      if (createError) {
        console.log('❌ Erro ao criar bucket:', createError.message);
        console.log('💡 Tentando criar com configurações mais simples...');

        // Tentar criar sem configurações avançadas
        const { data: simpleBucket, error: simpleError } = await supabase.storage.createBucket('documents');

        if (simpleError) {
          console.log('❌ Erro mesmo com configuração simples:', simpleError.message);
          console.log('🔑 Você precisa usar uma chave de serviço (service_role) para criar buckets');
          return;
        } else {
          console.log('✅ Bucket "documents" criado com configuração simples!');
        }
      } else {
        console.log('✅ Bucket "documents" criado com configurações completas!');
      }
    } else {
      console.log('✅ Bucket "documents" já existe!');
    }

    // 3. Criar bucket 'uploads' se não existir
    if (!buckets.some(b => b.name === 'uploads')) {
      console.log('\n🔧 Criando bucket "uploads"...');

      const { data: uploadsBucket, error: uploadsError } = await supabase.storage.createBucket('uploads');

      if (uploadsError) {
        console.log('❌ Erro ao criar bucket uploads:', uploadsError.message);
      } else {
        console.log('✅ Bucket "uploads" criado!');
      }
    } else {
      console.log('✅ Bucket "uploads" já existe!');
    }

    // 4. Testar upload de arquivo simples
    console.log('\n🧪 Testando upload de arquivo...');

    try {
      const testContent = 'Este é um arquivo de teste para verificar se o storage está funcionando.';
      const testFileName = `teste-${Date.now()}.txt`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(testFileName, new Blob([testContent], { type: 'text/plain' }));

      if (uploadError) {
        console.log('❌ Erro no upload de teste:', uploadError.message);
        console.log('💡 O bucket pode ter RLS (Row Level Security) ativado');
      } else {
        console.log('✅ Upload de teste funcionou!');
        console.log(`   Arquivo: ${testFileName}`);
        console.log(`   Caminho: ${uploadData.path}`);

        // Limpar arquivo de teste
        await supabase.storage
          .from('documents')
          .remove([testFileName]);
        console.log('🧹 Arquivo de teste removido');
      }
    } catch (error) {
      console.log('❌ Erro no teste de upload:', error.message);
    }

    // 5. Verificar buckets finais
    console.log('\n📋 Status final do Storage...');
    const { data: finalBuckets, error: finalError } = await supabase.storage.listBuckets();

    if (!finalError) {
      console.log(`📁 Total de buckets: ${finalBuckets.length}`);
      finalBuckets.forEach(bucket => {
        console.log(`   📁 ${bucket.name} (${bucket.public ? 'Público' : 'Privado'})`);
      });
    }

  } catch (error) {
    console.log('💥 Erro geral:', error.message);
  }
}

configurarStorage().then(() => {
  console.log('\n🏁 Configuração de Storage concluída!');
  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('1. Se os buckets foram criados, teste o upload novamente');
  console.log('2. Se der erro de RLS, você precisa configurar permissões no Supabase Dashboard');
  console.log('3. Ou usar uma chave de serviço (service_role) em vez da chave anônima');
});
