#!/usr/bin/env node
import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis do arquivo específico
config({ path: resolve(process.cwd(), 'backblaze-credentials.env') });

console.log('🔑 TESTANDO TODAS AS CHAVES BACKBLAZE B2\n');

async function testarTodasChaves() {
  try {
    // 1. Configurações atuais
    const accountId = process.env.BACKBLAZE_B2_ACCOUNT_ID;
    const bucketName = process.env.BACKBLAZE_B2_BUCKET_NAME;

    console.log('🔑 Configurações:');
    console.log('   Account ID:', accountId);
    console.log('   Bucket Name:', bucketName);

    // 2. TESTAR CHAVE ATUAL (que não funciona)
    console.log('\n🔐 1. TESTANDO CHAVE ATUAL (005701ac3f649650000000002)...');

    const keyId1 = '005701ac3f649650000000002';
    const appKey1 = process.env.BACKBLAZE_B2_APPLICATION_KEY;

    if (appKey1) {
      try {
        const authUrl = 'https://api002.backblazeb2.com/b2api/v2/b2_authorize_account';
        const authString = btoa(`${keyId1}:${appKey1}`);

        const authResponse = await fetch(authUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${authString}`
          }
        });

        if (authResponse.ok) {
          const authData = await authResponse.json();
          console.log('   ✅ Autenticação OK');
          console.log('   🌐 API URL:', authData.apiUrl);

          if (authData.allowed && authData.allowed.buckets) {
            console.log(`   🪣 Buckets disponíveis: ${authData.allowed.buckets.length}`);
            authData.allowed.buckets.forEach(b => {
              console.log(`      - ${b.bucketName} (${b.bucketId})`);
            });
          } else {
            console.log('   ❌ Nenhum bucket disponível');
          }
        } else {
          console.log('   ❌ Autenticação falhou:', authResponse.status);
        }
      } catch (error) {
        console.log('   ❌ Erro:', error.message);
      }
    } else {
      console.log('   ❌ App Key não configurada');
    }

    // 3. TESTAR CHAVE MESTRA (que deve funcionar)
    console.log('\n🔐 2. TESTANDO CHAVE MESTRA (701ac3f64965)...');

    const keyId2 = '701ac3f64965';
    const appKey2 = 'K005Y/sugbqNPV2GkztktzOvSumBM+k'; // Chave mestra

    try {
      const authUrl = 'https://api002.backblazeb2.com/b2api/v2/b2_authorize_account';
      const authString = btoa(`${keyId2}:${appKey2}`);

      const authResponse = await fetch(authUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${authString}`
        }
      });

      if (authResponse.ok) {
        const authData = await authResponse.json();
        console.log('   ✅ Autenticação OK');
        console.log('   🌐 API URL:', authData.apiUrl);

        if (authData.allowed && authData.allowed.buckets) {
          console.log(`   🪣 Buckets disponíveis: ${authData.allowed.buckets.length}`);
          authData.allowed.buckets.forEach(b => {
            console.log(`      - ${b.bucketName} (${b.bucketId})`);
          });

          // Verificar se nosso bucket está na lista
          const nossoBucket = authData.allowed.buckets.find(b => b.bucketName === bucketName);
          if (nossoBucket) {
            console.log('   ✅ NOSSO BUCKET ENCONTRADO!');
            console.log('   🆔 Bucket ID correto:', nossoBucket.bucketId);
            console.log('   🔐 Permissões:', nossoBucket.capabilities.join(', '));

            // Testar acesso
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
                console.log('   ✅ Acesso ao bucket confirmado!');

                // Mostrar configuração correta
                console.log('\n🔧 CONFIGURAÇÃO CORRETA PARA .env:');
                console.log('   BACKBLAZE_B2_APPLICATION_KEY_ID=701ac3f64965');
                console.log('   BACKBLAZE_B2_APPLICATION_KEY=K005Y/sugbqNPV2GkztktzOvSumBM+k');
                console.log('   BACKBLAZE_B2_BUCKET_ID=' + nossoBucket.bucketId);

              } else {
                console.log('   ❌ Erro ao acessar bucket:', listFilesResponse.status);
              }
            } catch (error) {
              console.log('   ❌ Erro ao testar acesso:', error.message);
            }
          } else {
            console.log('   ❌ Nosso bucket não encontrado');
          }
        } else {
          console.log('   ❌ Nenhum bucket disponível');
        }
      } else {
        console.log('   ❌ Autenticação falhou:', authResponse.status);
      }
    } catch (error) {
      console.log('   ❌ Erro:', error.message);
    }

    // 4. RECOMENDAÇÕES
    console.log('\n💡 RECOMENDAÇÕES:');
    console.log('   1. Se a chave mestra funcionar, use ela temporariamente');
    console.log('   2. Crie uma nova chave específica para o bucket');
    console.log('   3. Configure as permissões corretas');

  } catch (error) {
    console.log('\n❌ ERRO:', error.message);
  }
}

testarTodasChaves().then(() => {
  console.log('\n🏁 Teste de todas as chaves concluído!');
});
