// 🔑 TESTAR CREDENCIAIS SUPABASE
// Script para verificar se as credenciais estão corretas

import { createClient } from '@supabase/supabase-js';

console.log('🔑 TESTANDO CREDENCIAIS SUPABASE');
console.log('='.repeat(50));

// Testar diferentes configurações de credenciais
const configs = [
  {
    name: 'Configuração Atual (Service Key)',
    url: 'https://fbqocpozjmuzrdeacktb.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg1Njc4NiwiZXhwIjoyMDY1NDMyNzg2fQ.V37kx1A0n8LzOBGWOzDFSopUBQkQ4TgNMBl8vWMpKqY'
  },
  {
    name: 'Configuração Anon Key',
    url: 'https://fbqocpozjmuzrdeacktb.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTY3ODYsImV4cCI6MjA2NTQzMjc4Nn0.nZPmcY4QtgnZ0K68TW2VlrQm4gyqodQUxgrWDechhhY'
  },
  {
    name: 'Configuração do .env',
    url: 'https://xwrnhpqzbhwiqasuywjo.supabase.co',
    key: 'sb_publishable_CrgokHl7x1arwFyvuzLM5w_v9GEP6iK'
  }
];

async function testarCredenciais() {
  for (const config of configs) {
    console.log(`\n🧪 Testando: ${config.name}`);
    console.log(`   URL: ${config.url}`);
    console.log(`   Key: ${config.key.substring(0, 20)}...`);

    try {
      const supabase = createClient(config.url, config.key);

      // Teste 1: Conexão básica
      console.log('   📡 Testando conexão básica...');
      const { data: profile, error: profileError } = await supabase.auth.getUser();

      if (profileError) {
        console.log(`      ❌ Auth falhou: ${profileError.message}`);
      } else {
        console.log(`      ✅ Auth funcionou`);
      }

      // Teste 2: Storage buckets
      console.log('   📦 Testando storage buckets...');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

      if (bucketsError) {
        console.log(`      ❌ Storage falhou: ${bucketsError.message}`);
      } else {
        console.log(`      ✅ Storage funcionou: ${buckets.length} buckets`);
        buckets.forEach(bucket => {
          console.log(`         - ${bucket.name} (${bucket.public ? 'público' : 'privado'})`);
        });
      }

      // Teste 3: Database
      console.log('   🗄️ Testando database...');
      const { data: tables, error: tablesError } = await supabase
        .from('main_subjects')
        .select('*')
        .limit(1);

      if (tablesError) {
        console.log(`      ❌ Database falhou: ${tablesError.message}`);
      } else {
        console.log(`      ✅ Database funcionou: ${tables?.length || 0} registros`);
      }

    } catch (error) {
      console.log(`      ❌ Erro geral: ${error.message}`);
    }
  }

  // Mostrar instruções finais
  console.log('\n📋 INSTRUÇÕES FINAIS:');
  console.log('   1. ✅ Use a configuração que funcionou');
  console.log('   2. 🔧 Crie os buckets manualmente no Dashboard');
  console.log('   3. 🚀 Execute o script de migração novamente');
}

// Executar teste
testarCredenciais();
