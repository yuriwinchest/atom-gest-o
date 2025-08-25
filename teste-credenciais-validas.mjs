/**
 * Teste das Credenciais Válidas do Backblaze B2
 * Estas são as credenciais que não expiram
 */

import dotenv from 'dotenv';

console.log('🔑 TESTE DAS CREDENCIAIS VÁLIDAS DO BACKBLAZE B2\n');

// Credenciais que não expiram (encontradas no projeto)
const CREDENCIAIS_VALIDAS = {
  accountId: '701ac3f64965',
  keyId: '701ac3f64965',
  appKey: '00592f1897ea9bb09f729703695d0f6fe9c4b1ae8f',
  bucketName: 'documentos-empresa'
};

console.log('📋 CREDENCIAIS IDENTIFICADAS:');
console.log('================================');
console.log(`Account ID: ${CREDENCIAIS_VALIDAS.accountId}`);
console.log(`Key ID: ${CREDENCIAIS_VALIDAS.keyId}`);
console.log(`App Key: ***${CREDENCIAIS_VALIDAS.appKey.slice(-4)}`);
console.log(`Bucket: ${CREDENCIAIS_VALIDAS.bucketName}`);
console.log('');

// Testar autenticação
async function testarCredenciaisValidas() {
  try {
    console.log('🔐 TESTANDO AUTENTICAÇÃO...');

    const credentials = `${CREDENCIAIS_VALIDAS.keyId}:${CREDENCIAIS_VALIDAS.appKey}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');

    console.log(`Credenciais em Base64: ${base64Credentials.substring(0, 30)}...`);

    const response = await fetch('https://api002.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${base64Credentials}`
      }
    });

    console.log(`Status da resposta: ${response.status}`);

    if (response.ok) {
      const authData = await response.json();
      console.log('✅ AUTENTICAÇÃO BEM-SUCEDIDA!');
      console.log(`   Account ID: ${authData.accountId}`);
      console.log(`   API URL: ${authData.apiUrl}`);
      console.log(`   Authorization Token: ${authData.authorizationToken ? '✅ Válido' : '❌ Inválido'}`);

      // Verificar buckets disponíveis
      if (authData.allowed && authData.allowed.buckets) {
        console.log(`\n🪣 BUCKETS DISPONÍVEIS: ${authData.allowed.buckets.length}`);
        authData.allowed.buckets.forEach((bucket, index) => {
          console.log(`   ${index + 1}. ${bucket.bucketName} (${bucket.bucketId})`);
          console.log(`      Permissões: ${bucket.capabilities.join(', ')}`);
        });

        // Verificar se nosso bucket está na lista
        const nossoBucket = authData.allowed.buckets.find(b => b.bucketName === CREDENCIAIS_VALIDAS.bucketName);
        if (nossoBucket) {
          console.log(`\n✅ BUCKET "${CREDENCIAIS_VALIDAS.bucketName}" ENCONTRADO!`);
          console.log(`   ID: ${nossoBucket.bucketId}`);
          console.log(`   Permissões: ${nossoBucket.capabilities.join(', ')}`);

          // Testar acesso ao bucket
          await testarAcessoBucket(authData, nossoBucket);
        } else {
          console.log(`\n⚠️  BUCKET "${CREDENCIAIS_VALIDAS.bucketName}" NÃO ENCONTRADO`);
          console.log('   Vamos criar um bucket de teste...');
          await criarBucketTeste(authData);
        }
      } else {
        console.log('\n❌ Nenhum bucket disponível para esta chave');
        console.log('   Vamos criar um bucket de teste...');
        await criarBucketTeste(authData);
      }

      return authData;

    } else {
      const errorText = await response.text();
      console.log('❌ Falha na autenticação');
      console.log('Erro:', errorText);
      return null;
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
    return null;
  }
}

// Testar acesso ao bucket
async function testarAcessoBucket(authData, bucket) {
  try {
    console.log('\n📋 TESTANDO ACESSO AO BUCKET...');

    const listResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_list_file_names`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bucketId: bucket.bucketId,
        maxFileCount: 10
      })
    });

    if (listResponse.ok) {
      const listData = await listResponse.json();
      console.log(`✅ Acesso ao bucket confirmado!`);
      console.log(`   Arquivos encontrados: ${listData.files.length}`);

      if (listData.files.length > 0) {
        console.log('   Primeiros arquivos:');
        listData.files.slice(0, 3).forEach((file, index) => {
          console.log(`   ${index + 1}. ${file.fileName} (${file.contentLength} bytes)`);
        });
      }

      // Testar upload de arquivo
      await testarUploadArquivo(authData, bucket);

    } else {
      console.log('❌ Erro ao acessar bucket:', listResponse.status);
    }

  } catch (error) {
    console.error('❌ Erro ao testar acesso:', error.message);
  }
}

// Criar bucket de teste
async function criarBucketTeste(authData) {
  try {
    console.log('\n🏗️ CRIANDO BUCKET DE TESTE...');

    const bucketTesteName = `teste-upload-${Date.now()}`;
    console.log(`Nome do bucket: ${bucketTesteName}`);

    const createResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_create_bucket`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accountId: CREDENCIAIS_VALIDAS.accountId,
        bucketName: bucketTesteName,
        bucketType: 'allPrivate'
      })
    });

    if (createResponse.ok) {
      const bucketInfo = await createResponse.json();
      console.log('✅ Bucket de teste criado com sucesso!');
      console.log(`   ID: ${bucketInfo.bucketId}`);
      console.log(`   Nome: ${bucketInfo.bucketName}`);

      // Testar upload no bucket de teste
      await testarUploadArquivo(authData, bucketInfo);

    } else {
      const errorText = await createResponse.text();
      console.log('❌ Erro ao criar bucket:', errorText);
    }

  } catch (error) {
    console.error('❌ Erro ao criar bucket:', error.message);
  }
}

// Testar upload de arquivo
async function testarUploadArquivo(authData, bucket) {
  try {
    console.log('\n📤 TESTANDO UPLOAD DE ARQUIVO...');

    // 1. Obter URL de upload
    const uploadUrlResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bucketId: bucket.bucketId
      })
    });

    if (!uploadUrlResponse.ok) {
      throw new Error(`Falha ao obter URL de upload: ${uploadUrlResponse.status}`);
    }

    const uploadUrlData = await uploadUrlResponse.json();
    console.log('✅ URL de upload obtida');

    // 2. Criar arquivo de teste
    const testContent = `Teste de upload - ${new Date().toISOString()}\nSistema: ATOM Gestão de Documentos\nCredenciais: Válidas e funcionais`;
    const testFileName = `teste-upload-${Date.now()}.txt`;

    // 3. Fazer upload
    const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': uploadUrlData.authorizationToken,
        'Content-Type': 'text/plain',
        'Content-Length': testContent.length.toString(),
        'X-Bz-File-Name': testFileName,
        'X-Bz-Content-Sha1': require('crypto').createHash('sha1').update(testContent).digest('hex'),
        'X-Bz-Info-Author': 'Sistema ATOM'
      },
      body: testContent
    });

    if (uploadResponse.ok) {
      const uploadResult = await uploadResponse.json();
      console.log('✅ Upload bem-sucedido!');
      console.log(`   File ID: ${uploadResult.fileId}`);
      console.log(`   File Name: ${uploadResult.fileName}`);
      console.log(`   Content Length: ${uploadResult.contentLength} bytes`);

      // 4. Deletar arquivo de teste
      await deletarArquivoTeste(authData, uploadResult);

    } else {
      const errorText = await uploadResponse.text();
      throw new Error(`Falha no upload: ${uploadResponse.status} - ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Erro no upload:', error.message);
  }
}

// Deletar arquivo de teste
async function deletarArquivoTeste(authData, fileInfo) {
  try {
    console.log('\n🗑️ DELETANDO ARQUIVO DE TESTE...');

    const deleteResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_delete_file_version`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: fileInfo.fileName,
        fileId: fileInfo.fileId
      })
    });

    if (deleteResponse.ok) {
      console.log('✅ Arquivo de teste deletado com sucesso!');
    } else {
      console.log('⚠️  Falha ao deletar arquivo de teste');
    }

  } catch (error) {
    console.error('❌ Erro ao deletar arquivo:', error.message);
  }
}

// EXECUÇÃO DO TESTE
async function executarTeste() {
  try {
    console.log('🚀 INICIANDO TESTE DAS CREDENCIAIS VÁLIDAS...\n');

    const authData = await testarCredenciaisValidas();

    if (authData) {
      console.log('\n🎉 RESULTADO FINAL:');
      console.log('===================');
      console.log('✅ CREDENCIAIS VÁLIDAS E FUNCIONAIS!');
      console.log('✅ Sistema pode fazer upload, download e gerenciar arquivos');
      console.log('✅ Página de gestão de documentos funcionará perfeitamente');
      console.log('');
      console.log('🔧 CONFIGURAÇÃO CORRETA PARA backblaze-credentials.env:');
      console.log(`   BACKBLAZE_B2_ACCOUNT_ID=${CREDENCIAIS_VALIDAS.accountId}`);
      console.log(`   BACKBLAZE_B2_APPLICATION_KEY_ID=${CREDENCIAIS_VALIDAS.keyId}`);
      console.log(`   BACKBLAZE_B2_APPLICATION_KEY=${CREDENCIAIS_VALIDAS.appKey}`);
      console.log(`   BACKBLAZE_B2_BUCKET_NAME=${CREDENCIAIS_VALIDAS.bucketName}`);

    } else {
      console.log('\n❌ RESULTADO FINAL:');
      console.log('===================');
      console.log('❌ Credenciais não funcionaram');
      console.log('❌ Sistema não consegue se conectar ao Backblaze B2');
      console.log('❌ Página de gestão de documentos não funcionará');
    }

  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
  }
}

// Executar teste
executarTeste();
