// Script para testar inserção direta nas tabelas de analytics
// Execute: node testar-insercao-analytics.mjs

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: './config-supabase.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarInsercao() {
  console.log('🧪 Testando inserção direta nas tabelas de analytics...\n');

  try {
    // 1. Testar inserção na tabela search_analytics
    console.log('1️⃣ Testando inserção em search_analytics...');
    const { data: searchData, error: searchError } = await supabase
      .from('search_analytics')
      .insert({
        search_term: 'teste-insercao',
        search_type: 'general',
        results_count: 0,
        page_url: '/teste',
        user_ip: '127.0.0.1',
        user_agent: 'Teste-Direto/1.0',
        session_id: 'teste-session-' + Date.now(),
        is_authenticated: false
      })
      .select();

    if (searchError) {
      console.error('❌ Erro ao inserir em search_analytics:', searchError);
    } else {
      console.log('✅ Inserção em search_analytics bem-sucedida:', searchData);
    }

    // 2. Testar inserção na tabela document_analytics
    console.log('\n2️⃣ Testando inserção em document_analytics...');
    const { data: docData, error: docError } = await supabase
      .from('document_analytics')
      .insert({
        document_id: 1,
        action_type: 'view',
        user_ip: '127.0.0.1',
        user_agent: 'Teste-Direto/1.0',
        session_id: 'teste-session-' + Date.now(),
        referrer: '/teste',
        is_authenticated: false
      })
      .select();

    if (docError) {
      console.error('❌ Erro ao inserir em document_analytics:', docError);
    } else {
      console.log('✅ Inserção em document_analytics bem-sucedida:', docData);
    }

    // 3. Verificar contagem atual
    console.log('\n3️⃣ Verificando contagem atual...');
    const { data: searchCount } = await supabase
      .from('search_analytics')
      .select('*', { count: 'exact' });

    const { data: docCount } = await supabase
      .from('document_analytics')
      .select('*', { count: 'exact' });

    console.log('📊 Contagem atual:');
    console.log('- search_analytics:', searchCount?.length || 0);
    console.log('- document_analytics:', docCount?.length || 0);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testarInsercao();
