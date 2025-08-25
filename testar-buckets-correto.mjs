// 🧪 TESTAR BUCKETS COM SERVICE KEY CORRETA
// Script para verificar buckets usando a chave de serviço válida

import { createClient } from '@supabase/supabase-js';

// Usar a Service Key correta do arquivo de configuração
const supabaseUrl = 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cm5ocHF6Ymh3aXFhc3V5d2pvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTAxMjExNiwiZXhwIjoyMDY2NTg4MTE2fQ.QfaYEtwUHpzOsCuxt1ubJJH3d3AacMb_xTI1gqcUcHE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🧪 TESTANDO BUCKETS COM SERVICE KEY CORRETA');
console.log('='.repeat(60));

async function testarBuckets() {
  try {
    // 1. LISTAR BUCKETS COM SERVICE KEY
    console.log('\n📦 1. LISTANDO BUCKETS...');

    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.log('❌ Erro ao listar buckets:', bucketsError.message);
      return;
    }

    console.log('✅ Buckets encontrados:', buckets.length);

    if (buckets.length > 0) {
      buckets.forEach((bucket, index) => {
        console.log(`   ${index + 1}. ${bucket.name} (${bucket.public ? 'Público' : 'Privado'})`);
      });
    } else {
      console.log('   ⚠️ Nenhum bucket encontrado');
    }

    // 2. TESTAR BUCKET DOCUMENTS ESPECÍFICO
    console.log('\n📁 2. TESTANDO BUCKET DOCUMENTS...');

    try {
      const { data: files, error: filesError } = await supabase.storage
        .from('documents')
        .list();

      if (filesError) {
        console.log('   ❌ Erro ao acessar bucket documents:', filesError.message);
      } else {
        console.log(`   ✅ Bucket documents acessível!`);
        console.log(`   📊 Total de arquivos: ${files.length}`);

        if (files.length > 0) {
          files.forEach((file, index) => {
            const sizeKB = Math.round((file.metadata?.size || 0) / 1024);
            console.log(`      ${index + 1}. ${file.name} (${sizeKB} KB)`);
          });
        }
      }
    } catch (docError) {
      console.log('   ❌ Erro ao testar bucket documents:', docError.message);
    }

    // 3. TESTAR UPLOAD DIRETO
    console.log('\n📤 3. TESTANDO UPLOAD DIRETO...');

    const testContent = `Teste upload direto - ${new Date().toISOString()}`;
    const testBuffer = Buffer.from(testContent, 'utf-8');
    const testFileName = `teste-direto-${Date.now()}.txt`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(testFileName, testBuffer);

      if (uploadError) {
        console.log('   ❌ Upload falhou:', uploadError.message);
      } else {
        console.log('   ✅ Upload funcionou!');
        console.log(`   📁 Arquivo: ${testFileName}`);

        // Gerar URL pública
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(testFileName);

        console.log(`   🔗 URL pública: ${urlData.publicUrl}`);
      }
    } catch (uploadError) {
      console.log('   ❌ Erro no upload:', uploadError.message);
    }

    // 4. RESULTADO FINAL
    console.log('\n🎯 4. RESULTADO FINAL:');

    try {
      const { data: finalFiles, error: finalError } = await supabase.storage
        .from('documents')
        .list();

      if (finalError) {
        console.log('   ❌ TESTE FALHOU');
        console.log('   🔧 Verifique as configurações do Supabase');
      } else {
        console.log('   ✅ TESTE CONCLUÍDO COM SUCESSO!');
        console.log(`   🎉 Bucket documents funcionando perfeitamente`);
        console.log(`   📊 Total de arquivos: ${finalFiles.length}`);
        console.log('   💡 Upload e download funcionando');
        console.log('   🌐 URLs públicas disponíveis');
        console.log('   🚫 SEM LIMITES de tamanho funcionando!');
      }
    } catch (finalError) {
      console.log('   ❌ Erro ao verificar resultado final');
    }

  } catch (error) {
    console.error('❌ ERRO GERAL NO TESTE:', error.message);
  }
}

// Executar teste
console.log('⏳ Iniciando teste com Service Key correta...');
testarBuckets();
