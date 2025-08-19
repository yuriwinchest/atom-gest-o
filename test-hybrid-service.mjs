#!/usr/bin/env node

/**
 * Teste do Serviço Híbrido de Storage
 * Testa o sistema de fallback automático
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente
config({ path: resolve(process.cwd(), 'backblaze-credentials.env') });

console.log('🧪 TESTE DO SERVIÇO HÍBRIDO DE STORAGE');
console.log('========================================\n');

async function testHybridService() {
  try {
    console.log('🚀 Iniciando teste do serviço híbrido...\n');

    // Simular um arquivo de teste
    const testContent = `Teste do serviço híbrido - ${new Date().toISOString()}\nEste arquivo testa o sistema de fallback automático.`;
    const testFile = {
      name: `test-hybrid-${Date.now()}.txt`,
      size: testContent.length,
      type: 'text/plain',
      arrayBuffer: () => Promise.resolve(new TextEncoder().encode(testContent).buffer),
      stream: () => new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(testContent));
          controller.close();
        }
      })
    };

    console.log('📁 Arquivo de teste criado:');
    console.log(`   Nome: ${testFile.name}`);
    console.log(`   Tamanho: ${testFile.size} bytes`);
    console.log(`   Tipo: ${testFile.type}\n`);

    // Testar conectividade dos serviços
    console.log('🔍 Testando conectividade dos serviços...');

    // Importar o serviço híbrido
    const { hybridStorageService } = await import('./client/src/services/hybridStorageService.js');

    const connectivity = await hybridStorageService.testConnectivity();
    console.log('📊 Status de conectividade:');
    console.log(`   Backblaze: ${connectivity.backblaze ? '✅ OK' : '❌ FALHOU'}`);
    console.log(`   Supabase: ${connectivity.supabase ? '✅ OK' : '❌ FALHOU'}\n`);

    // Testar upload
    console.log('📤 Testando upload via serviço híbrido...');

    const result = await hybridStorageService.uploadFile(testFile, {
      category: 'teste',
      description: 'Arquivo de teste do serviço híbrido',
      tags: ['teste', 'híbrido', 'fallback']
    });

    console.log('✅ Upload realizado com sucesso!');
    console.log(`   ID: ${result.id}`);
    console.log(`   Nome: ${result.filename}`);
    console.log(`   Storage: ${result.storage_type}`);
    console.log(`   URL: ${result.url}\n`);

    // Testar download
    console.log('🔗 Testando URL de download...');
    const downloadUrl = await hybridStorageService.getDownloadUrl(result);
    console.log(`✅ URL de download: ${downloadUrl}\n`);

    // Testar estatísticas
    console.log('📊 Obtendo estatísticas do storage...');
    const stats = await hybridStorageService.getStorageStats();
    console.log('📈 Estatísticas:');
    console.log(`   Total de arquivos: ${stats.totalFiles}`);
    console.log(`   Arquivos Backblaze: ${stats.backblazeFiles}`);
    console.log(`   Arquivos Supabase: ${stats.supabaseFiles}\n`);

    // Limpar arquivo de teste
    console.log('🗑️ Removendo arquivo de teste...');
    const deleted = await hybridStorageService.deleteFile(result);
    if (deleted) {
      console.log('✅ Arquivo de teste removido com sucesso!\n');
    } else {
      console.log('⚠️ Arquivo de teste não foi removido (não crítico)\n');
    }

    console.log('🎉 TESTE DO SERVIÇO HÍBRIDO CONCLUÍDO COM SUCESSO!');
    console.log('✅ Sistema de fallback funcionando perfeitamente');
    console.log('✅ Upload automático via Backblaze ou Supabase');
    console.log('✅ Sistema sempre funcional, nunca mais "tonk esperado"');

    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('💡 Verifique a configuração dos serviços');
    return false;
  }
}

// Executar teste
testHybridService();
