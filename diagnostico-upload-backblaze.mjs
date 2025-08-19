#!/usr/bin/env node
import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis do arquivo específico
config({ path: resolve(process.cwd(), 'backblaze-credentials.env') });

console.log('🔍 DIAGNÓSTICO COMPLETO DO UPLOAD BACKBLAZE B2\n');

// 1. Verificar variáveis
console.log('📋 1. VARIÁVEIS CARREGADAS:');
console.log('   Account ID:', process.env.BACKBLAZE_B2_ACCOUNT_ID);
console.log('   Key ID:', process.env.BACKBLAZE_B2_APPLICATION_KEY_ID);
console.log('   Application Key:', process.env.BACKBLAZE_B2_APPLICATION_KEY ? '✅ CONFIGURADA' : '❌ NÃO CONFIGURADA');
console.log('   Bucket Name:', process.env.BACKBLAZE_B2_BUCKET_NAME);
console.log('   Bucket ID:', process.env.BACKBLAZE_B2_BUCKET_ID);

// 2. Testar autenticação completa
console.log('\n🔐 2. TESTANDO AUTENTICAÇÃO COMPLETA:');
try {
    const accountId = process.env.BACKBLAZE_B2_ACCOUNT_ID;
    const keyId = process.env.BACKBLAZE_B2_APPLICATION_KEY_ID;
    const appKey = process.env.BACKBLAZE_B2_APPLICATION_KEY;

    if (!accountId || !keyId || !appKey) {
        throw new Error('Credenciais incompletas');
    }

    // Autenticação
    const authUrl = 'https://api002.backblazeb2.com/b2api/v2/b2_authorize_account';
    const authString = btoa(`${keyId}:${appKey}`);

    console.log('   🔗 Fazendo autenticação...');
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
    console.log('   📊 API URL:', authData.apiUrl);
    console.log('   🔑 Token:', authData.authorizationToken ? '✅ Válido' : '❌ Inválido');

    // 3. Testar obtenção de URL de upload
    console.log('\n🌐 3. TESTANDO OBTER URL DE UPLOAD:');
    const bucketId = process.env.BACKBLAZE_B2_BUCKET_ID;

    if (!bucketId) {
        throw new Error('Bucket ID não configurado');
    }

    console.log('   🪣 Bucket ID:', bucketId);

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
    console.log('   🔗 Upload URL:', uploadUrlData.uploadUrl);

    // 4. Testar upload real
    console.log('\n📤 4. TESTANDO UPLOAD REAL:');

    // Criar arquivo de teste
    const testContent = 'Teste de upload Backblaze B2';
    const testFile = new File([testContent], 'teste-upload.txt', { type: 'text/plain' });

    // Calcular SHA1
    const arrayBuffer = await testFile.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha1 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('   📄 Arquivo:', testFile.name);
    console.log('   📊 Tamanho:', testFile.size, 'bytes');
    console.log('   🔐 SHA1:', sha1);

    // Fazer upload
    const fileName = `teste_${Date.now()}.txt`;
    const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
        method: 'POST',
        headers: {
            'Authorization': authData.authorizationToken,
            'X-Bz-File-Name': fileName,
            'Content-Type': 'text/plain',
            'Content-Length': testFile.size.toString(),
            'X-Bz-Content-Sha1': sha1,
            'X-Bz-Info-Author': 'teste'
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

    // 5. Limpar arquivo de teste
    console.log('\n🧹 5. LIMPANDO ARQUIVO DE TESTE:');
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

    console.log('\n🎉 DIAGNÓSTICO COMPLETO - TUDO FUNCIONANDO!');

} catch (error) {
    console.log('\n❌ ERRO NO DIAGNÓSTICO:', error.message);

    if (error.message.includes('401')) {
        console.log('\n💡 SOLUÇÃO PARA ERRO 401:');
        console.log('   1. Verificar se o bucket ID está correto');
        console.log('   2. Verificar se a chave tem permissões de upload');
        console.log('   3. Verificar se o bucket existe e está acessível');
        console.log('   4. Verificar se a conta tem créditos suficientes');
    }
}

console.log('\n🏁 Diagnóstico concluído!');
