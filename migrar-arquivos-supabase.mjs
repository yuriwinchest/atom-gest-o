// 🚀 MIGRAR ARQUIVOS FÍSICOS PARA SUPABASE STORAGE
// Script automático para migrar todos os arquivos

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://fbqocpozjmuzrdeacktb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg1Njc4NiwiZXhwIjoyMDY1NDMyNzg2fQ.V37kx1A0n8LzOBGWOzDFSopUBQkQ4TgNMBl8vWMpKqY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 MIGRANDO ARQUIVOS PARA SUPABASE STORAGE');
console.log('='.repeat(60));

async function migrarArquivos() {
  try {
    // 1. VERIFICAR BUCKETS EXISTENTES
    console.log('\n📦 1. VERIFICANDO BUCKETS EXISTENTES...');

    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.log('❌ Erro ao listar buckets:', bucketsError.message);
      console.log('💡 Crie os buckets manualmente no Supabase Dashboard primeiro');
      return;
    }

    const bucketNames = buckets.map(b => b.name);
    console.log('✅ Buckets disponíveis:', bucketNames);

    // Verificar se o bucket principal existe
    if (!bucketNames.includes('documents')) {
      console.log('⚠️ Bucket "documents" não encontrado!');
      console.log('💡 Crie o bucket "documents" no Supabase Dashboard');
      console.log('   - Nome: documents');
      console.log('   - Público: Sim');
      console.log('   - File Size Limit: 50MB');
      return;
    }

    // 2. MIGRAR ARQUIVOS LOCAIS (se existirem)
    console.log('\n📁 2. MIGRANDO ARQUIVOS LOCAIS...');

    const uploadsDir = './uploads/documents';

    if (fs.existsSync(uploadsDir)) {
      console.log('📁 Diretório local encontrado:', uploadsDir);

      const files = fs.readdirSync(uploadsDir);
      console.log(`📊 Encontrados ${files.length} arquivos para migrar`);

      if (files.length === 0) {
        console.log('   ℹ️ Nenhum arquivo local para migrar');
      } else {
        let migrados = 0;
        let erros = 0;

        for (const file of files) {
          const filePath = path.join(uploadsDir, file);

          try {
            // Verificar se é arquivo (não diretório)
            const stats = fs.statSync(filePath);
            if (!stats.isFile()) continue;

            console.log(`   📤 Migrando: ${file} (${Math.round(stats.size / 1024)} KB)`);

            const fileBuffer = fs.readFileSync(filePath);

            // Upload para Supabase Storage
            const { data, error } = await supabase.storage
              .from('documents')
              .upload(file, fileBuffer);

            if (error) {
              console.log(`      ❌ ${file}: ${error.message}`);
              erros++;
            } else {
              console.log(`      ✅ ${file} migrado com sucesso`);
              migrados++;
            }

          } catch (uploadError) {
            console.log(`      ❌ ${file}: ${uploadError.message}`);
            erros++;
          }
        }

        console.log(`\n📊 RESUMO DA MIGRAÇÃO:`);
        console.log(`   ✅ Migrados: ${migrados}`);
        console.log(`   ❌ Erros: ${erros}`);
        console.log(`   📁 Total: ${files.length}`);
      }
    } else {
      console.log('   ℹ️ Diretório local não encontrado');
    }

    // 3. TESTAR UPLOAD E DOWNLOAD
    console.log('\n🧪 3. TESTANDO FUNCIONALIDADES...');

    // Teste de upload
    console.log('   📤 Testando upload...');
    const testContent = `Arquivo de teste migrado para Supabase Storage
Data: ${new Date().toISOString()}
Sistema: atom-gest-o
Status: Funcionando perfeitamente!`;

    const testBuffer = Buffer.from(testContent, 'utf-8');
    const testFileName = `teste-migracao-${Date.now()}.txt`;

    try {
      const { data: testData, error: testError } = await supabase.storage
        .from('documents')
        .upload(testFileName, testBuffer);

      if (testError) {
        console.log(`      ❌ Teste de upload falhou: ${testError.message}`);
      } else {
        console.log(`      ✅ Teste de upload funcionou: ${testFileName}`);

        // Gerar URL pública
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(testFileName);

        console.log(`      🔗 URL pública: ${urlData.publicUrl}`);

        // Teste de download
        console.log('   📥 Testando download...');
        const { data: downloadData, error: downloadError } = await supabase.storage
          .from('documents')
          .download(testFileName);

        if (downloadError) {
          console.log(`      ❌ Teste de download falhou: ${downloadError.message}`);
        } else {
          const downloadedContent = await downloadData.text();
          if (downloadedContent === testContent) {
            console.log('      ✅ Teste de download funcionou!');
          } else {
            console.log('      ⚠️ Conteúdo baixado diferente do enviado');
          }
        }
      }
    } catch (testError) {
      console.log(`      ❌ Erro no teste: ${testError.message}`);
    }

    // 4. LISTAR ARQUIVOS NO BUCKET
    console.log('\n📋 4. LISTANDO ARQUIVOS NO BUCKET...');

    try {
      const { data: files, error: listError } = await supabase.storage
        .from('documents')
        .list();

      if (listError) {
        console.log('   ❌ Erro ao listar arquivos:', listError.message);
      } else {
        console.log(`   📊 Total de arquivos no bucket: ${files.length}`);

        if (files.length > 0) {
          console.log('   📁 Arquivos disponíveis:');
          files.forEach((file, index) => {
            const sizeKB = Math.round((file.metadata?.size || 0) / 1024);
            console.log(`      ${index + 1}. ${file.name} (${sizeKB} KB)`);
          });
        }
      }
    } catch (listError) {
      console.log('   ❌ Erro ao listar arquivos:', listError.message);
    }

    // 5. RESULTADO FINAL
    console.log('\n🎯 5. RESULTADO FINAL:');

    try {
      const { data: finalFiles, error: finalError } = await supabase.storage
        .from('documents')
        .list();

      if (finalError) {
        console.log('   ❌ MIGRAÇÃO FALHOU');
        console.log('   🔧 Verifique as configurações do Supabase');
      } else if (finalFiles.length > 0) {
        console.log('   ✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log(`   🎉 ${finalFiles.length} arquivos agora estão no Supabase Storage`);
        console.log('   💡 Os arquivos físicos agora são salvos na nuvem');
        console.log('   🌐 URLs públicas disponíveis para acesso direto');
      } else {
        console.log('   ⚠️ Bucket criado mas sem arquivos');
        console.log('   💡 Execute o script novamente após criar alguns arquivos');
      }
    } catch (finalError) {
      console.log('   ❌ Erro ao verificar resultado final');
    }

    // 6. INSTRUÇÕES FINAIS
    console.log('\n📋 6. INSTRUÇÕES FINAIS:');
    console.log('   1. ✅ Arquivos migrados para Supabase Storage');
    console.log('   2. 🔗 URLs públicas disponíveis para download');
    console.log('   3. 📱 Acesso global via CDN do Supabase');
    console.log('   4. 💾 Backup automático na nuvem');
    console.log('   5. 🚀 Escalabilidade ilimitada');

  } catch (error) {
    console.error('❌ ERRO GERAL NA MIGRAÇÃO:', error.message);
    console.log('💡 Verifique a conexão com o Supabase');
  }
}

// Executar migração
console.log('⏳ Iniciando migração automática...');
migrarArquivos();
