#!/usr/bin/env node

/**
 * Teste Final de Upload Backblaze B2
 * Verifica se o problema de autenticação foi resolvido
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente
config({ path: resolve(process.cwd(), 'backblaze-credentials.env') });

console.log('🎯 TESTE FINAL DE UPLOAD BACKBLAZE B2');
console.log('======================================\n');

async function testFinalUpload() {
  try {
    console.log('🔐 1. Autenticando...');

    const keyId = process.env.BACKBLAZE_B2_APPLICATION_KEY_ID;
    const key = process.env.BACKBLAZE_B2_APPLICATION_KEY;

    if (!keyId || !key) {
      throw new Error('Credenciais não configuradas');
    }

    const authString = btoa(`${keyId}:${key}`);

    const authResponse = await fetch('https://api002.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`
      }
    });

    if (!authResponse.ok) {
      throw new Error(`Falha na autenticação: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    console.log('✅ Autenticação OK');
    console.log(`   API URL: ${authData.apiUrl}`);

    // 2. Obter URL de upload
    console.log('\n🔗 2. Obtendo URL de upload...');

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
    console.log('✅ URL de upload obtida');
    console.log(`   Upload URL: ${uploadUrlData.uploadUrl.substring(0, 50)}...`);

    // 3. Fazer upload com token FRESCO
    console.log('\n📤 3. Fazendo upload com token fresco...');

    const content = `Teste final - ${new Date().toISOString()}\nEste é um teste para verificar se o problema de autenticação foi resolvido.`;
    const fileName = `test-final-${Date.now()}.txt`;

    // Calcular SHA1
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha1 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log(`   Conteúdo: "${content.substring(0, 30)}..."`);
    console.log(`   Tamanho: ${content.length} bytes`);
    console.log(`   SHA1: ${sha1}`);
    console.log(`   Nome: ${fileName}`);
    console.log(`   Token usado: ${authData.authorizationToken.substring(0, 20)}...`);

    const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken, // Token FRESCO da mesma sessão
        'X-Bz-File-Name': fileName,
        'Content-Type': 'text/plain',
        'Content-Length': content.length.toString(),
        'X-Bz-Content-Sha1': sha1,
        'X-Bz-Info-Author': 'test-final-script'
      },
      body: content
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload falhou: HTTP ${uploadResponse.status} - ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('✅ Upload realizado com sucesso!');
    console.log(`   File ID: ${uploadResult.fileId}`);
    console.log(`   File Name: ${uploadResult.fileName}`);
    console.log(`   Size: ${uploadResult.contentLength} bytes`);

    // 4. Deletar arquivo de teste
    console.log('\n🗑️ 4. Deletando arquivo de teste...');

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
      console.log('✅ Arquivo de teste deletado');
    } else {
      console.log('⚠️ Arquivo de teste não foi deletado (não crítico)');
    }

    console.log('\n🎉 TESTE FINAL CONCLUÍDO COM SUCESSO!');
    console.log('✅ O problema de autenticação foi resolvido');
    console.log('✅ Upload funcionando perfeitamente');
    console.log('✅ Sistema pronto para uso em produção');

    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE FINAL:', error.message);
    console.error('💡 O problema ainda persiste');
    return false;
  }
}

// Executar teste final
console.log('🚀 Iniciando teste final...\n');
testFinalUpload();
