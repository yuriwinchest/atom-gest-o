// Script para testar com o service key do Supabase
import { createClient } from '@supabase/supabase-js';

// Usando o SERVICE KEY que você forneceu (tem acesso total)
const supabaseUrl = 'https://fbqocpozjmuzrdeacktb.supabase.co';
const serviceKey = 'sbp_e233b1bffaad38f21d1797acd6d7069834a50d77';

console.log('🔍 TESTANDO CONEXÃO COM SERVICE KEY\n');
console.log('URL:', supabaseUrl);
console.log('='.repeat(60));

// Tentar criar cliente com service key
try {
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('\n📊 LISTANDO TODAS AS TABELAS DO PROJETO:\n');

  // Lista de tabelas conhecidas para verificar
  const tabelasParaVerificar = [
    // Tabelas principais
    'users',
    'documents',
    'files',
    // Tabelas de categorias
    'document_types',
    'public_organs',
    'responsible_sectors',
    'main_subjects',
    'confidentiality_levels',
    'availability_options',
    'language_options',
    'rights_options',
    'document_authorities',
    // Outras possíveis tabelas
    'homepage_content',
    'footer_pages',
    'search_analytics',
    'document_analytics',
    'test_simple',
    'profiles',
    'sessions',
    'audit_logs',
    'permissions',
    'roles'
  ];

  let tabelasEncontradas = 0;
  let tabelasComDados = 0;

  for (const tabela of tabelasParaVerificar) {
    try {
      const { data, error, count } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (!error.message.includes('does not exist')) {
          console.log(`⚠️  ${tabela.padEnd(25)} - ${error.message}`);
        }
      } else {
        tabelasEncontradas++;
        const totalRegistros = count || 0;
        if (totalRegistros > 0) tabelasComDados++;
        console.log(`✅ ${tabela.padEnd(25)} - EXISTE (${totalRegistros} registros)`);
      }
    } catch (err) {
      // Silenciosamente ignorar erros de tabelas que não existem
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📈 RESUMO: ${tabelasEncontradas} tabelas encontradas`);
  console.log(`📊 ${tabelasComDados} tabelas com dados`);

  // Testar especificamente as tabelas de categorias
  console.log('\n' + '='.repeat(60));
  console.log('🔍 VERIFICANDO CATEGORIAS ESPECÍFICAS:\n');

  const { data: tipos, error: tiposError } = await supabase
    .from('document_types')
    .select('*')
    .limit(5);

  if (!tiposError && tipos && tipos.length > 0) {
    console.log('📄 Tipos de Documento (primeiros 5):');
    tipos.forEach(t => console.log(`   - ${t.name}`));
  } else if (tiposError) {
    console.log(`❌ Erro em document_types: ${tiposError.message}`);
  }

} catch (error) {
  console.log('❌ ERRO: Token de serviço pode estar incorreto ou expirado');
  console.log('Detalhes:', error.message);

  console.log('\n💡 NOTA: O token que você forneceu parece ser um SERVICE KEY.');
  console.log('Service keys começam com "sbp_" e têm acesso total ao banco.');
  console.log('Certifique-se de que o token está correto e ativo.');
}

console.log('\n' + '='.repeat(60));
console.log('📌 INFORMAÇÕES DO PROJETO:');
console.log('   URL: https://fbqocpozjmuzrdeacktb.supabase.co');
console.log('   Dashboard: https://supabase.com/dashboard/project/fbqocpozjmuzrdeacktb');
console.log('   Você mencionou que o projeto tem 22 tabelas.');
