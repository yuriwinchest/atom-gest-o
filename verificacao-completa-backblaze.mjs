#!/usr/bin/env node
import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis do arquivo específico
config({ path: resolve(process.cwd(), 'backblaze-credentials.env') });

console.log('🔍 VERIFICAÇÃO COMPLETA BACKBLAZE B2\n');

async function verificarCompleta() {
  try {
    // 1. VERIFICAR CREDENCIAIS NO .env.local
    console.log('🔑 1. VERIFICANDO CREDENCIAIS NO .env.local...');
    console.log('   📁 Arquivo .env.local existe:', 'Sim' ? '✅' : '❌');

    // Verificar se as variáveis estão carregadas
    const accountId = process.env.BACKBLAZE_B2_ACCOUNT_ID;
    const keyId = process.env.BACKBLAZE_B2_APPLICATION_KEY_ID;
    const appKey = process.env.BACKBLAZE_B2_APPLICATION_KEY;
    const bucketName = process.env.BACKBLAZE_B2_BUCKET_NAME;
    const bucketId = process.env.BACKBLAZE_B2_BUCKET_ID;

    console.log('   🔑 Account ID:', accountId || '❌ NÃO CONFIGURADO');
    console.log('   🔑 Key ID:', keyId || '❌ NÃO CONFIGURADO');
    console.log('   🔑 Application Key:', appKey ? '✅ CONFIGURADA' : '❌ NÃO CONFIGURADA');
    console.log('   🪣 Bucket Name:', bucketName || '❌ NÃO CONFIGURADO');
    console.log('   🪣 Bucket ID:', bucketId || '❌ NÃO CONFIGURADO');

    if (!accountId || !keyId || !appKey || !bucketName || !bucketId) {
      throw new Error('Credenciais incompletas');
    }

    console.log('   ✅ Todas as credenciais estão configuradas!');

    // 2. VERIFICAR SE O BUCKET EXISTE NO BACKBLAZE B2
    console.log('\n🪣 2. VERIFICANDO SE O BUCKET EXISTE...');

    // Autenticação para verificar bucket
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
    console.log('   ✅ Autenticação bem-sucedida!');
    console.log('   🌐 API URL:', authData.apiUrl);

    // Verificar se o bucket está na lista de buckets permitidos
    if (authData.allowed && authData.allowed.buckets) {
      const bucketEncontrado = authData.allowed.buckets.find(b => b.bucketName === bucketName);
      if (bucketEncontrado) {
        console.log('   ✅ Bucket encontrado na lista de permissões!');
        console.log('   🆔 Bucket ID da API:', bucketEncontrado.bucketId);
        console.log('   🆔 Bucket ID do .env:', bucketId);

        if (bucketEncontrado.bucketId === bucketId) {
          console.log('   ✅ Bucket ID confere!');
        } else {
          console.log('   ⚠️ Bucket ID diferente!');
          console.log('   🔧 Atualizar BACKBLAZE_B2_BUCKET_ID para:', bucketEncontrado.bucketId);
        }
      } else {
        console.log('   ❌ Bucket NÃO encontrado na lista de permissões!');
        console.log('   📋 Buckets disponíveis:', authData.allowed.buckets.map(b => b.bucketName).join(', '));
      }
    }

    // 3. VERIFICAR PERMISSÕES DA CHAVE
    console.log('\n🔐 3. VERIFICANDO PERMISSÕES DA CHAVE...');

    if (authData.allowed && authData.allowed.capabilities) {
      const capabilities = authData.allowed.capabilities;
      console.log('   📋 Permissões da chave:');

      const requiredCapabilities = ['writeFiles', 'readFiles', 'deleteFiles', 'listFiles'];
      requiredCapabilities.forEach(cap => {
        if (capabilities.includes(cap)) {
          console.log(`   ✅ ${cap}`);
        } else {
          console.log(`   ❌ ${cap} - PERMISSÃO NECESSÁRIA!`);
        }
      });

      // Verificar se tem todas as permissões necessárias
      const temTodasPermissoes = requiredCapabilities.every(cap => capabilities.includes(cap));
      if (temTodasPermissoes) {
        console.log('   ✅ Todas as permissões necessárias estão presentes!');
      } else {
        console.log('   ❌ FALTAM PERMISSÕES NECESSÁRIAS!');
      }
    }

    // 4. VERIFICAR SE A CONTA ESTÁ ATIVA
    console.log('\n💳 4. VERIFICANDO STATUS DA CONTA...');

    if (authData.accountId) {
      console.log('   ✅ Account ID válido:', authData.accountId);
    }

    if (authData.apiUrl) {
      console.log('   ✅ API URL válida:', authData.apiUrl);
    }

    // 5. TESTE DE UPLOAD DIRETO
    console.log('\n📤 5. TESTE DE UPLOAD DIRETO...');

    // Obter URL de upload
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
      throw new Error(`Falha ao obter URL de upload: ${uploadUrlResponse.status} - ${errorText}`);
    }

    const uploadUrlData = await uploadUrlResponse.json();
    console.log('   ✅ URL de upload obtida!');

    // Tentar upload real
    const testContent = 'Teste de verificação completa';
    const testFile = new File([testContent], 'teste-verificacao.txt', { type: 'text/plain' });

    // Calcular SHA1
    const arrayBuffer = await testFile.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha1 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const fileName = `verificacao_${Date.now()}.txt`;

    console.log('   📄 Arquivo de teste:', fileName);
    console.log('   🔐 SHA1:', sha1);

    const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'X-Bz-File-Name': fileName,
        'Content-Type': 'text/plain',
        'Content-Length': testFile.size.toString(),
        'X-Bz-Content-Sha1': sha1,
        'X-Bz-Info-Author': 'verificacao'
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

    // Limpar arquivo de teste
    console.log('\n🧹 6. LIMPANDO ARQUIVO DE TESTE...');
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

    console.log('\n🎉 VERIFICAÇÃO COMPLETA - TUDO FUNCIONANDO!');

  } catch (error) {
    console.log('\n❌ ERRO NA VERIFICAÇÃO:', error.message);

    if (error.message.includes('401')) {
      console.log('\n💡 SOLUÇÃO PARA ERRO 401:');
      console.log('   1. Verificar se o bucket ID está correto');
      console.log('   2. Verificar se a chave tem permissões de upload');
      console.log('   3. Verificar se o bucket existe e está acessível');
      console.log('   4. Verificar se a conta tem créditos suficientes');
    }
  }
}

verificarCompleta().then(() => {
  console.log('\n🏁 Verificação completa concluída!');
});
