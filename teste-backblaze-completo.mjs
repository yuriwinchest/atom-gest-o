/**
 * Teste Completo do Backblaze B2 - Validação de Configuração e Upload
 * Este script testa toda a configuração e funcionalidades do Backblaze B2
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: './backblaze-credentials.env' });

console.log('🚀 Iniciando teste completo do Backblaze B2...\n');

// 1. VERIFICAÇÃO DAS VARIÁVEIS DE AMBIENTE
console.log('📋 1. VERIFICANDO VARIÁVEIS DE AMBIENTE');
console.log('=====================================');

const requiredEnvVars = [
  'BACKBLAZE_B2_ACCOUNT_ID',
  'BACKBLAZE_B2_APPLICATION_KEY_ID',
  'BACKBLAZE_B2_APPLICATION_KEY',
  'BACKBLAZE_B2_BUCKET_NAME',
  'BACKBLAZE_B2_BUCKET_ID'
];

let envVarsOk = true;
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('KEY') ? '***' + value.slice(-4) : value}`);
  } else {
    console.log(`❌ ${varName}: NÃO CONFIGURADO`);
    envVarsOk = false;
  }
});

if (!envVarsOk) {
  console.log('\n❌ ERRO: Variáveis de ambiente incompletas!');
  process.exit(1);
}

console.log('\n✅ Todas as variáveis de ambiente estão configuradas!\n');

// 2. TESTE DE CONECTIVIDADE COM BACKBLAZE B2
console.log('🔌 2. TESTANDO CONECTIVIDADE COM BACKBLAZE B2');
console.log('============================================');

async function testBackblazeConnectivity() {
  try {
    console.log('🔐 Autenticando com Backblaze B2...');

    // Usar o endpoint correto da API REST do Backblaze B2
    const authResponse = await fetch('https://api002.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.BACKBLAZE_B2_APPLICATION_KEY_ID}:${process.env.BACKBLAZE_B2_APPLICATION_KEY}`).toString('base64')}`
      }
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      throw new Error(`Falha na autenticação: ${authResponse.status} - ${errorText}`);
    }

    const authData = await authResponse.json();
    console.log('✅ Autenticação bem-sucedida!');
    console.log(`   Account ID: ${authData.accountId}`);
    console.log(`   API URL: ${authData.apiUrl}`);
    console.log(`   Authorization Token: ${authData.authorizationToken ? '✅ Válido' : '❌ Inválido'}`);

    return authData;
  } catch (error) {
    console.error('❌ Falha na conectividade:', error.message);
    throw error;
  }
}

// 3. TESTE DE LISTAGEM DE ARQUIVOS
console.log('\n📋 3. TESTANDO LISTAGEM DE ARQUIVOS');
console.log('===================================');

async function testListFiles(authData) {
  try {
    console.log('📁 Listando arquivos no bucket...');

    const listResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_list_file_names`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bucketId: process.env.BACKBLAZE_B2_BUCKET_ID,
        maxFileCount: 10
      })
    });

    if (!listResponse.ok) {
      throw new Error(`Falha na listagem: ${listResponse.status} - ${listResponse.statusText}`);
    }

    const listData = await listResponse.json();
    console.log(`✅ Listagem bem-sucedida! ${listData.files.length} arquivos encontrados`);

    if (listData.files.length > 0) {
      console.log('   Primeiros arquivos:');
      listData.files.slice(0, 3).forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.fileName} (${file.contentLength} bytes)`);
      });
    }

    return listData;
  } catch (error) {
    console.error('❌ Falha na listagem:', error.message);
    throw error;
  }
}

// 4. TESTE DE UPLOAD DE ARQUIVO
console.log('\n📤 4. TESTANDO UPLOAD DE ARQUIVO');
console.log('================================');

async function testFileUpload(authData) {
  try {
    console.log('📝 Criando arquivo de teste...');

    // Criar arquivo de teste
    const testContent = `Teste de upload Backblaze B2 - ${new Date().toISOString()}\n\nEste é um arquivo de teste para validar a funcionalidade de upload do sistema de gestão de documentos.\n\nTimestamp: ${new Date().toISOString()}\nSistema: ATOM Gestão de Documentos\nVersão: 1.0.0`;

    const testFileName = `teste-backblaze-${Date.now()}.txt`;
    const testFilePath = path.join(process.cwd(), testFileName);

    fs.writeFileSync(testFilePath, testContent);
    console.log(`✅ Arquivo de teste criado: ${testFileName}`);

    // 1. Obter URL de upload
    console.log('🔗 Obtendo URL de upload...');
    const uploadUrlResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bucketId: process.env.BACKBLAZE_B2_BUCKET_ID
      })
    });

    if (!uploadUrlResponse.ok) {
      throw new Error(`Falha ao obter URL de upload: ${uploadUrlResponse.status}`);
    }

    const uploadUrlData = await uploadUrlResponse.json();
    console.log('✅ URL de upload obtida:', uploadUrlData.uploadUrl);

    // 2. Fazer upload do arquivo
    console.log('📤 Fazendo upload do arquivo...');
    const fileBuffer = fs.readFileSync(testFilePath);

    const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': uploadUrlData.authorizationToken,
        'Content-Type': 'text/plain',
        'Content-Length': fileBuffer.length.toString(),
        'X-Bz-File-Name': testFileName,
        'X-Bz-Content-Sha1': require('crypto').createHash('sha1').update(fileBuffer).digest('hex'),
        'X-Bz-Info-Author': 'Sistema ATOM'
      },
      body: fileBuffer
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Falha no upload: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('✅ Upload bem-sucedido!');
    console.log(`   File ID: ${uploadResult.fileId}`);
    console.log(`   File Name: ${uploadResult.fileName}`);
    console.log(`   Content Length: ${uploadResult.contentLength} bytes`);
    console.log(`   Content SHA1: ${uploadResult.contentSha1}`);

    // Limpar arquivo local
    fs.unlinkSync(testFilePath);
    console.log('🧹 Arquivo local limpo');

    return uploadResult;
  } catch (error) {
    console.error('❌ Falha no upload:', error.message);
    throw error;
  }
}

// 5. TESTE DE DOWNLOAD/ACESSO
console.log('\n📥 5. TESTANDO ACESSO AO ARQUIVO');
console.log('================================');

async function testFileAccess(uploadResult) {
  try {
    console.log('🔗 Gerando URL de download...');

    const downloadUrl = `https://f004.backblazeb2.com/file/${process.env.BACKBLAZE_B2_BUCKET_NAME}/${uploadResult.fileName}`;
    console.log('✅ URL de download gerada:', downloadUrl);

    // Testar acesso ao arquivo
    console.log('🌐 Testando acesso ao arquivo...');
    const accessResponse = await fetch(downloadUrl);

    if (!accessResponse.ok) {
      throw new Error(`Falha no acesso: ${accessResponse.status} - ${accessResponse.statusText}`);
    }

    const fileContent = await accessResponse.text();
    console.log('✅ Arquivo acessível!');
    console.log(`   Tamanho recebido: ${fileContent.length} bytes`);
    console.log(`   Conteúdo válido: ${fileContent.includes('Teste de upload Backblaze B2') ? '✅ Sim' : '❌ Não'}`);

    return downloadUrl;
  } catch (error) {
    console.error('❌ Falha no acesso:', error.message);
    throw error;
  }
}

// 6. TESTE DE EXCLUSÃO
console.log('\n🗑️ 6. TESTANDO EXCLUSÃO DE ARQUIVO');
console.log('==================================');

async function testFileDeletion(authData, uploadResult) {
  try {
    console.log('🗑️ Deletando arquivo de teste...');

    const deleteResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_delete_file_version`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: uploadResult.fileName,
        fileId: uploadResult.fileId
      })
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      throw new Error(`Falha na exclusão: ${deleteResponse.status} - ${errorText}`);
    }

    const deleteResult = await deleteResponse.json();
    console.log('✅ Arquivo deletado com sucesso!');
    console.log(`   File ID: ${deleteResult.fileId}`);
    console.log(`   File Name: ${deleteResult.fileName}`);

    return deleteResult;
  } catch (error) {
    console.error('❌ Falha na exclusão:', error.message);
    throw error;
  }
}

// 7. TESTE DE ESTATÍSTICAS
console.log('\n📊 7. OBTENDO ESTATÍSTICAS DO BUCKET');
console.log('=====================================');

async function testBucketStats(authData) {
  try {
    console.log('📈 Obtendo estatísticas do bucket...');

    const listResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_list_file_names`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bucketId: process.env.BACKBLAZE_B2_BUCKET_ID,
        maxFileCount: 1000
      })
    });

    if (!listResponse.ok) {
      throw new Error(`Falha ao obter estatísticas: ${listResponse.status}`);
    }

    const listData = await listResponse.json();
    const totalFiles = listData.files.length;
    const totalSize = listData.files.reduce((sum, file) => sum + file.contentLength, 0);

    console.log('✅ Estatísticas obtidas:');
    console.log(`   Total de arquivos: ${totalFiles}`);
    console.log(`   Tamanho total: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   Bucket: ${process.env.BACKBLAZE_B2_BUCKET_NAME}`);
    console.log(`   Bucket ID: ${process.env.BACKBLAZE_B2_BUCKET_ID}`);

    return { totalFiles, totalSize };
  } catch (error) {
    console.error('❌ Falha ao obter estatísticas:', error.message);
    throw error;
  }
}

// EXECUÇÃO DOS TESTES
async function runAllTests() {
  try {
    console.log('🚀 INICIANDO EXECUÇÃO DOS TESTES...\n');

    // Teste 1: Conectividade
    const authData = await testBackblazeConnectivity();

    // Teste 2: Listagem
    const listData = await testListFiles(authData);

    // Teste 3: Upload
    const uploadResult = await testFileUpload(authData);

    // Teste 4: Acesso
    const downloadUrl = await testFileAccess(uploadResult);

    // Teste 5: Exclusão
    const deleteResult = await testFileDeletion(authData, uploadResult);

    // Teste 6: Estatísticas
    const stats = await testBucketStats(authData);

    // RESULTADO FINAL
    console.log('\n🎉 RESULTADO FINAL DOS TESTES');
    console.log('=============================');
    console.log('✅ TODOS OS TESTES PASSARAM COM SUCESSO!');
    console.log('');
    console.log('📋 RESUMO:');
    console.log('   🔐 Autenticação: ✅ Funcionando');
    console.log('   📁 Listagem: ✅ Funcionando');
    console.log('   📤 Upload: ✅ Funcionando');
    console.log('   📥 Download: ✅ Funcionando');
    console.log('   🗑️ Exclusão: ✅ Funcionando');
    console.log('   📊 Estatísticas: ✅ Funcionando');
    console.log('');
    console.log('🚀 O Backblaze B2 está configurado e funcionando perfeitamente!');
    console.log('   O sistema pode enviar, armazenar e gerenciar arquivos sem problemas.');

  } catch (error) {
    console.error('\n❌ FALHA NOS TESTES');
    console.error('===================');
    console.error('Erro:', error.message);
    console.error('');
    console.error('🔧 VERIFICAÇÕES NECESSÁRIAS:');
    console.error('   1. Verificar se as credenciais estão corretas');
    console.error('   2. Verificar se o bucket existe e está acessível');
    console.error('   3. Verificar se as permissões da chave estão corretas');
    console.error('   4. Verificar conectividade com a internet');
    console.error('   5. Verificar se o endpoint está correto');

    process.exit(1);
  }
}

// Executar testes
runAllTests();
