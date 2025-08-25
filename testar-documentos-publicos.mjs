#!/usr/bin/env node

/**
 * 🧪 TESTE: Documentos Públicos
 * Verifica se a página está exibindo documentos corretamente
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: './config-supabase.env' });

const supabaseUrl = 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_KEY não encontrada em config-supabase.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarDocumentosPublicos() {
  console.log('🧪 === TESTE: DOCUMENTOS PÚBLICOS ===\n');

  try {
    // 1. Verificar tabela files
    console.log('📋 1. VERIFICANDO TABELA FILES...');
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('*')
      .eq('is_active', true);

    if (filesError) {
      console.error('❌ Erro ao buscar arquivos:', filesError);
      return;
    }

    console.log(`✅ ${files?.length || 0} arquivos ativos encontrados`);

    if (files && files.length > 0) {
      console.log('📄 Primeiros 3 arquivos:');
      files.slice(0, 3).forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name || file.original_name} (${file.file_type})`);
      });
    }

    // 2. Verificar se há arquivos inativos
    console.log('\n📋 2. VERIFICANDO ARQUIVOS INATIVOS...');
    const { data: inactiveFiles, error: inactiveError } = await supabase
      .from('files')
      .select('*')
      .eq('is_active', false);

    if (inactiveError) {
      console.error('❌ Erro ao buscar arquivos inativos:', inactiveError);
    } else {
      console.log(`📊 ${inactiveFiles?.length || 0} arquivos inativos encontrados`);
    }

    // 3. Verificar estrutura da tabela
    console.log('\n📋 3. VERIFICANDO ESTRUTURA DA TABELA...');
    const { data: structure, error: structureError } = await supabase
      .from('files')
      .select('*')
      .limit(1);

    if (structureError) {
      console.error('❌ Erro ao verificar estrutura:', structureError);
    } else if (structure && structure.length > 0) {
      const columns = Object.keys(structure[0]);
      console.log('✅ Colunas encontradas:', columns.join(', '));
    }

    // 4. Testar rota da API
    console.log('\n📋 4. TESTANDO ROTA /api/documents...');
    try {
      const response = await fetch('http://localhost:5001/api/documents');
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ API /api/documents retornou ${data?.length || 0} documentos`);
      } else {
        console.log(`❌ API /api/documents retornou status ${response.status}`);
      }
    } catch (apiError) {
      console.log('❌ Erro ao testar API (servidor pode não estar rodando):', apiError.message);
    }

    // 5. Resumo
    console.log('\n📊 === RESUMO ===');
    console.log(`📁 Total de arquivos ativos: ${files?.length || 0}`);
    console.log(`📁 Total de arquivos inativos: ${inactiveFiles?.length || 0}`);
    console.log(`📁 Total geral: ${(files?.length || 0) + (inactiveFiles?.length || 0)}`);

    if ((files?.length || 0) === 0) {
      console.log('\n⚠️ PROBLEMA: Nenhum arquivo ativo encontrado!');
      console.log('💡 SOLUÇÕES:');
      console.log('   1. Verificar se arquivos foram uploadados');
      console.log('   2. Verificar se campo is_active está correto');
      console.log('   3. Verificar se tabela files tem dados');
    } else {
      console.log('\n✅ Documentos públicos devem estar funcionando!');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testarDocumentosPublicos();
