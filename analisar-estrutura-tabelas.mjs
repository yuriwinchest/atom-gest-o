import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: './config-supabase.env' });

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Analisando estrutura das tabelas do Supabase...');
console.log('URL:', supabaseUrl ? '✅ Configurado' : '❌ Não configurado');
console.log('Chave:', supabaseKey ? '✅ Configurado' : '❌ Não configurado');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeTableStructure(tableName) {
  try {
    console.log(`\n🔍 Analisando estrutura da tabela: ${tableName}`);

    // Tentar fazer uma consulta SELECT * para inferir a estrutura
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ Erro ao acessar tabela ${tableName}:`, error.message);
      return null;
    }

    if (data && data.length > 0) {
      const sampleRow = data[0];
      console.log(`✅ Tabela ${tableName} acessível`);
      console.log(`📝 Colunas encontradas (${Object.keys(sampleRow).length}):`);

      Object.entries(sampleRow).forEach(([columnName, value]) => {
        const type = value === null ? 'NULL' : typeof value;
        const sampleValue = value === null ? 'NULL' :
                           typeof value === 'string' && value.length > 50 ?
                           value.substring(0, 50) + '...' :
                           String(value);

        console.log(`  📊 ${columnName}: ${type} = ${sampleValue}`);
      });

      return Object.keys(sampleRow);
    } else {
      console.log(`⚠️ Tabela ${tableName} está vazia ou não retornou dados`);
      return [];
    }
  } catch (err) {
    console.error(`❌ Erro ao analisar tabela ${tableName}:`, err.message);
    return null;
  }
}

async function getTableRowCount(tableName) {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`⚠️ Não foi possível contar registros da tabela ${tableName}:`, error.message);
      return 'N/A';
    }

    return count || 0;
  } catch (err) {
    return 'N/A';
  }
}

async function analyzeAllTables() {
  try {
    console.log('\n🚀 Iniciando análise completa das tabelas...\n');

    // Lista de tabelas conhecidas
    const knownTables = [
      'files', 'documents', 'users', 'categories', 'main_subjects', 'document_types'
    ];

    const tableAnalysis = [];

    for (const tableName of knownTables) {
      const columns = await analyzeTableStructure(tableName);
      const rowCount = await getTableRowCount(tableName);

      if (columns) {
        tableAnalysis.push({
          table: tableName,
          columns: columns,
          rowCount: rowCount,
          accessible: true
        });
      } else {
        tableAnalysis.push({
          table: tableName,
          columns: [],
          rowCount: 'N/A',
          accessible: false
        });
      }
    }

    // Resumo da análise
    console.log('\n📊 RESUMO DA ANÁLISE:');
    console.log('========================');

    tableAnalysis.forEach(table => {
      const status = table.accessible ? '✅' : '❌';
      const count = table.accessible ? `${table.columns.length} colunas` : 'Inacessível';
      const rows = table.rowCount !== 'N/A' ? `${table.rowCount} registros` : 'N/A';

      console.log(`${status} ${table.table}: ${count} | ${rows}`);
    });

    // Análise de compatibilidade com campos do formulário
    console.log('\n🔍 ANÁLISE DE COMPATIBILIDADE:');
    console.log('================================');

    const formFields = [
      'title', 'description', 'main_subject', 'category', 'tags', 'file', 'environment', 'metadata'
    ];

    formFields.forEach(field => {
      const matchingTables = tableAnalysis.filter(table =>
        table.accessible && table.columns.some(col =>
          col.toLowerCase().includes(field.toLowerCase()) ||
          field.toLowerCase().includes(col.toLowerCase())
        )
      );

      if (matchingTables.length > 0) {
        console.log(`✅ ${field}: Encontrado em ${matchingTables.length} tabela(s)`);
        matchingTables.forEach(table => {
          const matchingColumns = table.columns.filter(col =>
            col.toLowerCase().includes(field.toLowerCase()) ||
            field.toLowerCase().includes(col.toLowerCase())
          );
          console.log(`   📊 ${table.table}: ${matchingColumns.join(', ')}`);
        });
      } else {
        console.log(`❌ ${field}: Nenhuma correspondência encontrada`);
      }
    });

    return tableAnalysis;

  } catch (error) {
    console.error('❌ Erro durante análise:', error.message);
    return [];
  }
}

// Executar análise
analyzeAllTables().catch(console.error);
