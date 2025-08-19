// Script para diagnosticar problemas com criação de tabelas no Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fbqocpozjmuzrdeacktb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTY3ODYsImV4cCI6MjA2NTQzMjc4Nn0.nZPmcY4QtgnZ0K68TW2VlrQm4gyqodQUxgrWDechhhY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 DIAGNÓSTICO COMPLETO DO SUPABASE\n');
console.log('='.repeat(60));

async function diagnosticar() {
  // 1. Verificar tabelas que já existem
  console.log('📊 VERIFICANDO TABELAS EXISTENTES:\n');

  // Tentar listar tabelas via RPC (pode não estar disponível)
  try {
    const { data: tabelas, error: tabelasError } = await supabase.rpc('get_tables_list');
    if (tabelasError) {
      console.log('⚠️  RPC não disponível\n');
    }
  } catch (e) {
    console.log('⚠️  RPC não configurado\n');
  }

  // Testar tabelas conhecidas
  const tabelasConhecidas = [
    'users',
    'documents',
    'files',
    'test_simple',
    'document_types',
    'public_organs',
    'responsible_sectors',
    'main_subjects',
    'confidentiality_levels',
    'availability_options',
    'language_options',
    'rights_options',
    'document_authorities'
  ];

  for (const tabela of tabelasConhecidas) {
    const { count, error } = await supabase
      .from(tabela)
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log(`❌ ${tabela.padEnd(25)} - NÃO EXISTE`);
      } else if (error.message.includes('permission denied')) {
        console.log(`🔒 ${tabela.padEnd(25)} - SEM PERMISSÃO`);
      } else {
        console.log(`⚠️  ${tabela.padEnd(25)} - ${error.message}`);
      }
    } else {
      console.log(`✅ ${tabela.padEnd(25)} - EXISTE (${count || 0} registros)`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🧪 TESTE DE CRIAÇÃO DE TABELA SIMPLES:\n');

  // Tentar criar uma tabela de teste via insert
  const testTableName = 'test_categoria_' + Date.now();
  console.log(`Tentando criar dados em tabela temporária: ${testTableName}`);

  // Testar com document_types primeiro
  console.log('\n📝 Tentando inserir em document_types:');
  const { data: insertData, error: insertError } = await supabase
    .from('document_types')
    .insert([
      { name: 'Teste ' + Date.now() }
    ])
    .select();

  if (insertError) {
    console.log(`❌ Erro ao inserir: ${insertError.message}`);
    if (insertError.code) {
      console.log(`   Código do erro: ${insertError.code}`);
    }
    if (insertError.details) {
      console.log(`   Detalhes: ${insertError.details}`);
    }
    if (insertError.hint) {
      console.log(`   Dica: ${insertError.hint}`);
    }
  } else if (insertData && insertData.length > 0) {
    console.log(`✅ Inserção bem-sucedida! ID: ${insertData[0].id}`);

    // Limpar o teste
    await supabase
      .from('document_types')
      .delete()
      .eq('id', insertData[0].id);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔐 VERIFICANDO POLÍTICAS RLS:\n');

  // Verificar se RLS está habilitado
  const tabelasCategoria = [
    'document_types',
    'public_organs',
    'responsible_sectors',
    'main_subjects'
  ];

  for (const tabela of tabelasCategoria) {
    console.log(`\n📋 Tabela: ${tabela}`);

    // Tentar SELECT
    const { data: selectData, error: selectError } = await supabase
      .from(tabela)
      .select('*')
      .limit(1);

    if (selectError) {
      console.log(`   ❌ SELECT: ${selectError.message}`);
    } else {
      console.log(`   ✅ SELECT: OK`);
    }

    // Tentar INSERT
    const { error: insertTestError } = await supabase
      .from(tabela)
      .insert({ name: 'TesteRLS' })
      .select();

    if (insertTestError) {
      if (insertTestError.message.includes('does not exist')) {
        console.log(`   ❌ INSERT: Tabela não existe`);
      } else if (insertTestError.message.includes('violates row-level security')) {
        console.log(`   🔒 INSERT: Bloqueado por RLS`);
      } else {
        console.log(`   ❌ INSERT: ${insertTestError.message}`);
      }
    } else {
      console.log(`   ✅ INSERT: OK`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('💡 DIAGNÓSTICO FINAL:\n');

  // Análise final
  const problemasEncontrados = [];

  // Verificar se alguma tabela de categoria existe
  let algumaTabelaExiste = false;
  for (const tabela of ['document_types', 'public_organs', 'responsible_sectors', 'main_subjects']) {
    const { error } = await supabase.from(tabela).select('*', { count: 'exact', head: true });
    if (!error) {
      algumaTabelaExiste = true;
      break;
    }
  }

  if (!algumaTabelaExiste) {
    problemasEncontrados.push('As tabelas de categorias NÃO existem no banco');
    console.log('🔴 PROBLEMA PRINCIPAL: Tabelas não foram criadas!');
    console.log('\n📌 SOLUÇÃO:');
    console.log('1. Acesse: https://supabase.com/dashboard/project/fbqocpozjmuzrdeacktb/sql');
    console.log('2. Execute o SQL do arquivo CRIAR-TABELAS-SUPABASE.sql');
    console.log('3. Certifique-se de que o SQL foi executado com sucesso');
    console.log('4. Verifique se não há erros de sintaxe no SQL');
  } else {
    console.log('✅ Algumas tabelas existem');

    // Verificar RLS
    const { error: rlsError } = await supabase
      .from('document_types')
      .insert({ name: 'TesteRLS2' })
      .select();

    if (rlsError && rlsError.message.includes('row-level security')) {
      problemasEncontrados.push('RLS está bloqueando inserções');
      console.log('\n🔒 PROBLEMA: RLS (Row Level Security) está ativo');
      console.log('\n📌 SOLUÇÃO:');
      console.log('1. Acesse: https://supabase.com/dashboard/project/fbqocpozjmuzrdeacktb/auth/policies');
      console.log('2. Para cada tabela de categoria, desabilite RLS ou');
      console.log('3. Crie políticas que permitam acesso público (SELECT, INSERT, UPDATE, DELETE)');
    }
  }

  if (problemasEncontrados.length === 0) {
    console.log('✅ Sistema aparentemente funcionando!');
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 INFORMAÇÕES DO PROJETO:');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Projeto ID: fbqocpozjmuzrdeacktb`);
  console.log(`   Chave usada: anon (pública)`);
  console.log('\n🔗 LINKS ÚTEIS:');
  console.log('   Dashboard: https://supabase.com/dashboard/project/fbqocpozjmuzrdeacktb');
  console.log('   SQL Editor: https://supabase.com/dashboard/project/fbqocpozjmuzrdeacktb/sql');
  console.log('   Table Editor: https://supabase.com/dashboard/project/fbqocpozjmuzrdeacktb/editor');
  console.log('   Políticas RLS: https://supabase.com/dashboard/project/fbqocpozjmuzrdeacktb/auth/policies');
}

diagnosticar().catch(console.error);
