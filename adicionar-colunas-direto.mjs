#!/usr/bin/env node

/**
 * Script para adicionar colunas faltantes na tabela files
 * Usa a API REST do Supabase diretamente
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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

async function verificarColunasExistentes() {
  console.log('🔍 Verificando colunas existentes...');

  try {
    // Tentar fazer uma consulta simples para ver se as colunas existem
    const { data, error } = await supabase
      .from('files')
      .select('id, title, main_subject')
      .limit(1);

    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('⚠️ Colunas title e/ou main_subject não existem');
        return false;
      }
      console.error('❌ Erro ao verificar colunas:', error);
      return false;
    }

    console.log('✅ Colunas title e main_subject já existem');
    return true;

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return false;
  }
}

async function testarInserção() {
  console.log('🧪 Testando inserção com novos campos...');

  try {
    const testData = {
      title: 'Documento de Teste - ' + new Date().toISOString(),
      main_subject: 'Teste de Compatibilidade',
      description: 'Teste após verificar colunas',
      filename: 'teste-' + Date.now() + '.pdf',
      original_name: 'teste.pdf',
      file_path: '/test/teste.pdf',
      file_size: 1024,
      mime_type: 'application/pdf',
      file_category: 'documento',
      file_extension: 'pdf', // ✅ Campo obrigatório
      environment: 'development'
    };

    const { data, error } = await supabase
      .from('files')
      .insert(testData)
      .select();

    if (error) {
      console.error('❌ Erro no teste de inserção:', error);

      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('');
        console.log('🔧 SOLUÇÃO NECESSÁRIA:');
        console.log('As colunas title e main_subject precisam ser adicionadas manualmente.');
        console.log('Execute o seguinte SQL no painel do Supabase:');
        console.log('');
        console.log('ALTER TABLE files ADD COLUMN IF NOT EXISTS title VARCHAR(255);');
        console.log('ALTER TABLE files ADD COLUMN IF NOT EXISTS main_subject VARCHAR(255);');
        console.log('');
      }

      return false;
    }

    console.log('✅ Teste de inserção passou!');
    console.log('📄 Registro criado com ID:', data[0]?.id);

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

async function listarEstruturaDaTabela() {
  console.log('📋 Listando estrutura atual da tabela files...');

  try {
    // Fazer uma consulta para ver quais campos estão disponíveis
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erro ao consultar tabela:', error);
      return;
    }

    if (data && data.length > 0) {
      const campos = Object.keys(data[0]);
      console.log('📊 Campos encontrados na tabela files:');
      campos.forEach((campo, index) => {
        const status = ['title', 'main_subject'].includes(campo) ? '✅' : '  ';
        console.log(`${status} ${index + 1}. ${campo}`);
      });

      const temTitle = campos.includes('title');
      const temMainSubject = campos.includes('main_subject');

      console.log('');
      console.log('🔍 Status dos campos obrigatórios:');
      console.log(`   title: ${temTitle ? '✅ Existe' : '❌ Ausente'}`);
      console.log(`   main_subject: ${temMainSubject ? '✅ Existe' : '❌ Ausente'}`);

      return temTitle && temMainSubject;
    } else {
      console.log('⚠️ Tabela files está vazia, não foi possível verificar estrutura');
      return false;
    }

  } catch (error) {
    console.error('❌ Erro ao listar estrutura:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Verificação de Compatibilidade do Formulário');
  console.log('==============================================');

  // 1. Listar estrutura atual
  const estruturaOk = await listarEstruturaDaTabela();

  if (estruturaOk) {
    console.log('');
    console.log('🎉 ESTRUTURA ESTÁ CORRETA!');
    console.log('Todas as colunas necessárias estão presentes.');

    // Testar inserção
    const testeOk = await testarInserção();

    if (testeOk) {
      console.log('');
      console.log('✅ FORMULÁRIO TOTALMENTE COMPATÍVEL!');
      console.log('O sistema está pronto para uso.');
    }
  } else {
    console.log('');
    console.log('❌ COLUNAS FALTANTES DETECTADAS');
    console.log('');
    console.log('🔧 INSTRUÇÕES PARA CORREÇÃO:');
    console.log('1. Acesse o painel do Supabase');
    console.log('2. Vá para SQL Editor');
    console.log('3. Execute o seguinte comando:');
    console.log('');
    console.log('ALTER TABLE files');
    console.log('ADD COLUMN IF NOT EXISTS title VARCHAR(255),');
    console.log('ADD COLUMN IF NOT EXISTS main_subject VARCHAR(255);');
    console.log('');
    console.log('4. Execute este script novamente para verificar');
  }
}

main().catch(console.error);
