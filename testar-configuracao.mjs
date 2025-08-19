#!/usr/bin/env node

/**
 * Script para testar se a configuração do Supabase está sendo carregada
 * Execute: node testar-configuracao.mjs
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Obter diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Testando Configuração do Supabase...\n');

// 1. Verificar se o arquivo existe
const envPath = join(__dirname, 'config-supabase.env');
console.log('📁 Verificando arquivo de configuração:');
console.log(`   Caminho: ${envPath}`);
console.log(`   Existe: ${fs.existsSync(envPath) ? '✅ Sim' : '❌ Não'}\n`);

if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo config-supabase.env não encontrado!');
  process.exit(1);
}

// 2. Carregar variáveis de ambiente
console.log('📋 Carregando variáveis de ambiente...');
dotenv.config({ path: envPath });

// 3. Verificar variáveis carregadas
console.log('\n🔑 Variáveis carregadas:');
console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Configurada' : '❌ Não configurada'}`);
console.log(`   SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
console.log(`   SUPABASE_SERVICE_KEY: ${process.env.SUPABASE_SERVICE_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
console.log(`   SUPABASE_STORAGE_BUCKET: ${process.env.SUPABASE_STORAGE_BUCKET ? '✅ Configurada' : '❌ Não configurada'}`);

// 4. Verificar valores das variáveis
console.log('\n📊 Valores das variáveis:');
console.log(`   URL: ${process.env.SUPABASE_URL || 'N/A'}`);
console.log(`   Anon Key: ${process.env.SUPABASE_ANON_KEY ? `${process.env.SUPABASE_ANON_KEY.substring(0, 20)}...` : 'N/A'}`);
console.log(`   Service Key: ${process.env.SUPABASE_SERVICE_KEY ? `${process.env.SUPABASE_SERVICE_KEY.substring(0, 20)}...` : 'N/A'}`);
console.log(`   Bucket: ${process.env.SUPABASE_STORAGE_BUCKET || 'N/A'}`);

// 5. Testar conexão com Supabase
console.log('\n🔌 Testando conexão com Supabase...');
try {
  const { createClient } = await import('@supabase/supabase-js');

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error('Variáveis de ambiente não configuradas');
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  // Teste de conexão
  const { data, error } = await supabase
    .from('homepage_content')
    .select('count')
    .limit(1);

  if (error) {
    console.log(`   ❌ Erro na conexão: ${error.message}`);
  } else {
    console.log('   ✅ Conexão anônima funcionando');
  }

  // Teste de conexão administrativa
  if (process.env.SUPABASE_SERVICE_KEY) {
    const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('homepage_content')
      .select('count')
      .limit(1);

    if (adminError) {
      console.log(`   ❌ Erro na conexão administrativa: ${adminError.message}`);
    } else {
      console.log('   ✅ Conexão administrativa funcionando');
    }
  } else {
    console.log('   ⚠️ Service key não configurada');
  }

} catch (error) {
  console.log(`   ❌ Erro: ${error.message}`);
}

// 6. Resumo
console.log('\n🎯 Resumo da Configuração:');
const hasUrl = !!process.env.SUPABASE_URL;
const hasAnonKey = !!process.env.SUPABASE_ANON_KEY;
const hasServiceKey = !!process.env.SUPABASE_SERVICE_KEY;

if (hasUrl && hasAnonKey && hasServiceKey) {
  console.log('   ✅ Configuração completa - Sistema pronto!');
} else if (hasUrl && hasAnonKey) {
  console.log('   ⚠️ Configuração parcial - Falta service key');
} else {
  console.log('   ❌ Configuração incompleta - Verifique o arquivo');
}

console.log('\n🚀 Próximos passos:');
if (hasUrl && hasAnonKey && hasServiceKey) {
  console.log('   1. Reiniciar o servidor');
  console.log('   2. Testar criação de card na interface');
  console.log('   3. Verificar se não há mais erro de RLS');
} else {
  console.log('   1. Verificar arquivo config-supabase.env');
  console.log('   2. Configurar service key do Supabase');
  console.log('   3. Executar este teste novamente');
}
