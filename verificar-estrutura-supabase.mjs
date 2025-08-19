import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cm5ocHF6Ymh3aXFhc3V5d2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzE5NzAsImV4cCI6MjA1MDU0Nzk3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Verificando estrutura do Supabase...\n');

async function verificarEstrutura() {
  try {
    // 1. Verificar se a tabela 'files' existe
    console.log('📋 Verificando tabela "files"...');
    const { data: filesData, error: filesError } = await supabase
      .from('files')
      .select('*')
      .limit(1);

    if (filesError) {
      console.log('❌ Tabela "files" não existe ou erro de acesso:');
      console.log('   Erro:', filesError.message);
      console.log('   Código:', filesError.code);

      if (filesError.code === 'PGRST116') {
        console.log('💡 Solução: A tabela "files" precisa ser criada no Supabase');
        console.log('   Execute o SQL para criar a tabela');
      }
    } else {
      console.log('✅ Tabela "files" existe e é acessível');
      console.log('   Estrutura:', Object.keys(filesData[0] || {}));
    }

    // 2. Verificar se a tabela 'documents' existe
    console.log('\n📋 Verificando tabela "documents"...');
    const { data: documentsData, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .limit(1);

    if (documentsError) {
      console.log('❌ Tabela "documents" não existe ou erro de acesso:');
      console.log('   Erro:', documentsError.message);
      console.log('   Código:', documentsError.code);
    } else {
      console.log('✅ Tabela "documents" existe e é acessível');
      console.log('   Estrutura:', Object.keys(documentsData[0] || {}));
    }

    // 3. Verificar buckets de storage
    console.log('\n📁 Verificando buckets de storage...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.log('❌ Erro ao listar buckets:', bucketsError.message);
    } else {
      console.log('✅ Buckets disponíveis:');
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'Público' : 'Privado'})`);
      });
    }

    // 4. Verificar se o bucket 'documents' existe
    console.log('\n📁 Verificando bucket "documents"...');
    const { data: documentsBucket, error: documentsBucketError } = await supabase.storage
      .from('documents')
      .list('', { limit: 1 });

    if (documentsBucketError) {
      console.log('❌ Bucket "documents" não existe ou erro de acesso:');
      console.log('   Erro:', documentsBucketError.message);
      console.log('   Código:', documentsBucketError.code);

      if (documentsBucketError.code === 'PGRST116') {
        console.log('💡 Solução: O bucket "documents" precisa ser criado no Supabase Storage');
      }
    } else {
      console.log('✅ Bucket "documents" existe e é acessível');
      console.log('   Arquivos no bucket:', documentsBucket.length);
    }

    // 5. Testar inserção simples
    console.log('\n🧪 Testando inserção simples...');
    try {
      const { data: testInsert, error: testInsertError } = await supabase
        .from('documents')
        .insert([{
          title: 'TESTE_ESTRUTURA',
          description: 'Teste para verificar estrutura',
          content: '{"test": "data"}',
          category: 'Teste',
          author: 'Sistema'
        }])
        .select()
        .single();

      if (testInsertError) {
        console.log('❌ Erro na inserção de teste:', testInsertError.message);
      } else {
        console.log('✅ Inserção de teste bem-sucedida!');
        console.log('   ID:', testInsert.id);

        // Limpar o teste
        await supabase
          .from('documents')
          .delete()
          .eq('id', testInsert.id);
        console.log('🧹 Teste removido');
      }
    } catch (error) {
      console.log('❌ Erro no teste de inserção:', error.message);
    }

  } catch (error) {
    console.log('💥 Erro geral:', error.message);
  }
}

verificarEstrutura().then(() => {
  console.log('\n🏁 Verificação concluída!');
});
