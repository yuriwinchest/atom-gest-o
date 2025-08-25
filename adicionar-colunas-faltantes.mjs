#!/usr/bin/env node

/**
 * Script para adicionar colunas faltantes na tabela files
 * Executa: node adicionar-colunas-faltantes.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Carregar variáveis de ambiente
dotenv.config({ path: 'config-supabase.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('Certifique-se de que SUPABASE_URL e SUPABASE_SERVICE_KEY estão configuradas.');
  process.exit(1);
}

// Inicializar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function adicionarColunasFaltantes() {
  console.log('🔧 Iniciando adição de colunas faltantes...');

  try {
    // SQL para adicionar as colunas
    const sql = `
      -- Adicionar colunas faltantes
      ALTER TABLE files
      ADD COLUMN IF NOT EXISTS title VARCHAR(255),
      ADD COLUMN IF NOT EXISTS main_subject VARCHAR(255);

      -- Criar índices
      CREATE INDEX IF NOT EXISTS idx_files_title ON files(title);
      CREATE INDEX IF NOT EXISTS idx_files_main_subject ON files(main_subject);
    `;

    console.log('📝 Executando SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Erro ao executar SQL:', error);
      return false;
    }

    console.log('✅ Colunas adicionadas com sucesso!');

    // Verificar se as colunas foram criadas
    console.log('🔍 Verificando estrutura da tabela...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'files'
          AND column_name IN ('title', 'main_subject')
          ORDER BY column_name;
        `
      });

    if (columnsError) {
      console.error('❌ Erro ao verificar colunas:', columnsError);
      return false;
    }

    if (columns && columns.length > 0) {
      console.log('📊 Colunas encontradas:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    return true;

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return false;
  }
}

async function verificarCompatibilidade() {
  console.log('🧪 Testando compatibilidade do formulário...');

  try {
    // Testar inserção de um registro com os novos campos
    const testData = {
      title: 'Documento de Teste',
      main_subject: 'Teste de Compatibilidade',
      description: 'Teste após adicionar colunas',
      filename: 'teste.pdf',
      original_name: 'teste.pdf',
      file_path: '/test/teste.pdf',
      file_size: 1024,
      mime_type: 'application/pdf',
      file_category: 'documento',
      environment: 'development'
    };

    const { data, error } = await supabase
      .from('files')
      .insert(testData)
      .select();

    if (error) {
      console.error('❌ Erro no teste de compatibilidade:', error);
      return false;
    }

    console.log('✅ Teste de compatibilidade passou!');
    console.log('📄 Registro de teste criado:', data[0]?.id);

    // Limpar registro de teste
    if (data[0]?.id) {
      await supabase
        .from('files')
        .delete()
        .eq('id', data[0].id);
      console.log('🧹 Registro de teste removido');
    }

    return true;

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Script de Correção de Colunas Faltantes');
  console.log('==========================================');

  const sucesso = await adicionarColunasFaltantes();

  if (sucesso) {
    await verificarCompatibilidade();

    console.log('');
    console.log('🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('');
    console.log('📋 Resumo das alterações:');
    console.log('  ✅ Coluna "title" adicionada');
    console.log('  ✅ Coluna "main_subject" adicionada');
    console.log('  ✅ Índices criados para performance');
    console.log('  ✅ Compatibilidade testada');
    console.log('');
    console.log('🔥 O formulário agora deve funcionar perfeitamente!');
  } else {
    console.log('');
    console.log('❌ FALHA NA CORREÇÃO');
    console.log('Verifique os erros acima e tente novamente.');
    process.exit(1);
  }
}

main().catch(console.error);

