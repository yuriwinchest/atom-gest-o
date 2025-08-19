#!/usr/bin/env node

/**
 * Debug de Upload Backblaze B2
 * Identifica o problema específico no endpoint de upload
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente
config({ path: resolve(process.cwd(), 'backblaze-credentials.env') });

console.log('🔍 DEBUG DE UPLOAD BACKBLAZE B2');
console.log('=================================\n');

async function debugUpload() {
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
    console.log(`   Upload URL: ${uploadUrlData.uploadUrl}`);
    console.log(`   Upload URL completa: ${uploadUrlData.uploadUrl}`);

    // 3. Testar conectividade com o endpoint de upload
    console.log('\n🌐 3. Testando conectividade com endpoint de upload...');

    try {
      const testResponse = await fetch(uploadUrlData.uploadUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000)
      });
      console.log(`✅ Endpoint acessível: HTTP ${testResponse.status}`);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('⏰ Endpoint: TIMEOUT');
      } else {
        console.log(`❌ Endpoint: ${error.message}`);
      }
    }

    // 4. Testar upload com arquivo mínimo
    console.log('\n📤 4. Testando upload com arquivo mínimo...');

    const minimalContent = 'test';
    const fileName = `test-${Date.now()}.txt`;

    // Calcular SHA1
    const encoder = new TextEncoder();
    const data = encoder.encode(minimalContent);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha1 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log(`   Conteúdo: "${minimalContent}"`);
    console.log(`   Tamanho: ${minimalContent.length} bytes`);
    console.log(`   SHA1: ${sha1}`);
    console.log(`   Nome: ${fileName}`);

    try {
      const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': authData.authorizationToken,
          'X-Bz-File-Name': fileName,
          'Content-Type': 'text/plain',
          'Content-Length': minimalContent.length.toString(),
          'X-Bz-Content-Sha1': sha1,
          'X-Bz-Info-Author': 'debug-script'
        },
        body: minimalContent
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.log(`❌ Upload falhou: HTTP ${uploadResponse.status}`);
        console.log(`   Erro: ${errorText}`);
      } else {
        const uploadResult = await uploadResponse.json();
        console.log('✅ Upload realizado com sucesso!');
        console.log(`   File ID: ${uploadResult.fileId}`);
        console.log(`   File Name: ${uploadResult.fileName}`);

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
          console.log('✅ Arquivo de teste deletado');
        } else {
          console.log('⚠️ Arquivo de teste não foi deletado');
        }
      }

    } catch (error) {
      console.error('❌ Erro no upload:', error.message);
      console.error('   Tipo de erro:', error.constructor.name);
      console.error('   Stack trace:', error.stack);

      // Verificar se é problema de CORS ou rede
      if (error.message.includes('fetch failed')) {
        console.log('\n💡 PROBLEMA IDENTIFICADO: fetch failed');
        console.log('   Possíveis causas:');
        console.log('   1. Problema de rede/firewall');
        console.log('   2. Endpoint bloqueado');
        console.log('   3. Problema de DNS');
        console.log('   4. Limitação de proxy');
      }
    }

  } catch (error) {
    console.error('\n💥 ERRO CRÍTICO:', error.message);
  }
}

// Executar debug
console.log('🚀 Iniciando debug de upload...\n');
debugUpload();
