import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cm5ocHF6Ymh3aXFhc3V5d2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTIxMTYsImV4cCI6MjA2NjU4ODExNn0.6-jfb70OUjegikt8zBWmZGzcb6QZ-4jJiEXaxsVWez4';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Testando criação de categoria após correção...\n');

async function testarCriacao() {
  try {
    // 1. Verificar se a coluna category existe agora
    console.log('1️⃣ Testando inserção com coluna category...');

    const { data: testInsert, error: insertError } = await supabase
      .from('document_types')
      .insert([{
        name: 'TESTE_CATEGORIA_' + Date.now(),
        category: 'test'
      }])
      .select();

    if (insertError) {
      console.log('❌ Ainda há erro:', insertError.message);

      if (insertError.message.includes("Could not find the 'category' column")) {
        console.log('\n🔧 A coluna ainda não foi criada!');
        console.log('Execute no Supabase SQL Editor:');
        console.log('ALTER TABLE public.document_types ADD COLUMN category text DEFAULT \'custom\';');
      }

      return;
    }

    console.log('✅ Sucesso! Coluna category foi criada');
    console.log('📝 Dados inseridos:', testInsert);

    // 2. Remover o teste
    if (testInsert && testInsert[0]) {
      const { error: deleteError } = await supabase
        .from('document_types')
        .delete()
        .eq('id', testInsert[0].id);

      if (!deleteError) {
        console.log('🧹 Registro de teste removido');
      }
    }

    // 3. Testar inserção sem category (deve funcionar)
    console.log('\n2️⃣ Testando inserção sem coluna category...');

    const { data: testInsert2, error: insertError2 } = await supabase
      .from('document_types')
      .insert([{
        name: 'TESTE_SEM_CATEGORIA_' + Date.now()
      }])
      .select();

    if (insertError2) {
      console.log('❌ Erro na inserção sem category:', insertError2.message);
    } else {
      console.log('✅ Inserção sem category funcionou:', testInsert2);

      // Remover o segundo teste
      if (testInsert2 && testInsert2[0]) {
        await supabase
          .from('document_types')
          .delete()
          .eq('id', testInsert2[0].id);
      }
    }

    console.log('\n🎉 Teste concluído!');

  } catch (error) {
    console.log('❌ Erro geral:', error);
  }
}

testarCriacao();
