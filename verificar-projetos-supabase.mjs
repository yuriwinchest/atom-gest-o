// Script para verificar qual projeto Supabase está funcionando
import { createClient } from '@supabase/supabase-js';

console.log('🔍 VERIFICANDO PROJETOS SUPABASE\n');
console.log('='.repeat(60));

// Projeto 1 - fbqocpozjmuzrdeacktb
console.log('\n📦 PROJETO 1: fbqocpozjmuzrdeacktb');
console.log('URL: https://fbqocpozjmuzrdeacktb.supabase.co\n');

try {
  const supabase1 = createClient(
    'https://fbqocpozjmuzrdeacktb.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTY3ODYsImV4cCI6MjA2NTQzMjc4Nn0.nZPmcY4QtgnZ0K68TW2VlrQm4gyqodQUxgrWDechhhY'
  );

  const { data: users1, error: error1 } = await supabase1
    .from('users')
    .select('*', { count: 'exact', head: true });

  if (error1) {
    console.log(`❌ Erro: ${error1.message}`);
  } else {
    console.log('✅ Conexão OK - Tabela users existe');
  }

  // Verificar document_types
  const { data: types1, error: typesError1 } = await supabase1
    .from('document_types')
    .select('*', { count: 'exact', head: true });

  if (typesError1) {
    console.log(`❌ document_types: ${typesError1.message}`);
  } else {
    console.log('✅ document_types existe');
  }
} catch (err) {
  console.log('❌ Falha na conexão');
}

// Projeto 2 - xwrnhpqzbhwiqasuywjo
console.log('\n' + '='.repeat(60));
console.log('\n📦 PROJETO 2: xwrnhpqzbhwiqasuywjo');
console.log('URL: https://xwrnhpqzbhwiqasuywjo.supabase.co\n');

try {
  const supabase2 = createClient(
    'https://xwrnhpqzbhwiqasuywjo.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cm5ocHF6Ymh3aXFhc3V5d2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTIxMTYsImV4cCI6MjA2NjU4ODExNn0.6-jfb70OUjegikt8zBWmZGzcb6QZ-4jJiEXaxsVWez4'
  );

  const { data: users2, error: error2 } = await supabase2
    .from('users')
    .select('*', { count: 'exact', head: true });

  if (error2) {
    console.log(`❌ Erro: ${error2.message}`);
  } else {
    console.log('✅ Conexão OK - Tabela users existe');
  }

  // Verificar document_types
  const { count: typesCount, error: typesError2 } = await supabase2
    .from('document_types')
    .select('*', { count: 'exact', head: true });

  if (typesError2) {
    console.log(`❌ document_types: ${typesError2.message}`);
  } else {
    console.log(`✅ document_types existe com ${typesCount} registros`);
  }

  // Listar mais tabelas
  console.log('\n📊 Verificando outras tabelas:');
  const tabelas = [
    'public_organs',
    'responsible_sectors',
    'main_subjects',
    'confidentiality_levels',
    'files',
    'documents'
  ];

  for (const tabela of tabelas) {
    const { count, error } = await supabase2
      .from(tabela)
      .select('*', { count: 'exact', head: true });

    if (!error) {
      console.log(`   ✅ ${tabela}: ${count} registros`);
    } else {
      console.log(`   ❌ ${tabela}: ${error.message}`);
    }
  }

} catch (err) {
  console.log('❌ Falha na conexão');
}

console.log('\n' + '='.repeat(60));
console.log('\n💡 CONCLUSÃO:');
console.log('Use o projeto que está funcionando corretamente.');
console.log('As tabelas de categorias devem estar no projeto correto.');
