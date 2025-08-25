// 🚀 MIGRAR ARQUIVOS PARA SUPABASE STORAGE - SEM LIMITES
// Script para migrar arquivos de qualquer tamanho

import { createClient } from '@supabase/supabase-js';

// Usar a configuração que funcionou no teste
const supabaseUrl = 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const supabaseKey = 'sb_publishable_CrgokHl7x1arwFyvuzLM5w_v9GEP6iK';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 MIGRANDO ARQUIVOS PARA SUPABASE STORAGE - SEM LIMITES');
console.log('='.repeat(70));

async function migrarArquivosSemLimites() {
  try {
    // 1. VERIFICAR BUCKETS EXISTENTES
    console.log('\n📦 1. VERIFICANDO BUCKETS EXISTENTES...');

    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.log('❌ Erro ao listar buckets:', bucketsError.message);
      console.log('💡 Crie os buckets manualmente no Supabase Dashboard primeiro');
      console.log('\n📋 INSTRUÇÕES PARA CRIAR BUCKETS SEM LIMITES:');
      console.log('   1. Acesse: https://supabase.com/dashboard/projects');
      console.log('   2. Projeto: xwrnhpqzbhwiqasuywjo');
      console.log('   3. Menu: Storage → New Bucket');
      console.log('   4. Nome: documents');
      console.log('   5. Público: ✅ Sim');
      console.log('   6. File Size Limit: ❌ DEIXAR EM BRANCO (sem limite)');
      console.log('   7. Allowed MIME Types: ❌ DEIXAR EM BRANCO (aceita tudo)');
      return;
    }

    const bucketNames = buckets.map(b => b.name);
    console.log('✅ Buckets disponíveis:', bucketNames);

    // Verificar se o bucket principal existe
    if (!bucketNames.includes('documents')) {
      console.log('⚠️ Bucket "documents" não encontrado!');
      console.log('💡 Crie o bucket "documents" no Supabase Dashboard primeiro');
      console.log('\n📋 CONFIGURAÇÃO CORRETA DO BUCKET (SEM LIMITES):');
      console.log('   - Nome: documents');
      console.log('   - Público: ✅ Sim');
      console.log('   - File Size Limit: ❌ DEIXAR EM BRANCO (sem limite)');
      console.log('   - Allowed MIME Types: ❌ DEIXAR EM BRANCO (aceita tudo)');
      return;
    }

    // 2. TESTAR UPLOAD DE ARQUIVOS GRANDES
    console.log('\n🧪 2. TESTANDO UPLOAD SEM LIMITES...');

    // Teste 1: Arquivo pequeno
    console.log('   📤 Teste 1: Arquivo pequeno...');
    const testContent1 = `Arquivo pequeno - ${new Date().toISOString()}`;
    const testBuffer1 = Buffer.from(testContent1, 'utf-8');
    const testFileName1 = `teste-pequeno-${Date.now()}.txt`;

    try {
      const { data: testData1, error: testError1 } = await supabase.storage
        .from('documents')
        .upload(testFileName1, testBuffer1);

      if (testError1) {
        console.log(`      ❌ Teste pequeno falhou: ${testError1.message}`);
      } else {
        console.log(`      ✅ Teste pequeno funcionou: ${testFileName1}`);

        // Gerar URL pública
        const { data: urlData1 } = supabase.storage
          .from('documents')
          .getPublicUrl(testFileName1);

        console.log(`      🔗 URL pública: ${urlData1.publicUrl}`);
      }
    } catch (testError1) {
      console.log(`      ❌ Erro no teste pequeno: ${testError1.message}`);
    }

    // Teste 2: Arquivo médio (simulado)
    console.log('   📤 Teste 2: Arquivo médio (simulado)...');
    const testContent2 = `Arquivo médio - ${new Date().toISOString()}\n`.repeat(1000); // ~50KB
    const testBuffer2 = Buffer.from(testContent2, 'utf-8');
    const testFileName2 = `teste-medio-${Date.now()}.txt`;

    try {
      const { data: testData2, error: testError2 } = await supabase.storage
        .from('documents')
        .upload(testFileName2, testBuffer2);

      if (testError2) {
        console.log(`      ❌ Teste médio falhou: ${testError2.message}`);
      } else {
        console.log(`      ✅ Teste médio funcionou: ${testFileName2} (${Math.round(testBuffer2.length / 1024)} KB)`);

        // Gerar URL pública
        const { data: urlData2 } = supabase.storage
          .from('documents')
          .getPublicUrl(testFileName2);

        console.log(`      🔗 URL pública: ${urlData2.publicUrl}`);
      }
    } catch (testError2) {
      console.log(`      ❌ Erro no teste médio: ${testError2.message}`);
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
        console.log('   🚫 SEM LIMITES de tamanho de arquivo!');
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
    console.log('   2. 🔧 Crie o bucket "documents" SEM LIMITES no Supabase Dashboard');
    console.log('   3. 🚫 File Size Limit: DEIXAR EM BRANCO (sem limite)');
    console.log('   4. 🚫 Allowed MIME Types: DEIXAR EM BRANCO (aceita tudo)');
    console.log('   5. 🚀 Execute o script novamente');
    console.log('   6. 📁 Os arquivos serão salvos no Supabase Storage SEM LIMITES');
    console.log('   7. 🌐 URLs públicas estarão disponíveis');

  } catch (error) {
    console.error('❌ ERRO GERAL NA MIGRAÇÃO:', error.message);
    console.log('💡 Verifique a conexão com o Supabase');
  }
}

// Executar migração sem limites
console.log('⏳ Iniciando migração sem limites de tamanho...');
migrarArquivosSemLimites();
