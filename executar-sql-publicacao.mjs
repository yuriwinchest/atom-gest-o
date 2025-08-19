import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
dotenv.config({ path: './config-supabase.env' });

console.log('🔧 EXECUTANDO SQL PARA ADICIONAR CAMPO DE PUBLICAÇÃO');
console.log('=====================================================');

// Verificar variáveis
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Service key não configurada!');
  process.exit(1);
}

// Criar cliente administrativo
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔐 Cliente administrativo criado');

// Executar SQL para adicionar campo
async function executeSQL() {
  try {
    console.log('\n🔧 Executando SQL para adicionar campo is_published...');

    // SQL para adicionar o campo is_published
    const sql = `
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'homepage_content'
              AND column_name = 'is_published'
          ) THEN
              ALTER TABLE homepage_content
              ADD COLUMN is_published BOOLEAN DEFAULT FALSE;

              RAISE NOTICE 'Campo is_published adicionado com sucesso!';
          ELSE
              RAISE NOTICE 'Campo is_published já existe!';
          END IF;
      END $$;
    `;

    // Executar SQL via RPC (se disponível) ou criar uma função temporária
    console.log('📝 Tentando executar SQL via função personalizada...');

    // Criar uma função temporária para executar o SQL
    const { error: createFunctionError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: sql
    });

    if (createFunctionError) {
      console.log('⚠️ RPC não disponível, tentando método alternativo...');

      // Método alternativo: verificar se o campo existe e criar se necessário
      const { data: columns, error: columnsError } = await supabaseAdmin
        .from('homepage_content')
        .select('*')
        .limit(1);

      if (columnsError) {
        console.error('❌ Erro ao verificar estrutura:', columnsError);
        return false;
      }

      const hasIsPublished = 'is_published' in (columns[0] || {});

      if (hasIsPublished) {
        console.log('✅ Campo is_published já existe!');
        return true;
      } else {
        console.log('❌ Campo is_published não encontrado');
        console.log('💡 Execute o SQL manualmente no painel do Supabase:');
        console.log('\n' + sql);
        return false;
      }
    } else {
      console.log('✅ SQL executado com sucesso!');
      return true;
    }

  } catch (error) {
    console.error('💥 Erro ao executar SQL:', error);
    console.log('\n💡 Execute o SQL manualmente no painel do Supabase:');
    console.log('\nALTER TABLE homepage_content ADD COLUMN is_published BOOLEAN DEFAULT FALSE;');
    return false;
  }
}

// Executar SQL
executeSQL().then(success => {
  if (success) {
    console.log('\n🎉 CAMPO is_published ADICIONADO COM SUCESSO!');
    console.log('✅ A tabela está pronta para a funcionalidade de publicação');
    console.log('✅ Execute o teste novamente para confirmar');
  } else {
    console.log('\n⚠️ EXECUTE O SQL MANUALMENTE');
    console.log('1. Vá para o painel do Supabase > SQL Editor');
    console.log('2. Execute: ALTER TABLE homepage_content ADD COLUMN is_published BOOLEAN DEFAULT FALSE;');
    console.log('3. Execute o teste novamente');
  }
});
