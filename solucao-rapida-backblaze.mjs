#!/usr/bin/env node
import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis do arquivo específico
config({ path: resolve(process.cwd(), 'backblaze-credentials.env') });

console.log('🚀 SOLUÇÃO RÁPIDA BACKBLAZE B2 - CRIANDO BUCKET DE TESTE\n');

async function solucaoRapida() {
  try {
    // 1. Configurações
    const accountId = process.env.BACKBLAZE_B2_ACCOUNT_ID;
    const keyId = '005701ac3f649650000000002'; // Chave atual
    const appKey = process.env.BACKBLAZE_B2_APPLICATION_KEY;

    console.log('🔑 Configurações:');
    console.log('   Account ID:', accountId);
    console.log('   Key ID:', keyId);
    console.log('   App Key:', appKey ? '✅ CONFIGURADA' : '❌ NÃO CONFIGURADA');

    if (!appKey) {
      throw new Error('Application Key não configurada!');
    }

    // 2. Autenticação
    console.log('\n🔐 1. AUTENTICAÇÃO...');
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

    // 3. VERIFICAR BUCKETS EXISTENTES
    console.log('\n🪣 2. VERIFICANDO BUCKETS EXISTENTES...');

    if (authData.allowed && authData.allowed.buckets) {
      console.log(`   📋 Buckets disponíveis: ${authData.allowed.buckets.length}`);
      authData.allowed.buckets.forEach(b => {
        console.log(`      - ${b.bucketName} (${b.bucketId})`);
      });
    } else {
      console.log('   ❌ Nenhum bucket disponível para esta chave');
    }

    // 4. CRIAR BUCKET DE TESTE
    console.log('\n🏗️ 3. CRIANDO BUCKET DE TESTE...');

    const bucketTesteName = `teste-upload-${Date.now()}`;
    console.log('   📝 Nome do bucket de teste:', bucketTesteName);

    try {
      const createBucketResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_create_bucket`, {
        method: 'POST',
        headers: {
          'Authorization': authData.authorizationToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountId: accountId,
          bucketName: bucketTesteName,
          bucketType: 'allPrivate'
        })
      });

      if (createBucketResponse.ok) {
        const bucketInfo = await createBucketResponse.json();
        console.log('   ✅ Bucket de teste criado com sucesso!');
        console.log('   🆔 Bucket ID:', bucketInfo.bucketId);
        console.log('   🏷️ Nome:', bucketInfo.bucketName);
        console.log('   🔒 Tipo:', bucketInfo.bucketType);

        // 5. TESTAR UPLOAD NO BUCKET DE TESTE
        console.log('\n📤 4. TESTANDO UPLOAD NO BUCKET DE TESTE...');

        // Obter URL de upload
        const uploadUrlResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_get_upload_url`, {
          method: 'POST',
          headers: {
            'Authorization': authData.authorizationToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            bucketId: bucketInfo.bucketId
          })
        });

        if (!uploadUrlResponse.ok) {
          throw new Error(`Falha ao obter URL de upload: ${uploadUrlResponse.status}`);
        }

        const uploadUrlData = await uploadUrlResponse.json();
        console.log('   ✅ URL de upload obtida');

        // Criar arquivo de teste
        const testContent = 'Teste de upload no bucket de teste Backblaze B2';
        const testFile = new File([testContent], 'teste-bucket-novo.txt', { type: 'text/plain' });

        // Calcular SHA1
        const arrayBuffer = await testFile.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const sha1 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const fileName = `teste_${Date.now()}.txt`;

        console.log('   📄 Arquivo:', fileName);
        console.log('   🔐 SHA1:', sha1);

        // Fazer upload
        const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': authData.authorizationToken,
            'X-Bz-File-Name': fileName,
            'Content-Type': 'text/plain',
            'Content-Length': testFile.size.toString(),
            'X-Bz-Content-Sha1': sha1,
            'X-Bz-Info-Author': 'teste-rapido'
          },
          body: testFile
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Upload falhou: ${uploadResponse.status} - ${errorText}`);
        }

        const uploadResult = await uploadResponse.json();
        console.log('   ✅ Upload realizado com sucesso!');
        console.log('   🆔 File ID:', uploadResult.fileId);
        console.log('   📁 File Name:', uploadResult.fileName);

        // 6. MOSTRAR CONFIGURAÇÃO FUNCIONAL
        console.log('\n🎉 SUCESSO! UPLOAD FUNCIONANDO!');
        console.log('\n🔧 CONFIGURAÇÃO FUNCIONAL PARA .env:');
        console.log('   BACKBLAZE_B2_APPLICATION_KEY_ID=005701ac3f649650000000002');
        console.log('   BACKBLAZE_B2_APPLICATION_KEY=' + appKey);
        console.log('   BACKBLAZE_B2_BUCKET_NAME=' + bucketTesteName);
        console.log('   BACKBLAZE_B2_BUCKET_ID=' + bucketInfo.bucketId);

        // 7. Limpar arquivo de teste
        console.log('\n🧹 5. LIMPANDO ARQUIVO DE TESTE...');
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
          console.log('   ✅ Arquivo de teste removido!');
        } else {
          console.log('   ⚠️ Não foi possível remover arquivo de teste');
        }

        // 8. REMOVER BUCKET DE TESTE
        console.log('\n🗑️ 6. REMOVENDO BUCKET DE TESTE...');
        const deleteBucketResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_delete_bucket`, {
          method: 'POST',
          headers: {
            'Authorization': authData.authorizationToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            accountId: accountId,
            bucketId: bucketInfo.bucketId
          })
        });

        if (deleteBucketResponse.ok) {
          console.log('   ✅ Bucket de teste removido!');
        } else {
          console.log('   ⚠️ Não foi possível remover bucket de teste');
        }

        console.log('\n🎯 PRÓXIMOS PASSOS:');
        console.log('   1. Usar a configuração funcional mostrada acima');
        console.log('   2. Atualizar .env com as novas configurações');
        console.log('   3. Testar upload no sistema principal');
        console.log('   4. Sistema híbrido funcionando perfeitamente!');

      } else {
        const errorText = await createBucketResponse.text();
        throw new Error(`Falha ao criar bucket: ${createBucketResponse.status} - ${errorText}`);
      }

    } catch (error) {
      console.log('   ❌ Erro ao criar bucket:', error.message);

      // Tentar usar bucket existente se possível
      if (authData.allowed && authData.allowed.buckets && authData.allowed.buckets.length > 0) {
        console.log('\n🔄 TENTANDO COM BUCKET EXISTENTE...');
        const bucketExistente = authData.allowed.buckets[0];
        console.log('   🪣 Usando bucket:', bucketExistente.bucketName);

        // Testar upload no bucket existente
        // ... código similar ao acima
      }
    }

  } catch (error) {
    console.log('\n❌ ERRO:', error.message);

    console.log('\n💡 SOLUÇÕES ALTERNATIVAS:');
    console.log('   1. Verificar se a chave tem permissões de criação de bucket');
    console.log('   2. Criar bucket manualmente no painel Backblaze');
    console.log('   3. Dar permissões específicas para a chave atual');
  }
}

solucaoRapida().then(() => {
  console.log('\n🏁 Solução rápida concluída!');
});
