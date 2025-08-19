import { createClient } from '@supabase/supabase-js';

console.log('📊 Verificando documentos no banco de dados...\n');

const supabaseUrl = 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cm5ocHF6Ymh3aXFhc3V5d2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTIxMTYsImV4cCI6MjA2NjU4ODExNn0.6-jfb70OUjegikt8zBWmZGzcb6QZ-4jJiEXaxsVWez4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarDocumentos() {
  try {
    // 1. Verificar tabela documents
    console.log('📋 Verificando tabela "documents"...');
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (docsError) {
      console.log('❌ Erro ao buscar documentos:', docsError.message);
      return;
    }

    console.log(`✅ Documentos encontrados: ${documents.length}`);

    if (documents.length > 0) {
      console.log('\n📄 Últimos documentos:');
      documents.slice(0, 5).forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc.title || 'Sem título'}`);
        console.log(`      ID: ${doc.id}`);
        console.log(`      Categoria: ${doc.category || 'N/A'}`);
        console.log(`      Autor: ${doc.author || 'N/A'}`);
        console.log(`      Criado em: ${doc.created_at || 'N/A'}`);

        // Verificar conteúdo JSON
        if (doc.content) {
          try {
            const content = JSON.parse(doc.content);
            console.log(`      Tipo: ${content.fileType || 'N/A'}`);
            console.log(`      Tamanho: ${content.fileSize || 'N/A'}`);
            console.log(`      URL: ${content.supabaseUrl || 'N/A'}`);
          } catch (e) {
            console.log(`      Conteúdo: ${doc.content.substring(0, 100)}...`);
          }
        }
        console.log('');
      });
    }

    // 2. Verificar se há arquivos físicos referenciados
    console.log('🔍 Verificando referências a arquivos físicos...');
    let arquivosFisicos = 0;
    let arquivosLocal = 0;
    let arquivosSupabase = 0;

    documents.forEach(doc => {
      if (doc.content) {
        try {
          const content = JSON.parse(doc.content);
          if (content.supabaseUrl) {
            arquivosFisicos++;
            if (content.supabaseUrl.includes('supabase.co')) {
              arquivosSupabase++;
            } else if (content.supabaseUrl.includes('/local/')) {
              arquivosLocal++;
            }
          }
        } catch (e) {
          // Ignorar erros de parse
        }
      }
    });

    console.log(`📊 Resumo de arquivos físicos:`);
    console.log(`   Total com arquivos: ${arquivosFisicos}`);
    console.log(`   No Supabase: ${arquivosSupabase}`);
    console.log(`   Local: ${arquivosLocal}`);

    // 3. Verificar tabela files se existir
    console.log('\n📋 Verificando tabela "files"...');
    try {
      const { data: files, error: filesError } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (filesError) {
        console.log('❌ Tabela "files" não existe ou erro de acesso:', filesError.message);
      } else {
        console.log(`✅ Arquivos na tabela "files": ${files.length}`);
        if (files.length > 0) {
          console.log('📄 Últimos arquivos:');
          files.slice(0, 3).forEach((file, index) => {
            console.log(`   ${index + 1}. ${file.name || 'Sem nome'}`);
            console.log(`      Caminho: ${file.file_path || 'N/A'}`);
            console.log(`      Tipo: ${file.file_type || 'N/A'}`);
          });
        }
      }
    } catch (error) {
      console.log('⚠️ Tabela "files" não encontrada');
    }

  } catch (error) {
    console.log('💥 Erro geral:', error.message);
  }
}

verificarDocumentos().then(() => {
  console.log('\n🏁 Verificação de documentos concluída!');
});
