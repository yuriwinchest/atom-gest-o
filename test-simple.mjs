#!/usr/bin/env node

import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente
config({ path: resolve(process.cwd(), 'backblaze-credentials.env') });

console.log('🧪 TESTE SIMPLES BACKBLAZE B2');
console.log('===============================\n');

// Verificar variáveis de ambiente
console.log('📋 VARIÁVEIS DE AMBIENTE:');
console.log(`Account ID: ${process.env.BACKBLAZE_B2_ACCOUNT_ID ? '✅ OK' : '❌ FALTANDO'}`);
console.log(`Key ID: ${process.env.BACKBLAZE_B2_APPLICATION_KEY_ID ? '✅ OK' : '❌ FALTANDO'}`);
console.log(`Application Key: ${process.env.BACKBLAZE_B2_APPLICATION_KEY ? '✅ OK' : '❌ FALTANDO'}`);
console.log(`Bucket Name: ${process.env.BACKBLAZE_B2_BUCKET_NAME ? '✅ OK' : '❌ FALTANDO'}`);
console.log(`Bucket ID: ${process.env.BACKBLAZE_B2_BUCKET_ID ? '✅ OK' : '❌ FALTANDO'}\n`);

// Testar autenticação básica
async function testAuth() {
  try {
    console.log('🔐 TESTANDO AUTENTICAÇÃO...');

    const keyId = process.env.BACKBLAZE_B2_APPLICATION_KEY_ID;
    const key = process.env.BACKBLAZE_B2_APPLICATION_KEY;

    if (!keyId || !key) {
      throw new Error('Credenciais não configuradas');
    }

    const authString = btoa(`${keyId}:${key}`);

    const response = await fetch('https://api002.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const authData = await response.json();
    console.log('✅ AUTENTICAÇÃO OK!');
    console.log(`   API URL: ${authData.apiUrl}`);
    console.log(`   Bucket: ${authData.allowed.bucketName}`);

    return true;
  } catch (error) {
    console.error('❌ FALHA NA AUTENTICAÇÃO:', error.message);
    return false;
  }
}

// Executar teste
testAuth().then(success => {
  if (success) {
    console.log('\n🎉 CONEXÃO FUNCIONANDO!');
  } else {
    console.log('\n💥 PROBLEMA NA CONEXÃO!');
  }
});
