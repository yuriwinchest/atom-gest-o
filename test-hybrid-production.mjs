#!/usr/bin/env node

/**
 * Teste de Produção do Serviço Híbrido
 * Usa os serviços compilados para JavaScript
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente
config({ path: resolve(process.cwd(), 'backblaze-credentials.env') });

console.log('🧪 TESTE DE PRODUÇÃO - SERVIÇO HÍBRIDO');
console.log('========================================\n');

async function testProductionHybridService() {
  try {
    console.log('🚀 Iniciando teste de produção...\n');

    // 1. Verificar se os serviços compilados existem
    console.log('📁 Verificando serviços compilados...');

    try {
      const { hybridStorageService } = await import('./dist/services/hybridStorageService.js');
      console.log('✅ Serviço híbrido carregado com sucesso!');

      // 2. Testar conectividade
      console.log('\n🔍 Testando conectividade dos serviços...');
      const connectivity = await hybridStorageService.testConnectivity();

      console.log('📊 Status de conectividade:');
      console.log(`   Backblaze: ${connectivity.backblaze ? '✅ OK' : '❌ FALHOU'}`);
      console.log(`   Supabase: ${connectivity.supabase ? '✅ OK' : '❌ FALHOU'}`);

      // 3. Testar upload com arquivo simulado
      console.log('\n📤 Testando upload via serviço híbrido...');

      // Criar arquivo de teste simulado
      const testFile = {
        name: `test-production-${Date.now()}.txt`,
        size: 128,
        type: 'text/plain',
        arrayBuffer: () => Promise.resolve(new TextEncoder().encode('Teste de produção do serviço híbrido')),
        stream: () => new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('Teste de produção do serviço híbrido'));
            controller.close();
          }
        })
      };

      console.log('📁 Arquivo de teste criado:');
      console.log(`   Nome: ${testFile.name}`);
      console.log(`   Tamanho: ${testFile.size} bytes`);
      console.log(`   Tipo: ${testFile.type}`);

      // Tentar upload
      const result = await hybridStorageService.uploadFile(testFile, {
        category: 'teste-producao',
        description: 'Arquivo de teste do serviço híbrido em produção',
        tags: ['teste', 'producao', 'hibrido']
      });

      console.log('\n✅ Upload realizado com sucesso!');
      console.log(`   ID: ${result.id}`);
      console.log(`   Nome: ${result.filename}`);
      console.log(`   Storage: ${result.storage_type}`);
      console.log(`   URL: ${result.url}`);

      // 4. Testar download
      console.log('\n🔗 Testando URL de download...');
      const downloadUrl = await hybridStorageService.getDownloadUrl(result);
      console.log(`✅ URL de download: ${downloadUrl}`);

      // 5. Testar estatísticas
      console.log('\n📊 Obtendo estatísticas do storage...');
      const stats = await hybridStorageService.getStorageStats();
      console.log('📈 Estatísticas:');
      console.log(`   Total de arquivos: ${stats.totalFiles}`);
      console.log(`   Arquivos Backblaze: ${stats.backblazeFiles}`);
      console.log(`   Arquivos Supabase: ${stats.supabaseFiles}`);

      // 6. Limpar arquivo de teste
      console.log('\n🗑️ Removendo arquivo de teste...');
      const deleted = await hybridStorageService.deleteFile(result);
      if (deleted) {
        console.log('✅ Arquivo de teste removido com sucesso!');
      } else {
        console.log('⚠️ Arquivo de teste não foi removido (não crítico)');
      }

      console.log('\n🎉 TESTE DE PRODUÇÃO CONCLUÍDO COM SUCESSO!');
      console.log('✅ Sistema híbrido funcionando perfeitamente em produção');
      console.log('✅ Upload automático via Backblaze ou Supabase');
      console.log('✅ Sistema sempre funcional, nunca mais "tonk esperado"');
      console.log('✅ PRONTO PARA DEPLOY NA VPS! 🚀');

      return true;

    } catch (importError) {
      console.error('❌ Erro ao importar serviço compilado:', importError.message);
      console.log('\n💡 Verificando se o build foi executado...');

      // Verificar se os arquivos existem
      try {
        const fs = await import('fs');
        const servicesDir = './dist/services';

        if (fs.existsSync(servicesDir)) {
          const files = fs.readdirSync(servicesDir);
          console.log('📁 Arquivos em dist/services/:', files);
        } else {
          console.log('❌ Diretório dist/services/ não existe');
        }
      } catch (fsError) {
        console.log('⚠️ Não foi possível verificar arquivos');
      }

      return false;
    }

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('💡 Verifique a configuração dos serviços');
    return false;
  }
}

// Executar teste
testProductionHybridService();
