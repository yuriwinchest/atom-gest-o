/**
 * Teste com Credenciais Alternativas do Backblaze B2
 */

import dotenv from 'dotenv';

console.log('🔍 TESTE COM CREDENCIAIS ALTERNATIVAS\n');

// Testar primeiro com o arquivo atual
console.log('📋 1. TESTANDO COM backblaze-credentials.env');
console.log('============================================');
dotenv.config({ path: './backblaze-credentials.env' });

let keyId1 = process.env.BACKBLAZE_B2_APPLICATION_KEY_ID;
let appKey1 = process.env.BACKBLAZE_B2_APPLICATION_KEY;

console.log(`Key ID: ${keyId1}`);
console.log(`App Key: ${appKey1 ? '***' + appKey1.slice(-4) : 'NÃO CONFIGURADO'}`);

// Testar segundo com o arquivo alternativo
console.log('\n📋 2. TESTANDO COM CREDENCIAIS-BACKBLAZE-REAIS.env');
console.log('==================================================');
dotenv.config({ path: './CREDENCIAIS-BACKBLAZE-REAIS.env' });

let keyId2 = process.env.BACKBLAZE_B2_APPLICATION_KEY_ID;
let appKey2 = process.env.BACKBLAZE_B2_APPLICATION_KEY;

console.log(`Key ID: ${keyId2}`);
console.log(`App Key: ${appKey2 ? '***' + appKey2.slice(-4) : 'NÃO CONFIGURADO'}`);

// Comparar as credenciais
console.log('\n🔍 COMPARAÇÃO DAS CREDENCIAIS');
console.log('=============================');

if (keyId1 === keyId2) {
  console.log('✅ Key IDs são iguais');
} else {
  console.log('❌ Key IDs são diferentes');
  console.log(`   Arquivo 1: ${keyId1}`);
  console.log(`   Arquivo 2: ${keyId2}`);
}

if (appKey1 === appKey2) {
  console.log('✅ Application Keys são iguais');
} else {
  console.log('❌ Application Keys são diferentes');
  console.log(`   Arquivo 1: ***${appKey1?.slice(-4) || 'N/A'}`);
  console.log(`   Arquivo 2: ***${appKey2?.slice(-4) || 'N/A'}`);
}

console.log('');

// Testar autenticação com ambas as credenciais
async function testAuth(credentials, label) {
  try {
    console.log(`🧪 Testando autenticação com ${label}...`);

    const base64Credentials = Buffer.from(credentials).toString('base64');

    const response = await fetch('https://api002.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${base64Credentials}`
      }
    });

    console.log(`   Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ ${label} - Autenticação bem-sucedida!`);
      console.log(`   Account ID: ${data.accountId}`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`   ❌ ${label} - Falha na autenticação: ${errorText}`);
      return false;
    }

  } catch (error) {
    console.error(`   ❌ ${label} - Erro na requisição: ${error.message}`);
    return false;
  }
}

// Testar ambas as credenciais
console.log('🚀 TESTANDO AMBAS AS CREDENCIAIS');
console.log('================================');

if (keyId1 && appKey1) {
  const credentials1 = `${keyId1}:${appKey1}`;
  await testAuth(credentials1, 'Arquivo 1 (backblaze-credentials.env)');
}

console.log('');

if (keyId2 && appKey2) {
  const credentials2 = `${keyId2}:${appKey2}`;
  await testAuth(credentials2, 'Arquivo 2 (CREDENCIAIS-BACKBLAZE-REAIS.env)');
}

console.log('\n📋 RESUMO DOS TESTES');
console.log('====================');

if (keyId1 && appKey1) {
  console.log('Arquivo 1 (backblaze-credentials.env):');
  console.log(`   Key ID: ${keyId1}`);
  console.log(`   App Key: ***${appKey1.slice(-4)}`);
  console.log(`   Status: ${keyId1 && appKey1 ? '✅ Configurado' : '❌ Não configurado'}`);
}

if (keyId2 && appKey2) {
  console.log('Arquivo 2 (CREDENCIAIS-BACKBLAZE-REAIS.env):');
  console.log(`   Key ID: ${keyId2}`);
  console.log(`   App Key: ***${appKey2.slice(-4)}`);
  console.log(`   Status: ${keyId2 && appKey2 ? '✅ Configurado' : '❌ Não configurado'}`);
}

console.log('\n🔧 RECOMENDAÇÕES:');
console.log('1. Use apenas um arquivo de credenciais para evitar conflitos');
console.log('2. Verifique se as credenciais estão corretas no painel do Backblaze');
console.log('3. Considere criar uma nova chave de aplicação se necessário');
console.log('4. Certifique-se de que a conta está ativa e tem permissões');
