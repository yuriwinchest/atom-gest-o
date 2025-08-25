/**
 * Teste de Codificação das Credenciais Backblaze B2
 */

import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: './backblaze-credentials.env' });

console.log('🔍 TESTE DE CODIFICAÇÃO DAS CREDENCIAIS\n');

const keyId = process.env.BACKBLAZE_B2_APPLICATION_KEY_ID;
const appKey = process.env.BACKBLAZE_B2_APPLICATION_KEY;

console.log('📋 Credenciais:');
console.log(`Key ID: ${keyId}`);
console.log(`App Key: ${appKey}`);
console.log('');

// Testar diferentes métodos de codificação
console.log('🔐 Testando diferentes métodos de codificação...\n');

// Método 1: Codificação padrão
try {
  const credentials1 = `${keyId}:${appKey}`;
  const base64_1 = Buffer.from(credentials1).toString('base64');
  console.log('Método 1 - Buffer.from padrão:');
  console.log(`Credenciais: ${credentials1}`);
  console.log(`Base64: ${base64_1}`);
  console.log(`Tamanho: ${base64_1.length} caracteres`);
  console.log('');
} catch (error) {
  console.log('❌ Método 1 falhou:', error.message);
}

// Método 2: Codificação com escape de caracteres especiais
try {
  const credentials2 = `${keyId}:${appKey}`;
  const escapedCredentials = credentials2.replace(/[+/]/g, (match) => {
    if (match === '+') return '%2B';
    if (match === '/') return '%2F';
    return match;
  });
  const base64_2 = Buffer.from(escapedCredentials).toString('base64');
  console.log('Método 2 - Com escape de caracteres especiais:');
  console.log(`Credenciais originais: ${credentials2}`);
  console.log(`Credenciais escapadas: ${escapedCredentials}`);
  console.log(`Base64: ${base64_2}`);
  console.log(`Tamanho: ${base64_2.length} caracteres`);
  console.log('');
} catch (error) {
  console.log('❌ Método 2 falhou:', error.message);
}

// Método 3: Codificação direta sem Buffer
try {
  const credentials3 = `${keyId}:${appKey}`;
  const base64_3 = btoa(credentials3);
  console.log('Método 3 - btoa (navegador):');
  console.log(`Credenciais: ${credentials3}`);
  console.log(`Base64: ${base64_3}`);
  console.log(`Tamanho: ${base64_3.length} caracteres`);
  console.log('');
} catch (error) {
  console.log('❌ Método 3 falhou:', error.message);
}

// Método 4: Verificar se há caracteres problemáticos
console.log('🔍 Análise dos caracteres:');
const appKeyChars = appKey.split('');
const specialChars = appKeyChars.filter(char => /[^a-zA-Z0-9]/.test(char));

console.log(`Caracteres especiais encontrados: ${specialChars.join(', ')}`);
console.log(`Total de caracteres especiais: ${specialChars.length}`);

if (specialChars.includes('+')) {
  console.log('⚠️  Caractere "+" pode causar problemas na codificação Base64');
}
if (specialChars.includes('/')) {
  console.log('⚠️  Caractere "/" pode causar problemas na codificação Base64');
}

console.log('');

// Testar autenticação com o método que funcionou melhor
async function testAuth() {
  try {
    console.log('🧪 Testando autenticação com método otimizado...');

    const credentials = `${keyId}:${appKey}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');

    console.log(`Usando credenciais: ${keyId}:***${appKey.slice(-4)}`);
    console.log(`Base64 gerado: ${base64Credentials.substring(0, 30)}...`);

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
      console.log(`Account ID: ${data.accountId}`);
      console.log(`API URL: ${data.apiUrl}`);
    } else {
      const errorText = await response.text();
      console.log('❌ Falha na autenticação');
      console.log('Erro:', errorText);

      // Tentar com credenciais alternativas
      console.log('\n🔄 Tentando com credenciais alternativas...');

      // Verificar se há outro arquivo de credenciais
      const fs = await import('fs');
      const files = fs.readdirSync('.').filter(f => f.includes('backblaze') && f.includes('.env'));

      if (files.length > 1) {
        console.log(`Arquivos de credenciais encontrados: ${files.join(', ')}`);
        console.log('Considere verificar se está usando o arquivo correto');
      }
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

testAuth();
