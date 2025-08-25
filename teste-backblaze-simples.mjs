/**
 * Teste Simples do Backblaze B2 - Diagnóstico de Autenticação
 */

import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: './backblaze-credentials.env' });

console.log('🔍 Diagnóstico de Autenticação Backblaze B2\n');

// Verificar variáveis
console.log('📋 Variáveis carregadas:');
console.log('BACKBLAZE_B2_ACCOUNT_ID:', process.env.BACKBLAZE_B2_ACCOUNT_ID);
console.log('BACKBLAZE_B2_APPLICATION_KEY_ID:', process.env.BACKBLAZE_B2_APPLICATION_KEY_ID);
console.log('BACKBLAZE_B2_APPLICATION_KEY:', process.env.BACKBLAZE_B2_APPLICATION_KEY ? '***' + process.env.BACKBLAZE_B2_APPLICATION_KEY.slice(-4) : 'NÃO CONFIGURADO');
console.log('BACKBLAZE_B2_BUCKET_NAME:', process.env.BACKBLAZE_B2_BUCKET_NAME);
console.log('BACKBLAZE_B2_BUCKET_ID:', process.env.BACKBLAZE_B2_BUCKET_ID);
console.log('');

// Testar autenticação básica
async function testAuth() {
  try {
    console.log('🔐 Testando autenticação...');

    const credentials = `${process.env.BACKBLAZE_B2_APPLICATION_KEY_ID}:${process.env.BACKBLAZE_B2_APPLICATION_KEY}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');

    console.log('Credenciais em Base64:', base64Credentials);
    console.log('Tamanho das credenciais:', credentials.length);

    const response = await fetch('https://api002.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${base64Credentials}`
      }
    });

    console.log('Status da resposta:', response.status);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Autenticação bem-sucedida!');
      console.log('Dados:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Falha na autenticação');
      console.log('Erro:', errorText);
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

testAuth();
