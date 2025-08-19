// Script para verificar quais tabelas existem no Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fbqocpozjmuzrdeacktb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTY3ODYsImV4cCI6MjA2NTQzMjc4Nn0.nZPmcY4QtgnZ0K68TW2VlrQm4gyqodQUxgrWDechhhY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Verificando estrutura do banco de dados Supabase...\n');
console.log('URL: ' + supabaseUrl);
console.log('='.repeat(60));

async function verificarEstrutura() {
  // Lista de todas as tabelas que precisamos
  const tabelasNecessarias = [
    'users',
    'documents',
    'files',
    'document_types',
    'public_organs',
    'responsible_sectors',
    'main_subjects',
    'confidentiality_levels',
    'availability_options',
    'language_options',
    'rights_options',
    'document_authorities',
    'homepage_content',
    'footer_pages'
  ];

  console.log('\n📊 VERIFICANDO TABELAS NO SUPABASE:\n');

  for (const tabela of tabelasNecessarias) {
    try {
      // Tentar fazer um select simples para ver se a tabela existe
      const { data, error, count } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.message.includes('does not exist')) {
          console.log(`❌ ${tabela.padEnd(25)} - NÃO EXISTE`);
        } else {
          console.log(`⚠️  ${tabela.padEnd(25)} - Erro: ${error.message}`);
        }
      } else {
        // Tentar obter contagem de registros
        const { count: totalRegistros } = await supabase
          .from(tabela)
          .select('*', { count: 'exact', head: true });

        console.log(`✅ ${tabela.padEnd(25)} - EXISTE (${totalRegistros || 0} registros)`);
      }
    } catch (err) {
      console.log(`❌ ${tabela.padEnd(25)} - Erro ao verificar`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📝 VERIFICANDO ESTRUTURA DAS TABELAS EXISTENTES:\n');

  // Verificar estrutura da tabela users
  console.log('👤 Tabela USERS:');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);

  if (!usersError && users && users[0]) {
    console.log('   Colunas:', Object.keys(users[0]).join(', '));
  } else if (usersError) {
    console.log('   ❌ Não foi possível acessar');
  }

  // Verificar estrutura da tabela documents
  console.log('\n📄 Tabela DOCUMENTS:');
  const { data: docs, error: docsError } = await supabase
    .from('documents')
    .select('*')
    .limit(1);

  if (!docsError && docs && docs[0]) {
    console.log('   Colunas:', Object.keys(docs[0]).join(', '));
  } else if (docsError) {
    console.log('   ❌ Não foi possível acessar');
  }

  // Verificar estrutura da tabela files
  console.log('\n📁 Tabela FILES:');
  const { data: files, error: filesError } = await supabase
    .from('files')
    .select('*')
    .limit(1);

  if (!filesError && files && files[0]) {
    console.log('   Colunas:', Object.keys(files[0]).join(', '));
  } else if (filesError) {
    console.log('   ❌ Não foi possível acessar');
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔍 TESTANDO STORAGE (BUCKETS):\n');

  // Verificar buckets do Storage
  const { data: buckets, error: bucketsError } = await supabase
    .storage
    .listBuckets();

  if (!bucketsError && buckets) {
    console.log(`📦 Buckets encontrados: ${buckets.length}`);
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'Público' : 'Privado'})`);
    });
  } else {
    console.log('❌ Não foi possível listar buckets');
  }

  // Testar acesso ao bucket 'documents'
  console.log('\n📂 Testando bucket "documents":');
  const { data: docFiles, error: docFilesError } = await supabase
    .storage
    .from('documents')
    .list('', { limit: 5 });

  if (!docFilesError) {
    console.log(`   ✅ Acessível - ${docFiles?.length || 0} arquivos encontrados`);
  } else {
    console.log(`   ❌ Erro: ${docFilesError.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('💡 RESUMO DO DIAGNÓSTICO:\n');

  // Verificar especificamente as tabelas de categorias
  const tabelasCategorias = [
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

  let categoriasExistem = 0;
  for (const tabela of tabelasCategorias) {
    const { error } = await supabase
      .from(tabela)
      .select('*', { count: 'exact', head: true });

    if (!error) {
      categoriasExistem++;
    }
  }

  if (categoriasExistem === 0) {
    console.log('🔴 PROBLEMA CRÍTICO: Nenhuma tabela de categoria existe!');
    console.log('   As tabelas de categorias PRECISAM ser criadas no Supabase.');
    console.log('   Use o SQL fornecido no arquivo SQL-EXECUTAR-AGORA.sql');
  } else if (categoriasExistem < tabelasCategorias.length) {
    console.log(`🟡 ATENÇÃO: Apenas ${categoriasExistem}/${tabelasCategorias.length} tabelas de categorias existem.`);
    console.log('   Algumas tabelas ainda precisam ser criadas.');
  } else {
    console.log('🟢 OK: Todas as tabelas de categorias existem!');
  }

  // Verificar se há dados nas tabelas
  console.log('\n📊 VERIFICANDO DADOS NAS CATEGORIAS:\n');

  for (const tabela of tabelasCategorias) {
    const { count, error } = await supabase
      .from(tabela)
      .select('*', { count: 'exact', head: true });

    if (!error) {
      if (count > 0) {
        console.log(`✅ ${tabela.padEnd(25)} - ${count} registros`);
      } else {
        console.log(`⚠️  ${tabela.padEnd(25)} - VAZIO (0 registros)`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Verificação concluída!\n');

  // Informações de conexão
  console.log('📌 INFORMAÇÕES DE CONEXÃO:');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Projeto: fbqocpozjmuzrdeacktb`);
  console.log(`   Dashboard: https://supabase.com/dashboard/project/fbqocpozjmuzrdeacktb`);
  console.log(`   SQL Editor: https://supabase.com/dashboard/project/fbqocpozjmuzrdeacktb/sql`);
}

// Executar verificação
verificarEstrutura().catch(console.error);
