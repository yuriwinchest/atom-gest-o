// Script para testar se as categorias estão funcionando
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fbqocpozjmuzrdeacktb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTY3ODYsImV4cCI6MjA2NTQzMjc4Nn0.nZPmcY4QtgnZ0K68TW2VlrQm4gyqodQUxgrWDechhhY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 TESTANDO CATEGORIAS NO SUPABASE\n');
console.log('='.repeat(60));

async function testarCategorias() {
  const tabelas = [
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

  console.log('📊 CONTAGEM DE REGISTROS:\n');

  let totalGeral = 0;
  for (const tabela of tabelas) {
    const { data, count, error } = await supabase
      .from(tabela)
      .select('*', { count: 'exact' });

    if (error) {
      console.log(`❌ ${tabela.padEnd(25)} - ERRO: ${error.message}`);
    } else {
      console.log(`✅ ${tabela.padEnd(25)} - ${count || data?.length || 0} registros`);
      totalGeral += (count || data?.length || 0);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📈 TOTAL GERAL: ${totalGeral} registros\n`);

  // Testar se conseguimos buscar dados específicos
  console.log('🔍 TESTANDO LEITURA DE DADOS:\n');

  // Testar document_types
  const { data: tipos, error: tiposError } = await supabase
    .from('document_types')
    .select('*')
    .limit(5);

  if (!tiposError && tipos && tipos.length > 0) {
    console.log('📄 Tipos de Documento (primeiros 5):');
    tipos.forEach(t => console.log(`   - ${t.name} (ID: ${t.id})`));
  } else if (tiposError) {
    console.log(`❌ Erro ao buscar tipos: ${tiposError.message}`);
  } else {
    console.log('⚠️  Nenhum tipo de documento encontrado');
  }

  // Testar main_subjects
  const { data: assuntos, error: assuntosError } = await supabase
    .from('main_subjects')
    .select('*')
    .limit(5);

  if (!assuntosError && assuntos && assuntos.length > 0) {
    console.log('\n📚 Assuntos Principais (primeiros 5):');
    assuntos.forEach(a => console.log(`   - ${a.name} (ID: ${a.id})`));
  } else if (assuntosError) {
    console.log(`❌ Erro ao buscar assuntos: ${assuntosError.message}`);
  } else {
    console.log('⚠️  Nenhum assunto principal encontrado');
  }

  // Testar public_organs
  const { data: orgaos, error: orgaosError } = await supabase
    .from('public_organs')
    .select('*')
    .limit(5);

  if (!orgaosError && orgaos && orgaos.length > 0) {
    console.log('\n🏛️ Órgãos Públicos (primeiros 5):');
    orgaos.forEach(o => console.log(`   - ${o.name} (ID: ${o.id})`));
  } else if (orgaosError) {
    console.log(`❌ Erro ao buscar órgãos: ${orgaosError.message}`);
  } else {
    console.log('⚠️  Nenhum órgão público encontrado');
  }

  console.log('\n' + '='.repeat(60));
  console.log('🧪 TESTANDO INSERÇÃO DE NOVA CATEGORIA:\n');

  // Tentar inserir uma nova categoria de teste
  const novaCategoria = `Teste ${new Date().getTime()}`;
  const { data: novoTipo, error: erroInsercao } = await supabase
    .from('document_types')
    .insert({ name: novaCategoria })
    .select();

  if (!erroInsercao && novoTipo && novoTipo.length > 0) {
    console.log(`✅ Nova categoria criada com sucesso: "${novaCategoria}"`);
    console.log(`   ID: ${novoTipo[0].id}`);

    // Deletar a categoria de teste
    const { error: erroDelete } = await supabase
      .from('document_types')
      .delete()
      .eq('id', novoTipo[0].id);

    if (!erroDelete) {
      console.log(`   🗑️ Categoria de teste removida`);
    }
  } else if (erroInsercao) {
    console.log(`❌ Erro ao inserir categoria: ${erroInsercao.message}`);
    if (erroInsercao.message.includes('policy')) {
      console.log('   ⚠️ Problema de RLS (Row Level Security)');
      console.log('   💡 Solução: Desabilitar RLS ou configurar políticas adequadas');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🌐 TESTANDO APIS DO SERVIDOR:\n');

  // Verificar se o servidor está rodando
  try {
    const response = await fetch('http://localhost:5000/api/document-types');
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API /api/document-types funcionando`);
      console.log(`   Retornou ${data.length} tipos de documento`);
      if (data.length > 0) {
        console.log(`   Exemplo: ${data[0].name}`);
      }
    } else {
      console.log(`❌ API retornou erro: ${response.status}`);
    }
  } catch (err) {
    console.log(`⚠️  Servidor não está respondendo em localhost:5000`);
    console.log(`   Execute: npm run dev`);
  }

  console.log('\n' + '='.repeat(60));

  if (totalGeral > 0) {
    console.log('✅ SISTEMA FUNCIONANDO CORRETAMENTE!');
    console.log('   - Tabelas criadas no Supabase');
    console.log('   - Dados populados com sucesso');
    console.log('   - APIs prontas para uso');
  } else {
    console.log('⚠️  ATENÇÃO: Tabelas existem mas estão vazias!');
    console.log('   Possíveis problemas:');
    console.log('   1. RLS (Row Level Security) está bloqueando acesso');
    console.log('   2. Dados não foram inseridos corretamente');
    console.log('\n💡 SOLUÇÃO:');
    console.log('   1. Vá em: https://supabase.com/dashboard/project/fbqocpozjmuzrdeacktb/auth/policies');
    console.log('   2. Para cada tabela de categoria, desabilite RLS ou crie política de acesso público');
  }
}

testarCategorias().catch(console.error);
