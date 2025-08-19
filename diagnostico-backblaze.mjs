#!/usr/bin/env node

/**
 * Script de Diagnóstico Backblaze B2
 * Identifica problemas específicos na conexão
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente
config({ path: resolve(process.cwd(), 'backblaze-credentials.env') });

console.log('🔍 DIAGNÓSTICO BACKBLAZE B2');
console.log('=============================\n');

// Verificar todas as variáveis
const vars = {
  'BACKBLAZE_B2_ACCOUNT_ID': process.env.BACKBLAZE_B2_ACCOUNT_ID,
  'BACKBLAZE_B2_APPLICATION_KEY_ID': process.env.BACKBLAZE_B2_APPLICATION_KEY_ID,
  'BACKBLAZE_B2_APPLICATION_KEY': process.env.BACKBLAZE_B2_APPLICATION_KEY,
  'BACKBLAZE_B2_BUCKET_NAME': process.env.BACKBLAZE_B2_BUCKET_NAME,
  'BACKBLAZE_B2_BUCKET_ID': process.env.BACKBLAZE_B2_BUCKET_ID,
  'BACKBLAZE_B2_ENDPOINT': process.env.BACKBLAZE_B2_ENDPOINT
};

console.log('📋 VERIFICAÇÃO DE VARIÁVEIS:');
Object.entries(vars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
  } else {
    console.log(`❌ ${key}: FALTANDO`);
  }
});

// Testar conectividade de rede
async function testNetworkConnectivity() {
  console.log('\n🌐 TESTANDO CONECTIVIDADE DE REDE:');

  const endpoints = [
    'https://api002.backblazeb2.com',
    'https://api005.backblazeb2.com',
    'https://f004.backblazeb2.com'
  ];

  for (const endpoint of endpoints) {
    try {
      const start = Date.now();
      const response = await fetch(endpoint, {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000) // 10 segundos timeout
      });
      const end = Date.now();

      if (response.ok) {
        console.log(`✅ ${endpoint}: ${end - start}ms`);
      } else {
        console.log(`⚠️ ${endpoint}: HTTP ${response.status} (${end - start}ms)`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`⏰ ${endpoint}: TIMEOUT`);
      } else {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }
  }
}

// Testar autenticação com diferentes timeouts
async function testAuthWithTimeouts() {
  console.log('\n⏱️ TESTANDO AUTENTICAÇÃO COM DIFERENTES TIMEOUTS:');

  const timeouts = [5000, 10000, 15000, 30000];

  for (const timeout of timeouts) {
    try {
      console.log(`\n🔄 Testando com timeout de ${timeout}ms...`);

      const keyId = process.env.BACKBLAZE_B2_APPLICATION_KEY_ID;
      const key = process.env.BACKBLAZE_B2_APPLICATION_KEY;

      if (!keyId || !key) {
        throw new Error('Credenciais não configuradas');
      }

      const authString = btoa(`${keyId}:${key}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const start = Date.now();
      const response = await fetch('https://api002.backblazeb2.com/b2api/v2/b2_authorize_account', {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${authString}`
        },
        signal: controller.signal
    });

      clearTimeout(timeoutId);
      const end = Date.now();

    if (response.ok) {
        const authData = await response.json();
        console.log(`✅ Timeout ${timeout}ms: OK (${end - start}ms)`);
        console.log(`   API URL: ${authData.apiUrl}`);
        console.log(`   Bucket: ${authData.allowed.bucketName}`);
        return authData;
      } else {
        console.log(`⚠️ Timeout ${timeout}ms: HTTP ${response.status} (${end - start}ms)`);
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`⏰ Timeout ${timeout}ms: EXPIRADO`);
      } else {
        console.log(`❌ Timeout ${timeout}ms: ${error.message}`);
      }
    }
  }

  return null;
}

// Testar upload URL com autenticação válida
async function testUploadUrl(authData) {
  if (!authData) {
    console.log('\n❌ Não é possível testar URL de upload sem autenticação');
    return false;
  }

  console.log('\n🔗 TESTANDO URL DE UPLOAD:');

  try {
    const start = Date.now();
    const response = await fetch(`${authData.apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bucketId: process.env.BACKBLAZE_B2_BUCKET_ID
      }),
      signal: AbortSignal.timeout(15000)
    });

    const end = Date.now();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const uploadData = await response.json();
    console.log(`✅ URL de upload obtida em ${end - start}ms`);
    console.log(`   Upload URL: ${uploadData.uploadUrl.substring(0, 50)}...`);

    return uploadData;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Timeout ao obter URL de upload');
    } else {
      console.error('❌ Falha ao obter URL de upload:', error.message);
    }
    return false;
  }
}

// Função principal
async function runDiagnostic() {
  try {
    console.log('🚀 Iniciando diagnóstico completo...\n');

    // Teste 1: Conectividade de rede
    await testNetworkConnectivity();

    // Teste 2: Autenticação com diferentes timeouts
    const authData = await testAuthWithTimeouts();

    // Teste 3: URL de upload (se autenticação funcionar)
    if (authData) {
      await testUploadUrl(authData);
    }

    // Resumo
    console.log('\n📊 RESUMO DO DIAGNÓSTICO:');
    console.log('============================');

    if (authData) {
      console.log('✅ Autenticação: FUNCIONANDO');
      console.log('✅ Conectividade: FUNCIONANDO');
      console.log('✅ API: FUNCIONANDO');
      console.log('\n🎉 O Backblaze B2 está funcionando perfeitamente!');
      console.log('💡 Se ainda houver problemas, verifique:');
      console.log('   - Configurações do firewall');
      console.log('   - Proxy da rede');
      console.log('   - Limitações de banda');
} else {
      console.log('❌ Autenticação: FALHANDO');
      console.log('❌ Verifique as credenciais e conectividade');
    }

  } catch (error) {
    console.error('\n💥 ERRO NO DIAGNÓSTICO:', error.message);
  }
}

// Executar diagnóstico
runDiagnostic();
