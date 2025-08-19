#!/usr/bin/env node
import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis do arquivo específico
config({ path: resolve(process.cwd(), 'backblaze-credentials.env') });

console.log('🔍 VERIFICAÇÃO ESPECÍFICA DO BUCKET BACKBLAZE B2\n');

async function verificarBucket() {
  try {
    // 1. Configurações
    const accountId = process.env.BACKBLAZE_B2_ACCOUNT_ID;
    const keyId = process.env.BACKBLAZE_B2_APPLICATION_KEY_ID;
    const appKey = process.env.BACKBLAZE_B2_APPLICATION_KEY;
    const bucketName = process.env.BACKBLAZE_B2_BUCKET_NAME;
    const bucketId = process.env.BACKBLAZE_B2_BUCKET_ID;

    console.log('🔑 Configurações:');
    console.log('   Account ID:', accountId);
    console.log('   Key ID:', keyId);
    console.log('   App Key:', appKey ? '✅ CONFIGURADA' : '❌ NÃO CONFIGURADA');
    console.log('   Bucket Name:', bucketName);
    console.log('   Bucket ID:', bucketId);

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

    // 3. VERIFICAR BUCKETS DISPONÍVEIS
    console.log('\n🪣 2. VERIFICANDO BUCKETS DISPONÍVEIS...');

    if (authData.allowed && authData.allowed.buckets) {
      console.log('   📋 Buckets disponíveis para esta chave:');
      authData.allowed.buckets.forEach((bucket, index) => {
        console.log(`   ${index + 1}. Nome: ${bucket.bucketName}`);
        console.log(`      ID: ${bucket.bucketId}`);
        console.log(`      Tipo: ${bucket.bucketType}`);
        console.log(`      Permissões: ${bucket.capabilities.join(', ')}`);
        console.log('');
      });

      // Verificar se nosso bucket está na lista
      const nossoBucket = authData.allowed.buckets.find(b => b.bucketName === bucketName);
      if (nossoBucket) {
        console.log('   ✅ NOSSO BUCKET ENCONTRADO!');
        console.log('   🆔 Bucket ID da API:', nossoBucket.bucketId);
        console.log('   🆔 Bucket ID do .env:', bucketId);

        if (nossoBucket.bucketId === bucketId) {
          console.log('   ✅ Bucket ID confere perfeitamente!');
        } else {
          console.log('   ⚠️ Bucket ID DIFERENTE!');
          console.log('   🔧 ATUALIZAR BACKBLAZE_B2_BUCKET_ID para:', nossoBucket.bucketId);
        }

        // Verificar permissões específicas do bucket
        console.log('   🔐 Permissões específicas do bucket:');
        nossoBucket.capabilities.forEach(cap => {
          console.log(`      ✅ ${cap}`);
        });

        // Verificar se tem permissão de upload
        if (nossoBucket.capabilities.includes('writeFiles')) {
          console.log('   ✅ Permissão de upload confirmada!');
        } else {
          console.log('   ❌ SEM PERMISSÃO DE UPLOAD!');
        }

      } else {
        console.log('   ❌ NOSSO BUCKET NÃO ESTÁ NA LISTA!');
        console.log('   🔧 Verificar nome do bucket ou permissões da chave');
      }
    }

    // 4. VERIFICAR PERMISSÕES GERAIS DA CHAVE
    console.log('\n🔐 3. VERIFICANDO PERMISSÕES GERAIS DA CHAVE...');

    if (authData.allowed && authData.allowed.capabilities) {
      const capabilities = authData.allowed.capabilities;
      console.log('   📋 Permissões gerais da chave:');

      const requiredCapabilities = ['writeFiles', 'readFiles', 'deleteFiles', 'listFiles'];
      requiredCapabilities.forEach(cap => {
        if (capabilities.includes(cap)) {
          console.log(`   ✅ ${cap}`);
        } else {
          console.log(`   ❌ ${cap} - PERMISSÃO NECESSÁRIA!`);
        }
      });
    }

    // 5. TESTE DE LISTAGEM DE ARQUIVOS (para verificar acesso ao bucket)
    console.log('\n📁 4. TESTANDO ACESSO AO BUCKET...');

    try {
      const listFilesResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_list_file_names`, {
        method: 'POST',
        headers: {
          'Authorization': authData.authorizationToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bucketId: bucketId,
          maxFileCount: 1
        })
      });

      if (listFilesResponse.ok) {
        const listResult = await listFilesResponse.json();
        console.log('   ✅ Acesso ao bucket confirmado!');
        console.log('   📊 Arquivos no bucket:', listResult.files ? listResult.files.length : 0);
      } else {
        const errorText = await listFilesResponse.text();
        console.log('   ❌ Erro ao acessar bucket:', listFilesResponse.status);
        console.log('   📋 Erro:', errorText);
      }
    } catch (error) {
      console.log('   ❌ Erro ao testar acesso ao bucket:', error.message);
    }

    // 6. VERIFICAR SE O BUCKET EXISTE
    console.log('\n🔍 5. VERIFICANDO EXISTÊNCIA DO BUCKET...');

    try {
      const bucketInfoResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_get_bucket`, {
        method: 'POST',
        headers: {
          'Authorization': authData.authorizationToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bucketId: bucketId
        })
      });

      if (bucketInfoResponse.ok) {
        const bucketInfo = await bucketInfoResponse.json();
        console.log('   ✅ Bucket existe e é acessível!');
        console.log('   📋 Informações do bucket:');
        console.log(`      Nome: ${bucketInfo.bucketName}`);
        console.log(`      ID: ${bucketInfo.bucketId}`);
        console.log(`      Tipo: ${bucketInfo.bucketType}`);
        console.log(`      Criado em: ${bucketInfo.bucketInfo ? bucketInfo.bucketInfo.created : 'N/A'}`);
      } else {
        const errorText = await bucketInfoResponse.text();
        console.log('   ❌ Erro ao obter informações do bucket:', bucketInfoResponse.status);
        console.log('   📋 Erro:', errorText);
      }
    } catch (error) {
      console.log('   ❌ Erro ao verificar bucket:', error.message);
    }

  } catch (error) {
    console.log('\n❌ ERRO:', error.message);
  }
}

verificarBucket().then(() => {
  console.log('\n🏁 Verificação do bucket concluída!');
});
