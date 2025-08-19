#!/usr/bin/env node
import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis do arquivo específico
config({ path: resolve(process.cwd(), 'backblaze-credentials.env') });

console.log('🚀 TESTE DE UPLOAD DIRETO BACKBLAZE B2\n');

async function testeUploadDireto() {
  try {
    // 1. Configurações
    const accountId = process.env.BACKBLAZE_B2_ACCOUNT_ID;
    const keyId = process.env.BACKBLAZE_B2_APPLICATION_KEY_ID;
    const appKey = process.env.BACKBLAZE_B2_APPLICATION_KEY;
    const bucketId = process.env.BACKBLAZE_B2_BUCKET_ID;

    console.log('🔑 Configurações:');
    console.log('   Account ID:', accountId);
    console.log('   Key ID:', keyId);
    console.log('   App Key:', appKey ? '✅ CONFIGURADA' : '❌ NÃO CONFIGURADA');
    console.log('   Bucket ID:', bucketId);

    // 2. Autenticação ÚNICA
    console.log('\n🔐 1. AUTENTICAÇÃO ÚNICA...');
    const authUrl = 'https://api002.backblazeb2.com/b2api/v2/b2_authorize_account';
    const authString = btoa(`${keyId}:${appKey}`);

    const authResponse = await fetch(authUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`
      }
    });

    if (!authResponse.ok) {
      throw new Error(`Autenticação falhou: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    console.log('   ✅ Autenticação OK');
    console.log('   🌐 API URL:', authData.apiUrl);
    console.log('   🔑 Token:', authData.authorizationToken ? '✅ Válido' : '❌ Inválido');

    // 3. Obter URL de upload IMEDIATAMENTE
    console.log('\n🌐 2. OBTER URL DE UPLOAD...');
    const uploadUrlResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bucketId: bucketId
      })
    });

    if (!uploadUrlResponse.ok) {
      const errorText = await uploadUrlResponse.text();
      throw new Error(`Falha ao obter URL: ${uploadUrlResponse.status} - ${errorText}`);
    }

    const uploadUrlData = await uploadUrlResponse.json();
    console.log('   ✅ URL de upload obtida');
    console.log('   🔗 Upload URL:', uploadUrlData.uploadUrl);

    // 4. Upload IMEDIATO (sem delay)
    console.log('\n📤 3. UPLOAD IMEDIATO...');

    // Criar arquivo de teste
    const testContent = 'Teste de upload direto Backblaze B2';
    const testFile = new File([testContent], 'teste-direto.txt', { type: 'text/plain' });

    // Calcular SHA1
    const arrayBuffer = await testFile.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha1 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const fileName = `direto_${Date.now()}.txt`;

    console.log('   📄 Arquivo:', fileName);
    console.log('   📊 Tamanho:', testFile.size, 'bytes');
    console.log('   🔐 SHA1:', sha1);

    // Headers para upload
    const headers = {
      'Authorization': authData.authorizationToken,
      'X-Bz-File-Name': fileName,
      'Content-Type': 'text/plain',
      'Content-Length': testFile.size.toString(),
      'X-Bz-Content-Sha1': sha1,
      'X-Bz-Info-Author': 'teste-direto'
    };

    console.log('\n📋 Headers para upload:');
    Object.entries(headers).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });

    // Upload IMEDIATO
    console.log('\n🚀 Fazendo upload...');
    const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
      method: 'POST',
      headers,
      body: testFile
    });

    console.log('   📊 Status:', uploadResponse.status);
    console.log('   📊 Status Text:', uploadResponse.statusText);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.log('   ❌ Erro Response:', errorText);

      // Tentar com token renovado
      console.log('\n🔄 TENTANDO COM TOKEN RENOVADO...');

      const newAuthResponse = await fetch(authUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${authString}`
        }
      });

      if (newAuthResponse.ok) {
        const newAuthData = await newAuthResponse.json();
        console.log('   ✅ Nova autenticação OK');

        // Tentar upload com novo token
        const newHeaders = { ...headers };
        newHeaders['Authorization'] = newAuthData.authorizationToken;

        console.log('   🔑 Novo token:', newAuthData.authorizationToken ? '✅ Válido' : '❌ Inválido');

        const retryResponse = await fetch(uploadUrlData.uploadUrl, {
          method: 'POST',
          headers: newHeaders,
          body: testFile
        });

        console.log('   📊 Retry Status:', retryResponse.status);

        if (retryResponse.ok) {
          const retryResult = await retryResponse.json();
          console.log('   ✅ Upload com novo token OK!');
          console.log('   🆔 File ID:', retryResult.fileId);

          // Limpar arquivo
          console.log('\n🧹 Limpando arquivo...');
          const deleteResponse = await fetch(`${newAuthData.apiUrl}/b2api/v2/b2_delete_file_version`, {
            method: 'POST',
            headers: {
              'Authorization': newAuthData.authorizationToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fileId: retryResult.fileId,
              fileName: retryResult.fileName
            })
          });

          if (deleteResponse.ok) {
            console.log('   ✅ Arquivo removido!');
          }
        } else {
          const retryError = await retryResponse.text();
          console.log('   ❌ Retry falhou:', retryError);
        }
      }

      throw new Error(`Upload falhou: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('   ✅ Upload OK!');
    console.log('   🆔 File ID:', uploadResult.fileId);

  } catch (error) {
    console.log('\n❌ ERRO:', error.message);
  }
}

testeUploadDireto().then(() => {
  console.log('\n🏁 Teste de upload direto concluído!');
});
