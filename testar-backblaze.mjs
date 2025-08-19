import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';
import { hybridStorageService } from './client/src/services/hybridStorageService.ts';

// Carregar variáveis do arquivo específico
config({ path: resolve(process.cwd(), 'backblaze-credentials.env') });

console.log('🔑 Testando conexão com Backblaze B2...\n');

async function testarBackblaze() {
  try {
    console.log('🧪 Testando upload de arquivo simples...');

    // Criar um arquivo de teste
    const testContent = 'Este é um arquivo de teste para verificar se o Backblaze B2 está funcionando.';
    const testFile = new File([testContent], 'teste-backblaze.txt', { type: 'text/plain' });

    console.log('📄 Arquivo de teste criado:', testFile.name);
    console.log('📊 Tamanho:', testFile.size, 'bytes');

    // Tentar fazer upload
    const result = await hybridStorageService.uploadFile(testFile, {
      category: 'teste',
      description: 'Arquivo de teste para verificar conexão',
      tags: ['teste', 'backblaze', 'conexao']
    });

    console.log('✅ Upload para Backblaze B2 realizado com sucesso!');
    console.log('📋 Detalhes do arquivo:');
    console.log('   ID:', result.id);
    console.log('   Nome:', result.filename);
    console.log('   Caminho:', result.file_path);
    console.log('   URL:', result.backblaze_url);
    console.log('   Tamanho:', result.file_size, 'bytes');
    console.log('   Tipo:', result.mime_type);

    // Testar download
    console.log('\n🔗 Testando URL de download...');
    const downloadUrl = await hybridStorageService.getDownloadUrl(result);
    console.log('✅ URL de download:', downloadUrl);

    // Limpar arquivo de teste
    console.log('\n🧹 Removendo arquivo de teste...');
    const deleted = await hybridStorageService.deleteFile(result);
    if (deleted) {
      console.log('✅ Arquivo de teste removido com sucesso!');
    } else {
      console.log('⚠️ Não foi possível remover o arquivo de teste');
    }

  } catch (error) {
    console.log('❌ Erro no teste do Backblaze B2:', error.message);
    console.log('\n💡 POSSÍVEIS SOLUÇÕES:');
    console.log('1. Verificar se as credenciais estão corretas no .env.local');
    console.log('2. Verificar se o bucket existe no Backblaze B2');
    console.log('3. Verificar se a chave de aplicação tem permissões corretas');
    console.log('4. Verificar se a conta está ativa e com créditos');
  }
}

testarBackblaze().then(() => {
  console.log('\n🏁 Teste do Backblaze B2 concluído!');
});
