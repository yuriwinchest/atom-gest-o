/**
 * Verificação de Credenciais Backblaze B2
 */

import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: './backblaze-credentials.env' });

console.log('🔍 VERIFICAÇÃO DE CREDENCIAIS BACKBLAZE B2\n');

// Verificar variáveis
const accountId = process.env.BACKBLAZE_B2_ACCOUNT_ID;
const keyId = process.env.BACKBLAZE_B2_APPLICATION_KEY_ID;
const appKey = process.env.BACKBLAZE_B2_APPLICATION_KEY;
const bucketName = process.env.BACKBLAZE_B2_BUCKET_NAME;
const bucketId = process.env.BACKBLAZE_B2_BUCKET_ID;

console.log('📋 Variáveis carregadas:');
console.log(`✅ BACKBLAZE_B2_ACCOUNT_ID: ${accountId}`);
console.log(`✅ BACKBLAZE_B2_APPLICATION_KEY_ID: ${keyId}`);
console.log(`✅ BACKBLAZE_B2_APPLICATION_KEY: ${appKey ? '***' + appKey.slice(-4) : 'NÃO CONFIGURADO'}`);
console.log(`✅ BACKBLAZE_B2_BUCKET_NAME: ${bucketName}`);
console.log(`✅ BACKBLAZE_B2_BUCKET_ID: ${bucketId}`);
console.log('');

// Verificar se as credenciais fazem sentido
console.log('🔍 Análise das credenciais:');

if (accountId && accountId.length === 12) {
  console.log('✅ Account ID: Formato correto (12 caracteres)');
} else {
  console.log('❌ Account ID: Formato incorreto');
}

if (keyId && keyId.startsWith('005') && keyId.length === 25) {
  console.log('✅ Key ID: Formato correto (começa com 005, 25 caracteres)');
} else {
  console.log('❌ Key ID: Formato incorreto');
}

if (appKey && appKey.length === 40) {
  console.log('✅ Application Key: Formato correto (40 caracteres)');
} else {
  console.log('❌ Application Key: Formato incorreto');
}

console.log('');

// Testar autenticação
async function testAuth() {
  try {
    console.log('🔐 Testando autenticação...');

    const credentials = `${keyId}:${appKey}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');

    console.log(`Tamanho das credenciais: ${credentials.length} caracteres`);
    console.log(`Base64 (primeiros 20 chars): ${base64Credentials.substring(0, 20)}...`);

    const response = await fetch('https://api002.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${base64Credentials}`
      }
    });

    console.log(`Status da resposta: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Autenticação bem-sucedida!');
      console.log(`Account ID retornado: ${data.accountId}`);
      console.log(`API URL: ${data.apiUrl}`);
    } else {
      const errorText = await response.text();
      console.log('❌ Falha na autenticação');
      console.log('Erro:', errorText);

      // Sugestões de correção
      console.log('\n🔧 SUGESTÕES DE CORREÇÃO:');
      console.log('1. Verifique se as credenciais estão corretas no painel do Backblaze');
      console.log('2. Verifique se a chave de aplicação tem as permissões corretas');
      console.log('3. Verifique se a conta está ativa');
      console.log('4. Tente criar uma nova chave de aplicação');
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

testAuth();
