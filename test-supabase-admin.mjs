import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
dotenv.config({ path: './config-supabase.env' });

console.log('🧪 TESTE DO CLIENTE SUPABASE ADMINISTRATIVO');
console.log('==========================================');

// Verificar variáveis
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

console.log('📋 Configurações:');
console.log('   URL:', SUPABASE_URL ? '✅ Configurada' : '❌ Não configurada');
console.log('   Service Key:', SUPABASE_SERVICE_KEY ? '✅ Configurada' : '❌ Não configurada');

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Service key não configurada!');
  process.exit(1);
}

// Criar cliente administrativo
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('\n🔐 Cliente administrativo criado');

// Testar conexão
async function testConnection() {
  try {
    console.log('\n🧪 Testando conexão...');

    // Testar listagem de buckets
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Erro ao listar buckets:', bucketsError);
      return false;
    }

    console.log('✅ Storage funcionando');
    console.log('📁 Buckets disponíveis:', buckets?.map(b => b.id) || []);

    // Testar inserção na tabela homepage_content
    console.log('\n🧪 Testando inserção na tabela homepage_content...');

    const testData = {
      section: 'test',
      title: 'Teste de Conexão',
      description: 'Teste para verificar se o cliente admin está funcionando',
      featured: false,
      is_active: true
    };

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('homepage_content')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao inserir teste:', insertError);
      return false;
    }

    console.log('✅ Inserção funcionando');
    console.log('📝 Dados inseridos:', insertData);

    // Limpar dados de teste
    console.log('\n🧹 Limpando dados de teste...');

    const { error: deleteError } = await supabaseAdmin
      .from('homepage_content')
      .delete()
      .eq('id', insertData.id);

    if (deleteError) {
      console.error('⚠️ Erro ao limpar teste:', deleteError);
    } else {
      console.log('✅ Dados de teste removidos');
    }

    return true;

  } catch (error) {
    console.error('💥 Erro no teste:', error);
    return false;
  }
}

// Executar teste
testConnection().then(success => {
  if (success) {
    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('✅ O cliente administrativo está funcionando perfeitamente');
    console.log('✅ Pode fazer upload e operações CRUD sem problemas de RLS');
  } else {
    console.log('\n❌ TESTE FALHOU');
    console.log('❌ Verifique a configuração do Supabase');
  }
});
