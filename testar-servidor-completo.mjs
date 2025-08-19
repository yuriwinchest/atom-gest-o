// Script para testar o servidor e Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cm5ocHF6Ymh3aXFhc3V5d2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTIxMTYsImV4cCI6MjA2NjU4ODExNn0.6-jfb70OUjegikt8zBWmZGzcb6QZ-4jJiEXaxsVWez4';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 TESTE COMPLETO DO SISTEMA\n');
console.log('='.repeat(60));

// 1. Testar Supabase diretamente
console.log('1️⃣ TESTE DIRETO NO SUPABASE:');
const { data: supabaseData, error: supabaseError } = await supabase
  .from('document_types')
  .select('*');

if (supabaseError) {
  console.log('❌ Erro:', supabaseError.message);
} else {
  console.log(`✅ Supabase OK: ${supabaseData.length} registros`);
  console.log('   Primeiros 3:', supabaseData.slice(0, 3).map(d => d.name).join(', '));
}

// 2. Testar API do servidor
console.log('\n2️⃣ TESTE DA API DO SERVIDOR:');
try {
  const response = await fetch('http://localhost:5000/api/document-types');
  const apiData = await response.json();

  if (Array.isArray(apiData)) {
    console.log(`📡 API retornou: ${apiData.length} registros`);
    if (apiData.length > 0) {
      console.log('   Primeiros 3:', apiData.slice(0, 3).map(d => d.name).join(', '));
    } else {
      console.log('   ⚠️ Array vazio!');
    }
  } else {
    console.log('❌ API não retornou um array:', apiData);
  }
} catch (err) {
  console.log('❌ Erro ao chamar API:', err.message);
}

// 3. Testar outras APIs
console.log('\n3️⃣ TESTE DE OUTRAS APIS:');

const apis = [
  '/api/public-organs',
  '/api/main-subjects',
  '/api/responsible-sectors'
];

for (const api of apis) {
  try {
    const response = await fetch(`http://localhost:5000${api}`);
    const data = await response.json();
    console.log(`   ${api}: ${Array.isArray(data) ? data.length + ' registros' : 'erro'}`);
  } catch (err) {
    console.log(`   ${api}: ❌ erro`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 DIAGNÓSTICO:');

// Comparar resultados
if (supabaseData && supabaseData.length > 0) {
  console.log('✅ Supabase tem dados');

  try {
    const response = await fetch('http://localhost:5000/api/document-types');
    const apiData = await response.json();

    if (apiData.length === 0) {
      console.log('❌ API retorna vazio - PROBLEMA NO SERVIDOR');
      console.log('\n💡 POSSÍVEIS CAUSAS:');
      console.log('   1. storage.ts ainda está usando db local');
      console.log('   2. Servidor não foi reiniciado após correção');
      console.log('   3. Erro na importação do Supabase');
    } else {
      console.log('✅ API funcionando corretamente!');
    }
  } catch (err) {
    console.log('❌ Servidor não está respondendo');
  }
}
