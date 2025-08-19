import { createClient } from '@supabase/supabase-js';

console.log('🔑 Testando chave da API do Supabase...\n');

// Testar com a chave atual
const supabaseUrl = 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cm5ocHF6Ymh3aXFhc3V5d2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTIxMTYsImV4cCI6MjA2NjU4ODExNn0.6-jfb70OUjegikt8zBWmZGzcb6QZ-4jJiEXaxsVWez4';

console.log('📋 URL:', supabaseUrl);
console.log('🔑 Chave:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarConexao() {
  try {
    console.log('\n🧪 Testando conexão...');

    // Teste 1: Listar tabelas disponíveis
    console.log('📋 Testando listagem de tabelas...');
    const { data: tables, error: tablesError } = await supabase
      .from('document_types')
      .select('*')
      .limit(1);

    if (tablesError) {
      console.log('❌ Erro ao acessar document_types:', tablesError.message);
      console.log('   Código:', tablesError.code);
    } else {
      console.log('✅ Conexão com document_types funcionando!');
      console.log('   Dados encontrados:', tables?.length || 0);
    }

    // Teste 2: Verificar se a tabela documents existe
    console.log('\n📋 Testando tabela documents...');
    const { data: docs, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .limit(1);

    if (docsError) {
      console.log('❌ Erro ao acessar documents:', docsError.message);
      console.log('   Código:', docsError.code);

      if (docsError.code === 'PGRST116') {
        console.log('💡 A tabela "documents" não existe no Supabase');
        console.log('   Ela precisa ser criada primeiro');
      }
    } else {
      console.log('✅ Tabela documents existe e é acessível!');
      console.log('   Documentos encontrados:', docs?.length || 0);
    }

    // Teste 3: Verificar buckets de storage
    console.log('\n📁 Testando storage...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.log('❌ Erro ao listar buckets:', bucketsError.message);
    } else {
      console.log('✅ Storage funcionando!');
      console.log('   Buckets disponíveis:', buckets?.length || 0);
      buckets?.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'Público' : 'Privado'})`);
      });
    }

  } catch (error) {
    console.log('💥 Erro geral:', error.message);
  }
}

testarConexao().then(() => {
  console.log('\n🏁 Teste concluído!');
});
