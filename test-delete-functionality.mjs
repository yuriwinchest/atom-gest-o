/**
 * Script de teste para verificar a funcionalidade de exclusão
 * Testa se os documentos são realmente deletados do banco
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: './config-supabase.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeleteFunctionality() {
  try {
    console.log('🧪 Testando funcionalidade de exclusão...\n');

    // 1. Verificar documentos existentes
    console.log('📄 1. Verificando documentos existentes...');
    const { data: documents, error: listError } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });

    if (listError) {
      console.error('❌ Erro ao listar documentos:', listError);
      return;
    }

    console.log(`✅ ${documents?.length || 0} documentos encontrados no banco`);

    if (documents && documents.length > 0) {
      console.log('📋 Primeiros 3 documentos:');
      documents.slice(0, 3).forEach((doc, index) => {
        console.log(`   ${index + 1}. ID: ${doc.id}, Nome: ${doc.name || doc.filename}, Tipo: ${doc.file_type}`);
      });
    }

    // 2. Verificar se há documentos de teste específicos
    console.log('\n🔍 2. Verificando documentos de teste específicos...');
    const testDocuments = documents?.filter(doc =>
      doc.name?.includes('Teste') ||
      doc.filename?.includes('Teste') ||
      doc.title?.includes('Teste')
    ) || [];

    console.log(`📊 ${testDocuments.length} documentos de teste encontrados`);

    if (testDocuments.length > 0) {
      console.log('📋 Documentos de teste:');
      testDocuments.forEach((doc, index) => {
        console.log(`   ${index + 1}. ID: ${doc.id}, Nome: ${doc.name || doc.filename}, Tipo: ${doc.file_type}`);
      });

      // 3. Tentar deletar o primeiro documento de teste
      const docToDelete = testDocuments[0];
      console.log(`\n🗑️ 3. Tentando deletar documento de teste: ID ${docToDelete.id}`);

      const { error: deleteError } = await supabase
        .from('files')
        .delete()
        .eq('id', docToDelete.id);

      if (deleteError) {
        console.error('❌ Erro ao deletar documento:', deleteError);
      } else {
        console.log('✅ Documento deletado com sucesso do banco');

        // 4. Verificar se foi realmente deletado
        console.log('\n🔍 4. Verificando se documento foi realmente deletado...');
        const { data: deletedDoc, error: checkError } = await supabase
          .from('files')
          .select('*')
          .eq('id', docToDelete.id)
          .single();

        if (checkError && checkError.code === 'PGRST116') {
          console.log('✅ Documento não encontrado (deletado com sucesso)');
        } else if (deletedDoc) {
          console.log('⚠️ Documento ainda existe no banco:', deletedDoc);
        } else {
          console.log('✅ Documento deletado com sucesso');
        }
      }
    } else {
      console.log('ℹ️ Nenhum documento de teste encontrado para deletar');
    }

    // 5. Verificar documentos restantes
    console.log('\n📄 5. Verificando documentos restantes...');
    const { data: remainingDocs, error: remainingError } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });

    if (remainingError) {
      console.error('❌ Erro ao verificar documentos restantes:', remainingError);
      return;
    }

    console.log(`✅ ${remainingDocs?.length || 0} documentos restantes no banco`);

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar teste
testDeleteFunctionality().then(() => {
  console.log('\n🏁 Teste concluído');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
