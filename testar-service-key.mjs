#!/usr/bin/env node

/**
 * Script para testar especificamente a service key do Supabase
 * Execute: node testar-service-key.mjs
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
dotenv.config({ path: './config-supabase.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

console.log('🔑 Testando Service Key do Supabase...\n');

// Verificar variáveis
console.log('📋 Configuração:');
console.log(`   URL: ${SUPABASE_URL}`);
console.log(`   Service Key: ${SUPABASE_SERVICE_KEY}`);
console.log(`   Service Key Length: ${SUPABASE_SERVICE_KEY?.length || 0}`);
console.log(`   Service Key Starts with: ${SUPABASE_SERVICE_KEY?.substring(0, 10)}...`);
console.log(`   Service Key Ends with: ...${SUPABASE_SERVICE_KEY?.substring(-10)}`);

// Verificar se há espaços ou caracteres especiais
if (SUPABASE_SERVICE_KEY) {
  console.log('\n🔍 Análise da Service Key:');
  console.log(`   Contém espaços: ${SUPABASE_SERVICE_KEY.includes(' ') ? '❌ SIM' : '✅ NÃO'}`);
  console.log(`   Contém quebras de linha: ${SUPABASE_SERVICE_KEY.includes('\n') ? '❌ SIM' : '✅ NÃO'}`);
  console.log(`   Contém tabs: ${SUPABASE_SERVICE_KEY.includes('\t') ? '❌ SIM' : '✅ NÃO'}`);
  console.log(`   Contém aspas: ${SUPABASE_SERVICE_KEY.includes('"') || SUPABASE_SERVICE_KEY.includes("'") ? '❌ SIM' : '✅ NÃO'}`);

  // Verificar formato esperado
  const isValidFormat = SUPABASE_SERVICE_KEY.startsWith('sbp_') && SUPABASE_SERVICE_KEY.length === 51;
  console.log(`   Formato válido (sbp_ + 47 chars): ${isValidFormat ? '✅ SIM' : '❌ NÃO'}`);
}

// Testar conexão com service key
console.log('\n🔌 Testando conexão com Service Key...');
try {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('URL ou Service Key não configurados');
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('   📡 Tentando conexão...');

  // Teste simples de conexão
  const { data, error } = await supabaseAdmin
    .from('homepage_content')
    .select('count')
    .limit(1);

  if (error) {
    console.log(`   ❌ Erro na conexão: ${error.message}`);
    console.log(`   🔍 Código do erro: ${error.code || 'N/A'}`);
    console.log(`   📝 Detalhes: ${error.details || 'N/A'}`);
    console.log(`   💡 Dica: ${error.hint || 'N/A'}`);
  } else {
    console.log('   ✅ Conexão administrativa funcionando!');
    console.log(`   📊 Dados retornados: ${JSON.stringify(data)}`);
  }

} catch (error) {
  console.log(`   ❌ Erro inesperado: ${error.message}`);
  console.log(`   🔍 Stack trace: ${error.stack || 'N/A'}`);
}

// Teste alternativo: verificar se a chave está sendo lida corretamente
console.log('\n🔍 Verificação adicional:');
console.log(`   Service Key raw: "${SUPABASE_SERVICE_KEY}"`);
console.log(`   Service Key trimmed: "${SUPABASE_SERVICE_KEY?.trim()}"`);
console.log(`   Service Key JSON: ${JSON.stringify(SUPABASE_SERVICE_KEY)}`);

// Verificar se há problemas de encoding
if (SUPABASE_SERVICE_KEY) {
  const buffer = Buffer.from(SUPABASE_SERVICE_KEY, 'utf8');
  console.log(`   Service Key como Buffer: ${buffer.toString('hex')}`);
  console.log(`   Service Key length em bytes: ${buffer.length}`);
}

console.log('\n🎯 Resumo:');
if (SUPABASE_SERVICE_KEY && SUPABASE_SERVICE_KEY.startsWith('sbp_') && SUPABASE_SERVICE_KEY.length === 51) {
  console.log('   ✅ Service Key parece estar no formato correto');
  console.log('   🔍 Se ainda houver erro, pode ser:');
  console.log('      - Chave expirada ou inválida');
  console.log('      - Projeto incorreto');
  console.log('      - Permissões insuficientes');
} else {
  console.log('   ❌ Service Key com formato incorreto');
  console.log('   💡 Verifique se a chave está correta no Supabase');
}
