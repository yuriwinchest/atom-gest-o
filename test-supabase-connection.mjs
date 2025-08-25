import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: './config-supabase.env' });

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Testando conexão com Supabase...');
console.log('URL:', supabaseUrl ? '✅ Configurado' : '❌ Não configurado');
console.log('Chave:', supabaseKey ? '✅ Configurado' : '❌ Não configurado');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  try {
    console.log('\n🔗 Testando conexão...');

    // Teste básico de conexão
    const { data, error } = await supabase
      .from('files')
      .select('count')
      .limit(1);

    if (error) {
      console.log('⚠️ Erro na consulta (pode ser normal se a tabela não existir):', error.message);
    } else {
      console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error.message);
    return false;
  }
}

async function listAllTables() {
  try {
    console.log('\n📋 Listando todas as tabelas...');

    // Consultar tabelas do sistema
    const { data: tables, error } = await supabase
      .rpc('get_all_tables');

    if (error) {
      console.log('⚠️ Método RPC não disponível, tentando consulta direta...');

      // Tentar consulta direta nas tabelas do sistema
      const { data: pgTables, error: pgError } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_type')
        .eq('table_schema', 'public');

      if (pgError) {
        console.log('⚠️ Consulta direta falhou, tentando método alternativo...');

        // Método alternativo: tentar acessar tabelas conhecidas
        const knownTables = [
          'files', 'documents', 'users', 'categories', 'main_subjects',
          'file_metadata', 'document_types', 'tags', 'uploads'
        ];

        const availableTables = [];

        for (const tableName of knownTables) {
          try {
            const { data, error } = await supabase
              .from(tableName)
              .select('*')
              .limit(1);

            if (!error) {
              availableTables.push({
                table_name: tableName,
                table_type: 'BASE TABLE',
                accessible: true
              });
            }
          } catch (e) {
            // Tabela não existe ou não acessível
          }
        }

        if (availableTables.length > 0) {
          console.log('✅ Tabelas acessíveis encontradas:');
          availableTables.forEach(table => {
            console.log(`  📊 ${table.table_name} (${table.table_type})`);
          });
        } else {
          console.log('❌ Nenhuma tabela acessível encontrada');
        }

        return availableTables;
      }

      if (pgTables && pgTables.length > 0) {
        console.log('✅ Tabelas encontradas:');
        pgTables.forEach(table => {
          console.log(`  📊 ${table.table_name} (${table.table_type})`);
        });
        return pgTables;
      }
    } else if (tables && tables.length > 0) {
      console.log('✅ Tabelas encontradas:');
      tables.forEach(table => {
        console.log(`  📊 ${table.table_name} (${table.table_type})`);
      });
      return tables;
    }

    return [];
  } catch (error) {
    console.error('❌ Erro ao listar tabelas:', error.message);
    return [];
  }
}

async function analyzeTableStructure(tableName) {
  try {
    console.log(`\n🔍 Analisando estrutura da tabela: ${tableName}`);

    // Tentar obter estrutura da tabela
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .order('ordinal_position');

    if (error) {
      console.log(`⚠️ Não foi possível obter estrutura da tabela ${tableName}:`, error.message);
      return null;
    }

    if (columns && columns.length > 0) {
      console.log(`✅ Estrutura da tabela ${tableName}:`);
      columns.forEach(column => {
        const nullable = column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultValue = column.column_default ? `DEFAULT ${column.column_default}` : '';
        console.log(`  📝 ${column.column_name}: ${column.data_type} ${nullable} ${defaultValue}`.trim());
      });
      return columns;
    } else {
      console.log(`⚠️ Tabela ${tableName} não possui colunas ou não foi encontrada`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Erro ao analisar tabela ${tableName}:`, error.message);
    return null;
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando análise completa do Supabase...\n');

  // Testar conexão
  const connectionOk = await testSupabaseConnection();
  if (!connectionOk) {
    console.log('\n❌ Falha na conexão. Abortando análise.');
    return;
  }

  // Listar tabelas
  const tables = await listAllTables();

  if (tables.length > 0) {
    console.log(`\n📊 Total de tabelas encontradas: ${tables.length}`);

    // Analisar estrutura das primeiras tabelas
    for (let i = 0; i < Math.min(tables.length, 5); i++) {
      const table = tables[i];
      await analyzeTableStructure(table.table_name);
    }

    console.log('\n✅ Análise concluída com sucesso!');
  } else {
    console.log('\n⚠️ Nenhuma tabela encontrada ou acessível.');
  }
}

// Executar testes
runAllTests().catch(console.error);
