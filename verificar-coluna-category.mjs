import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cm5ocHF6Ymh3aXFhc3V5d2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTIxMTYsImV4cCI6MjA2NjU4ODExNn0.6-jfb70OUjegikt8zBWmZGzcb6QZ-4jJiEXaxsVWez4';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Verificando estrutura da tabela document_types...\n');

async function verificarEstrutura() {
  try {
    // Tentar inserir um registro de teste para ver quais colunas existem
    console.log('🧪 Testando inserção para verificar estrutura...');

    const { data: testInsert, error: insertError } = await supabase
      .from('document_types')
      .insert([{
        name: 'TESTE_TEMPORARIO_' + Date.now(),
        category: 'test'
      }])
      .select();

    if (insertError) {
      console.log('❌ Erro na inserção:', insertError.message);

      if (insertError.message.includes("Could not find the 'category' column")) {
        console.log('\n🔍 DIAGNÓSTICO: A coluna "category" não existe na tabela!');
        console.log('\n🔧 SOLUÇÃO: Execute este SQL no Supabase:');
        console.log('ALTER TABLE public.document_types ADD COLUMN category text DEFAULT \'custom\';');
      }

      return;
    }

    console.log('✅ Inserção bem-sucedida - coluna category existe');
    console.log('📝 Dados inseridos:', testInsert);

    // Remover o registro de teste
    if (testInsert && testInsert[0]) {
      const { error: deleteError } = await supabase
        .from('document_types')
        .delete()
        .eq('id', testInsert[0].id);

      if (deleteError) {
        console.log('⚠️ Aviso: Não foi possível remover o registro de teste:', deleteError.message);
      } else {
        console.log('🧹 Registro de teste removido');
      }
    }

  } catch (error) {
    console.log('❌ Erro geral:', error);
  }
}

verificarEstrutura();
