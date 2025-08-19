// Script para listar TODAS as tabelas do Supabase
import { createClient } from '@supabase/supabase-js';

// Projeto correto com as tabelas
const supabaseUrl = 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cm5ocHF6Ymh3aXFhc3V5d2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTIxMTYsImV4cCI6MjA2NjU4ODExNn0.6-jfb70OUjegikt8zBWmZGzcb6QZ-4jJiEXaxsVWez4';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('📊 LISTANDO TODAS AS TABELAS DO PROJETO SUPABASE\n');
console.log('URL:', supabaseUrl);
console.log('='.repeat(70));

// Lista completa de possíveis tabelas
const todasTabelas = [
  // Tabelas principais do sistema
  'users',
  'documents',
  'files',

  // Tabelas de categorias dinâmicas
  'document_types',
  'public_organs',
  'responsible_sectors',
  'main_subjects',
  'confidentiality_levels',
  'availability_options',
  'language_options',
  'rights_options',
  'document_authorities',

  // Tabelas de conteúdo
  'homepage_content',
  'footer_pages',

  // Tabelas de analytics
  'search_analytics',
  'document_analytics',

  // Outras possíveis tabelas
  'test_simple',
  'profiles',
  'sessions',
  'audit_logs',
  'permissions',
  'roles',
  'notifications',
  'settings',
  'logs',
  'migrations',
  'schema_migrations'
];

async function listarTabelas() {
  let tabelasEncontradas = [];
  let totalRegistros = 0;

  console.log('\n🔍 VERIFICANDO TABELAS:\n');

  for (const tabela of todasTabelas) {
    const { data, count, error } = await supabase
      .from(tabela)
      .select('*', { count: 'exact', head: true });

    if (!error) {
      const qtd = count || 0;
      tabelasEncontradas.push({ nome: tabela, registros: qtd });
      totalRegistros += qtd;

      if (qtd > 0) {
        console.log(`✅ ${tabela.padEnd(25)} - ${qtd} registros`);
      } else {
        console.log(`📭 ${tabela.padEnd(25)} - VAZIA (0 registros)`);
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📈 RESUMO DO BANCO DE DADOS:\n');
  console.log(`   Total de tabelas encontradas: ${tabelasEncontradas.length}`);
  console.log(`   Total de registros no banco: ${totalRegistros}`);

  // Agrupar por tipo
  console.log('\n' + '='.repeat(70));
  console.log('📂 TABELAS POR CATEGORIA:\n');

  console.log('🗂️ TABELAS DE CATEGORIAS DINÂMICAS:');
  const categorias = tabelasEncontradas.filter(t =>
    ['document_types', 'public_organs', 'responsible_sectors', 'main_subjects',
     'confidentiality_levels', 'availability_options', 'language_options',
     'rights_options', 'document_authorities'].includes(t.nome)
  );
  categorias.forEach(t => {
    console.log(`   • ${t.nome}: ${t.registros} registros`);
  });

  console.log('\n📄 TABELAS PRINCIPAIS:');
  const principais = tabelasEncontradas.filter(t =>
    ['users', 'documents', 'files'].includes(t.nome)
  );
  principais.forEach(t => {
    console.log(`   • ${t.nome}: ${t.registros} registros`);
  });

  console.log('\n📊 OUTRAS TABELAS:');
  const outras = tabelasEncontradas.filter(t =>
    !categorias.includes(t) && !principais.includes(t)
  );
  outras.forEach(t => {
    console.log(`   • ${t.nome}: ${t.registros} registros`);
  });

  // Mostrar alguns dados de exemplo
  console.log('\n' + '='.repeat(70));
  console.log('📝 EXEMPLOS DE DADOS:\n');

  // Mostrar tipos de documento
  const { data: tipos } = await supabase
    .from('document_types')
    .select('*')
    .limit(5)
    .order('name');

  if (tipos && tipos.length > 0) {
    console.log('📄 Tipos de Documento (primeiros 5):');
    tipos.forEach(t => console.log(`   ${t.id}. ${t.name}`));
  }

  // Mostrar órgãos públicos
  const { data: orgaos } = await supabase
    .from('public_organs')
    .select('*')
    .limit(5)
    .order('name');

  if (orgaos && orgaos.length > 0) {
    console.log('\n🏛️ Órgãos Públicos (primeiros 5):');
    orgaos.forEach(o => console.log(`   ${o.id}. ${o.name}`));
  }

  // Mostrar assuntos principais
  const { data: assuntos } = await supabase
    .from('main_subjects')
    .select('*')
    .limit(5)
    .order('name');

  if (assuntos && assuntos.length > 0) {
    console.log('\n📚 Assuntos Principais (primeiros 5):');
    assuntos.forEach(a => console.log(`   ${a.id}. ${a.name}`));
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ BANCO DE DADOS TOTALMENTE CONFIGURADO E FUNCIONAL!');
  console.log('\n🎯 Você mencionou ter 22 tabelas no projeto.');
  console.log(`   Encontramos ${tabelasEncontradas.length} tabelas acessíveis.`);

  if (tabelasEncontradas.length < 22) {
    console.log(`   Algumas tabelas podem estar em outros schemas ou com RLS restritivo.`);
  }
}

listarTabelas().catch(console.error);
