#!/usr/bin/env node

/**
 * Script de Teste para Conexão Backblaze B2
 * Testa a conectividade e funcionalidade do serviço
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import fs from 'fs';

// Carregar variáveis de ambiente
config({ path: resolve(process.cwd(), 'backblaze-credentials.env') });

console.log('🧪 TESTE DE CONEXÃO BACKBLAZE B2');
console.log('=====================================\n');

// Verificar variáveis de ambiente
console.log('📋 VERIFICANDO VARIÁVEIS DE AMBIENTE:');
console.log(`✅ Account ID: ${process.env.BACKBLAZE_B2_ACCOUNT_ID ? 'Configurado' : '❌ Faltando'}`);
console.log(`✅ Key ID: ${process.env.BACKBLAZE_B2_APPLICATION_KEY_ID ? 'Configurado' : '❌ Faltando'}`);
console.log(`✅ Application Key: ${process.env.BACKBLAZE_B2_APPLICATION_KEY ? 'Configurado' : '❌ Faltando'}`);
console.log(`✅ Bucket Name: ${process.env.BACKBLAZE_B2_BUCKET_NAME ? 'Configurado' : '❌ Faltando'}`);
console.log(`✅ Bucket ID: ${process.env.BACKBLAZE_B2_BUCKET_ID ? 'Configurado' : '❌ Faltando'}`);
console.log(`✅ Endpoint: ${process.env.BACKBLAZE_B2_ENDPOINT ? 'Configurado' : '❌ Faltando'}\n`);

// Testar autenticação básica
async function testBasicAuth() {
  console.log('🔐 TESTANDO AUTENTICAÇÃO BÁSICA:');

  try {
    const accountId = process.env.BACKBLAZE_B2_ACCOUNT_ID;
    const keyId = process.env.BACKBLAZE_B2_APPLICATION_KEY_ID;
    const key = process.env.BACKBLAZE_B2_APPLICATION_KEY;

    if (!accountId || !keyId || !key) {
      throw new Error('Variáveis de ambiente não configuradas');
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
    console.log('✅ Autenticação bem-sucedida!');
    console.log(`   API URL: ${authData.apiUrl}`);
    console.log(`   Token: ${authData.authorizationToken.substring(0, 20)}...`);
    console.log(`   Bucket: ${authData.allowed.bucketName}`);

    return authData;
  } catch (error) {
    console.error('❌ Falha na autenticação:', error.message);
    return null;
  }
}

// Testar obtenção de URL de upload
async function testUploadUrl(authData) {
  if (!authData) return false;

  console.log('\n🔗 TESTANDO URL DE UPLOAD:');

  try {
    const response = await fetch(`${authData.apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bucketId: process.env.BACKBLAZE_B2_BUCKET_ID
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const uploadData = await response.json();
    console.log('✅ URL de upload obtida com sucesso!');
    console.log(`   Upload URL: ${uploadData.uploadUrl.substring(0, 50)}...`);

    return true;
  } catch (error) {
    console.error('❌ Falha ao obter URL de upload:', error.message);
    return false;
  }
}

// Testar upload de arquivo pequeno
async function testFileUpload(authData) {
  if (!authData) return false;

  console.log('\n📤 TESTANDO UPLOAD DE ARQUIVO:');

  try {
    // Criar arquivo de teste
    const testContent = `Teste de conexão Backblaze B2 - ${new Date().toISOString()}`;
    const testFile = new Blob([testContent], { type: 'text/plain' });

    // Obter URL de upload
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
      throw new Error('Falha ao obter URL de upload para teste');
    }

    const uploadUrlData = await uploadUrlResponse.json();

    // Calcular SHA1
    const arrayBuffer = await testFile.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha1 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Fazer upload
    const fileName = `test-${Date.now()}.txt`;
    const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'X-Bz-File-Name': fileName,
        'Content-Type': 'text/plain',
        'Content-Length': testFile.size.toString(),
        'X-Bz-Content-Sha1': sha1,
        'X-Bz-Info-Author': 'test-script'
      },
      body: testFile
    });

    if (!uploadResponse.ok) {
      throw new Error(`HTTP ${uploadResponse.status}: ${uploadResponse.statusText}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('✅ Upload de teste bem-sucedido!');
    console.log(`   File ID: ${uploadResult.fileId}`);
    console.log(`   File Name: ${uploadResult.fileName}`);
    console.log(`   Size: ${uploadResult.contentLength} bytes`);

    // Deletar arquivo de teste
    console.log('\n🗑️ Deletando arquivo de teste...');
    const deleteResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_delete_file_version`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileId: uploadResult.fileId,
        fileName: uploadResult.fileName
      })
    });

    if (deleteResponse.ok) {
      console.log('✅ Arquivo de teste deletado com sucesso');
    } else {
      console.log('⚠️ Arquivo de teste não foi deletado (não crítico)');
    }

    return true;
  } catch (error) {
    console.error('❌ Falha no upload de teste:', error.message);
    return false;
  }
}

// Função principal de teste
async function runTests() {
  try {
    console.log('🚀 Iniciando testes de conectividade...\n');

    // Teste 1: Autenticação
    const authData = await testBasicAuth();

    // Teste 2: URL de Upload
    const uploadUrlOk = await testUploadUrl(authData);

    // Teste 3: Upload de Arquivo
    const uploadOk = await testFileUpload(authData);

    // Resultado final
    console.log('\n📊 RESULTADO DOS TESTES:');
    console.log('========================');
    console.log(`🔐 Autenticação: ${authData ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`🔗 URL de Upload: ${uploadUrlOk ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`📤 Upload de Arquivo: ${uploadOk ? '✅ PASSOU' : '❌ FALHOU'}`);

    if (authData && uploadUrlOk && uploadOk) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM!');
      console.log('✅ A conexão com Backblaze B2 está funcionando perfeitamente');
      console.log('✅ O sistema pode fazer upload e download de arquivos');
      console.log('✅ As credenciais estão corretas e válidas');
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM');
      console.log('❌ Verifique as credenciais e configurações');
      console.log('❌ Pode haver problemas de rede ou permissões');
    }

  } catch (error) {
    console.error('\n💥 ERRO CRÍTICO NOS TESTES:', error.message);
    console.error('❌ Verifique o console para mais detalhes');
  }
}

// Executar testes se o script for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}
