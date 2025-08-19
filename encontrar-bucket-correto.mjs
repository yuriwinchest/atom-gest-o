#!/usr/bin/env node
import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis do arquivo específico
config({ path: resolve(process.cwd(), 'backblaze-credentials.env') });

console.log('🔍 ENCONTRANDO BUCKET ID CORRETO BACKBLAZE B2\n');

async function encontrarBucketCorreto() {
  try {
    // 1. Configurações
    const keyId = process.env.BACKBLAZE_B2_APPLICATION_KEY_ID;
    const appKey = process.env.BACKBLAZE_B2_APPLICATION_KEY;
    const bucketName = process.env.BACKBLAZE_B2_BUCKET_NAME;

    console.log('🔑 Configurações:');
    console.log('   Key ID:', keyId);
    console.log('   App Key:', appKey ? '✅ CONFIGURADA' : '❌ NÃO CONFIGURADA');
    console.log('   Bucket Name:', bucketName);

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

    // 3. LISTAR TODOS OS BUCKETS DISPONÍVEIS
    console.log('\n🪣 2. LISTANDO TODOS OS BUCKETS DISPONÍVEIS...');

    if (authData.allowed && authData.allowed.buckets) {
      console.log(`   📋 Total de buckets disponíveis: ${authData.allowed.buckets.length}`);
      console.log('');

      authData.allowed.buckets.forEach((bucket, index) => {
        console.log(`   ${index + 1}. Nome: ${bucket.bucketName}`);
        console.log(`      ID: ${bucket.bucketId}`);
        console.log(`      Tipo: ${bucket.bucketType}`);
        console.log(`      Permissões: ${bucket.capabilities.join(', ')}`);
        console.log('');
      });

      // 4. PROCURAR NOSSO BUCKET ESPECÍFICO
      console.log('🔍 3. PROCURANDO NOSSO BUCKET ESPECÍFICO...');

      const nossoBucket = authData.allowed.buckets.find(b => b.bucketName === bucketName);
      if (nossoBucket) {
        console.log('   ✅ BUCKET ENCONTRADO!');
        console.log('   📋 Detalhes completos:');
        console.log(`      Nome: ${nossoBucket.bucketName}`);
        console.log(`      ID: ${nossoBucket.bucketId}`);
        console.log(`      Tipo: ${nossoBucket.bucketType}`);
        console.log(`      Permissões: ${nossoBucket.capabilities.join(', ')}`);

        // 5. VERIFICAR SE TEM PERMISSÕES NECESSÁRIAS
        console.log('\n🔐 4. VERIFICANDO PERMISSÕES NECESSÁRIAS...');

        const requiredCapabilities = ['writeFiles', 'readFiles', 'deleteFiles', 'listFiles'];
        const temTodasPermissoes = requiredCapabilities.every(cap =>
          nossoBucket.capabilities.includes(cap)
        );

        if (temTodasPermissoes) {
          console.log('   ✅ TODAS AS PERMISSÕES NECESSÁRIAS ESTÃO PRESENTES!');
        } else {
          console.log('   ❌ FALTAM PERMISSÕES NECESSÁRIAS!');
          requiredCapabilities.forEach(cap => {
            if (nossoBucket.capabilities.includes(cap)) {
              console.log(`      ✅ ${cap}`);
            } else {
              console.log(`      ❌ ${cap} - PERMISSÃO NECESSÁRIA!`);
            }
          });
        }

        // 6. MOSTRAR CONFIGURAÇÃO CORRETA
        console.log('\n🔧 5. CONFIGURAÇÃO CORRETA PARA .env:');
        console.log('   BACKBLAZE_B2_BUCKET_ID=' + nossoBucket.bucketId);

        // 7. TESTAR ACESSO COM BUCKET ID CORRETO
        console.log('\n🧪 6. TESTANDO ACESSO COM BUCKET ID CORRETO...');

        try {
          const listFilesResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_list_file_names`, {
            method: 'POST',
            headers: {
              'Authorization': authData.authorizationToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              bucketId: nossoBucket.bucketId,
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
          console.log('   ❌ Erro ao testar acesso:', error.message);
        }

      } else {
        console.log('   ❌ BUCKET NÃO ENCONTRADO!');
        console.log('   🔍 Verificar se o nome está correto ou se a chave tem acesso');
        console.log('   📋 Nomes de buckets disponíveis:');
        authData.allowed.buckets.forEach(b => {
          console.log(`      - ${b.bucketName}`);
        });
      }
    } else {
      console.log('   ❌ Nenhum bucket disponível para esta chave!');
      console.log('   🔧 Verificar permissões da chave de aplicação');
    }

  } catch (error) {
    console.log('\n❌ ERRO:', error.message);
  }
}

encontrarBucketCorreto().then(() => {
  console.log('\n🏁 Busca do bucket correto concluída!');
});
