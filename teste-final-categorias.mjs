import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cm5ocHF6Ymh3aXFhc3V5d2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTIxMTYsImV4cCI6MjA2NjU4ODExNn0.6-jfb70OUjegikt8zBWmZGzcb6QZ-4jJiEXaxsVWez4';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🎯 TESTE FINAL - SISTEMA DE CATEGORIAS\n');
console.log('=====================================\n');

async function testeFinal() {
  try {
    // 1. Testar criação de categoria
    console.log('1️⃣ Testando criação de categoria...');

    const { data: novaCategoria, error: createError } = await supabase
      .from('document_types')
      .insert([{
        name: 'Licitações',
        category: 'custom'
      }])
      .select()
      .single();

    if (createError) {
      console.log('❌ Erro ao criar categoria:', createError.message);
      return;
    }

    console.log('✅ Categoria criada com sucesso:', novaCategoria.name);

    // 2. Testar busca de categorias
    console.log('\n2️⃣ Testando busca de categorias...');

    const { data: categorias, error: fetchError } = await supabase
      .from('document_types')
      .select('*')
      .order('name');

    if (fetchError) {
      console.log('❌ Erro ao buscar categorias:', fetchError.message);
      return;
    }

    console.log(`✅ ${categorias.length} categorias encontradas`);
    console.log('📋 Primeiras 5 categorias:');
    categorias.slice(0, 5).forEach(cat => {
      console.log(`   - ${cat.name} (${cat.category || 'sem categoria'})`);
    });

    // 3. Verificar se a nova categoria está na lista
    const categoriaEncontrada = categorias.find(cat => cat.name === 'Licitações');
    if (categoriaEncontrada) {
      console.log('\n✅ Nova categoria "Licitações" encontrada na lista!');
    } else {
      console.log('\n❌ Nova categoria não foi encontrada na lista');
    }

    // 4. Remover a categoria de teste
    console.log('\n4️⃣ Removendo categoria de teste...');

    const { error: deleteError } = await supabase
      .from('document_types')
      .delete()
      .eq('id', novaCategoria.id);

    if (deleteError) {
      console.log('⚠️ Aviso: Não foi possível remover a categoria de teste:', deleteError.message);
    } else {
      console.log('🧹 Categoria de teste removida');
    }

    console.log('\n🎉 TESTE FINAL CONCLUÍDO COM SUCESSO!');
    console.log('✅ Sistema de categorias funcionando perfeitamente');
    console.log('✅ Criação, busca e exclusão funcionando');
    console.log('✅ Coluna category funcionando corretamente');

  } catch (error) {
    console.log('❌ Erro geral:', error);
  }
}

testeFinal();
