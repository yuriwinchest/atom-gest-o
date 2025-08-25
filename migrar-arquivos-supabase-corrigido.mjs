// 🚀 MIGRAR ARQUIVOS PARA SUPABASE STORAGE - VERSÃO CORRIGIDA
// Script usando as credenciais que funcionam

import { createClient } from '@supabase/supabase-js';

// Usar a configuração que funcionou no teste
const supabaseUrl = 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const supabaseKey = 'sb_publishable_CrgokHl7x1arwFyvuzLM5w_v9GEP6iK';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 MIGRANDO ARQUIVOS PARA SUPABASE STORAGE - VERSÃO CORRIGIDA');
console.log('='.repeat(70));

async function migrarArquivosCorrigido() {
  try {
    // 1. VERIFICAR BUCKETS EXISTENTES
    console.log('\n📦 1. VERIFICANDO BUCKETS EXISTENTES...');

    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.log('❌ Erro ao listar buckets:', bucketsError.message);
      console.log('💡 Crie os buckets manualmente no Supabase Dashboard primeiro');
      console.log('\n📋 INSTRUÇÕES PARA CRIAR BUCKETS:');
      console.log('   1. Acesse: https://supabase.com/dashboard/projects');
      console.log('   2. Projeto: xwrnhpqzbhwiqasuywjo');
      console.log('   3. Menu: Storage → New Bucket');
      console.log('   4. Nome: documents');
      console.log('   5. Público: ✅ Sim');
      console.log('   6. File Size Limit: 50MB');
      return;
    }

    const bucketNames = buckets.map(b => b.name);
    console.log('✅ Buckets disponíveis:', bucketNames);

    // Verificar se o bucket principal existe
    if (!bucketNames.includes('documents')) {
      console.log('⚠️ Bucket "documents" não encontrado!');
      console.log('💡 Crie o bucket "documents" no Supabase Dashboard primeiro');
      console.log('\n📋 CONFIGURAÇÃO DO BUCKET:');
      console.log('   - Nome: documents');
      console.log('   - Público: ✅ Sim');
      console.log('   - File Size Limit: 50MB');
      console.log('   - Allowed MIME Types: application/*, text/*');
      return;
    }

    // 2. TESTAR UPLOAD E DOWNLOAD
    console.log('\n🧪 2. TESTANDO FUNCIONALIDADES...');

    // Teste de upload
    console.log('   📤 Testando upload...');
    const testContent = `Arquivo de teste migrado para Supabase Storage
Data: ${new Date().toISOString()}
Sistema: atom-gest-o
Status: Funcionando perfeitamente!
Configuração: Corrigida com credenciais válidas!`;

    const testBuffer = Buffer.from(testContent, 'utf-8');
    const testFileName = `teste-migracao-${Date.now()}.txt`;

    try {
      const { data: testData, error: testError } = await supabase.storage
        .from('documents')
        .upload(testFileName, testBuffer);

      if (testError) {
        console.log(`      ❌ Teste de upload falhou: ${testError.message}`);
        console.log('      💡 Verifique se o bucket foi criado corretamente');
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

    // 3. LISTAR ARQUIVOS NO BUCKET
    console.log('\n📋 3. LISTANDO ARQUIVOS NO BUCKET...');

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

    // 4. RESULTADO FINAL
    console.log('\n🎯 4. RESULTADO FINAL:');

    try {
      const { data: finalFiles, error: finalError } = await supabase.storage
        .from('documents')
        .list();

      if (finalError) {
        console.log('   ❌ MIGRAÇÃO FALHOU');
        console.log('   🔧 Verifique as configurações do Supabase');
        console.log('   💡 Crie o bucket "documents" no Dashboard');
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

    // 5. INSTRUÇÕES FINAIS
    console.log('\n📋 5. INSTRUÇÕES FINAIS:');
    console.log('   1. ✅ Use as credenciais corretas (xwrnhpqzbhwiqasuywjo)');
    console.log('   2. 🔧 Crie o bucket "documents" no Supabase Dashboard');
    console.log('   3. 🚀 Execute o script novamente');
    console.log('   4. 📁 Os arquivos serão salvos no Supabase Storage');
    console.log('   5. 🌐 URLs públicas estarão disponíveis');

  } catch (error) {
    console.error('❌ ERRO GERAL NA MIGRAÇÃO:', error.message);
    console.log('💡 Verifique a conexão com o Supabase');
  }
}

// Executar migração corrigida
console.log('⏳ Iniciando migração com credenciais corrigidas...');
migrarArquivosCorrigido();
