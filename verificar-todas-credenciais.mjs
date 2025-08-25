/**
 * Verificação de Todas as Credenciais Backblaze B2 no Projeto
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 VERIFICAÇÃO DE TODAS AS CREDENCIAIS BACKBLAZE B2\n');

// Função para ler arquivo e extrair credenciais
function extrairCredenciais(conteudo, nomeArquivo) {
  const credenciais = {};

  // Extrair Account ID
  const accountIdMatch = conteudo.match(/BACKBLAZE_B2_ACCOUNT_ID\s*=\s*([^\s#]+)/);
  if (accountIdMatch) credenciais.accountId = accountIdMatch[1];

  // Extrair Key ID
  const keyIdMatch = conteudo.match(/BACKBLAZE_B2_APPLICATION_KEY_ID\s*=\s*([^\s#]+)/);
  if (keyIdMatch) credenciais.keyId = keyIdMatch[1];

  // Extrair Application Key
  const appKeyMatch = conteudo.match(/BACKBLAZE_B2_APPLICATION_KEY\s*=\s*([^\s#]+)/);
  if (appKeyMatch) credenciais.appKey = appKeyMatch[1];

  // Extrair Bucket Name
  const bucketMatch = conteudo.match(/BACKBLAZE_B2_BUCKET_NAME\s*=\s*([^\s#]+)/);
  if (bucketMatch) credenciais.bucketName = bucketMatch[1];

  // Extrair Bucket ID
  const bucketIdMatch = conteudo.match(/BACKBLAZE_B2_BUCKET_ID\s*=\s*([^\s#]+)/);
  if (bucketIdMatch) credenciais.bucketId = bucketIdMatch[1];

  return { arquivo: nomeArquivo, credenciais };
}

// Função para testar credenciais
async function testarCredenciais(credenciais, label) {
  if (!credenciais.keyId || !credenciais.appKey) {
    console.log(`   ❌ ${label}: Credenciais incompletas`);
    return false;
  }

  try {
    const authString = Buffer.from(`${credenciais.keyId}:${credenciais.appKey}`).toString('base64');

    const response = await fetch('https://api002.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`
      }
    });

    if (response.ok) {
      console.log(`   ✅ ${label}: AUTENTICAÇÃO OK`);
      return true;
    } else {
      console.log(`   ❌ ${label}: Falha (${response.status})`);
      return false;
    }

  } catch (error) {
    console.log(`   ❌ ${label}: Erro - ${error.message}`);
    return false;
  }
}

// Função principal
async function verificarTodasCredenciais() {
  try {
    // 1. Listar todos os arquivos que podem conter credenciais
    const arquivos = fs.readdirSync('.').filter(f =>
      f.includes('backblaze') ||
      f.includes('credential') ||
      f.includes('env') ||
      f.includes('config')
    );

    console.log('📁 ARQUIVOS ENCONTRADOS:');
    console.log('========================');
    arquivos.forEach((arquivo, index) => {
      console.log(`${index + 1}. ${arquivo}`);
    });
    console.log('');

    // 2. Extrair credenciais de cada arquivo
    const todasCredenciais = [];

    for (const arquivo of arquivos) {
      try {
        const conteudo = fs.readFileSync(arquivo, 'utf8');
        const credenciais = extrairCredenciais(conteudo, arquivo);

        if (Object.keys(credenciais.credenciais).length > 0) {
          todasCredenciais.push(credenciais);
        }
      } catch (error) {
        // Arquivo não pode ser lido
      }
    }

    console.log('🔑 CREDENCIAIS EXTRAÍDAS:');
    console.log('==========================');

    for (const item of todasCredenciais) {
      console.log(`\n📄 ${item.arquivo}:`);
      if (item.credenciais.accountId) console.log(`   Account ID: ${item.credenciais.accountId}`);
      if (item.credenciais.keyId) console.log(`   Key ID: ${item.credenciais.keyId}`);
      if (item.credenciais.appKey) console.log(`   App Key: ***${item.credenciais.appKey.slice(-4)}`);
      if (item.credenciais.bucketName) console.log(`   Bucket: ${item.credenciais.bucketName}`);
      if (item.credenciais.bucketId) console.log(`   Bucket ID: ${item.credenciais.bucketId}`);
    }

    // 3. Testar todas as credenciais
    console.log('\n🧪 TESTANDO TODAS AS CREDENCIAIS:');
    console.log('==================================');

    const credenciaisFuncionais = [];

    for (const item of todasCredenciais) {
      if (item.credenciais.keyId && item.credenciais.appKey) {
        const funciona = await testarCredenciais(item.credenciais, item.arquivo);
        if (funciona) {
          credenciaisFuncionais.push(item);
        }
      }
    }

    // 4. Resultado final
    console.log('\n📊 RESULTADO FINAL:');
    console.log('====================');

    if (credenciaisFuncionais.length > 0) {
      console.log(`✅ ${credenciaisFuncionais.length} conjunto(s) de credenciais funcionando!`);
      console.log('\n🔧 CONFIGURAÇÃO RECOMENDADA:');

      const melhor = credenciaisFuncionais[0];
      console.log(`   BACKBLAZE_B2_ACCOUNT_ID=${melhor.credenciais.accountId}`);
      console.log(`   BACKBLAZE_B2_APPLICATION_KEY_ID=${melhor.credenciais.keyId}`);
      console.log(`   BACKBLAZE_B2_APPLICATION_KEY=${melhor.credenciais.appKey}`);
      console.log(`   BACKBLAZE_B2_BUCKET_NAME=${melhor.credenciais.bucketName || 'documentos-empresa'}`);
      if (melhor.credenciais.bucketId) {
        console.log(`   BACKBLAZE_B2_BUCKET_ID=${melhor.credenciais.bucketId}`);
      }

    } else {
      console.log('❌ NENHUMA CREDENCIAL FUNCIONANDO!');
      console.log('\n🔧 AÇÕES NECESSÁRIAS:');
      console.log('   1. Acessar painel do Backblaze B2');
      console.log('   2. Verificar se a conta está ativa');
      console.log('   3. Criar nova chave de aplicação');
      console.log('   4. Verificar permissões da chave');
    }

  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
  }
}

// Executar verificação
verificarTodasCredenciais();
