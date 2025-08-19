#!/usr/bin/env node
import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis do arquivo específico
config({ path: resolve(process.cwd(), 'backblaze-credentials.env') });

console.log('🔑 CRIANDO NOVA CHAVE ESPECÍFICA BACKBLAZE B2\n');

async function criarNovaChave() {
  try {
    // 1. Configurações
    const accountId = process.env.BACKBLAZE_B2_ACCOUNT_ID;
    const bucketName = process.env.BACKBLAZE_B2_BUCKET_NAME;

    console.log('🔑 Configurações:');
    console.log('   Account ID:', accountId);
    console.log('   Bucket Name:', bucketName);

    console.log('\n⚠️ ATENÇÃO IMPORTANTE:');
    console.log('   Para criar uma nova chave, você precisa:');
    console.log('   1. Acessar o painel do Backblaze B2');
    console.log('   2. Ir em "App Keys"');
    console.log('   3. Clicar em "Add a New Application Key"');
    console.log('   4. Configurar as permissões específicas');

    console.log('\n🔧 CONFIGURAÇÃO RECOMENDADA PARA NOVA CHAVE:');
    console.log('   Key Name: atom-gestao-documentos');
    console.log('   Bucket: gestao-documentos (específico)');
    console.log('   Permissões:');
    console.log('     ✅ writeFiles (upload)');
    console.log('     ✅ readFiles (download)');
    console.log('     ✅ deleteFiles (remoção)');
    console.log('     ✅ listFiles (listagem)');
    console.log('     ✅ shareFiles (compartilhamento)');

    console.log('\n📋 PASSOS NO PAINEL BACKBLAZE:');
    console.log('   1. Acesse: https://secure.backblaze.com/app_keys.htm');
    console.log('   2. Faça login na sua conta');
    console.log('   3. Clique em "Add a New Application Key"');
    console.log('   4. Configure:');
    console.log('      - Key Name: atom-gestao-documentos');
    console.log('      - Bucket: gestao-documentos');
    console.log('      - Permissões: writeFiles, readFiles, deleteFiles, listFiles, shareFiles');
    console.log('   5. Clique em "Create New Key"');
    console.log('   6. Copie a nova chave e Key ID');

    console.log('\n💡 ALTERNATIVA TEMPORÁRIA:');
    console.log('   Se não conseguir criar nova chave agora, você pode:');
    console.log('   1. Usar a chave atual temporariamente');
    console.log('   2. Criar um bucket de teste');
    console.log('   3. Testar o upload com bucket de teste');

    // 2. VERIFICAR SE EXISTE BUCKET DE TESTE
    console.log('\n🧪 VERIFICANDO BUCKETS DISPONÍVEIS...');

    // Tentar com a chave atual para ver buckets
    const keyId = '005701ac3f649650000000002';
    const appKey = process.env.BACKBLAZE_B2_APPLICATION_KEY;

    if (appKey) {
      try {
        const authUrl = 'https://api002.backblazeb2.com/b2api/v2/b2_authorize_account';
        const authString = btoa(`${keyId}:${appKey}`);

        const authResponse = await fetch(authUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${authString}`
          }
        });

        if (authResponse.ok) {
          const authData = await authResponse.json();
          console.log('   ✅ Autenticação OK');

          if (authData.allowed && authData.allowed.buckets) {
            console.log(`   🪣 Buckets disponíveis: ${authData.allowed.buckets.length}`);
            authData.allowed.buckets.forEach(b => {
              console.log(`      - ${b.bucketName} (${b.bucketId})`);
            });

            if (authData.allowed.buckets.length === 0) {
              console.log('\n🔧 SOLUÇÃO IMEDIATA:');
              console.log('   1. Criar bucket de teste no painel Backblaze');
              console.log('   2. Dar permissão para esta chave');
              console.log('   3. Testar upload com bucket de teste');
            }
          }
        }
      } catch (error) {
        console.log('   ❌ Erro ao verificar buckets:', error.message);
      }
    }

    // 3. INSTRUÇÕES FINAIS
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('   1. Criar nova chave específica no painel Backblaze');
    console.log('   2. Configurar permissões para o bucket gestao-documentos');
    console.log('   3. Atualizar .env com nova chave');
    console.log('   4. Testar upload novamente');

    console.log('\n📞 SE PRECISAR DE AJUDA:');
    console.log('   - Documentação: https://www.backblaze.com/b2/docs/');
    console.log('   - Suporte: https://help.backblaze.com/');

  } catch (error) {
    console.log('\n❌ ERRO:', error.message);
  }
}

criarNovaChave().then(() => {
  console.log('\n🏁 Instruções para nova chave concluídas!');
});
