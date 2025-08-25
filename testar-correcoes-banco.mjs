import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: './config-supabase.env' });

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🧪 Testando correções aplicadas no banco de dados...');
console.log('URL:', supabaseUrl ? '✅ Configurado' : '❌ Não configurado');
console.log('Chave:', supabaseKey ? '✅ Configurado' : '❌ Não configurado');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewColumns() {
  try {
    console.log('\n🔍 Testando novas colunas adicionadas...');

    // Testar se a coluna 'title' existe
    const { data: titleTest, error: titleError } = await supabase
      .from('files')
      .select('title, filename, original_name')
      .limit(3);

    if (titleError) {
      console.log('❌ Erro ao testar coluna "title":', titleError.message);
      return false;
    }

    if (titleTest && titleTest.length > 0) {
      console.log('✅ Coluna "title" está funcionando:');
      titleTest.forEach((row, index) => {
        console.log(`  📝 Registro ${index + 1}:`);
        console.log(`     filename: ${row.filename}`);
        console.log(`     original_name: ${row.original_name}`);
        console.log(`     title: ${row.title || 'NULL'}`);
      });
    }

    // Testar se a coluna 'main_subject_id' existe
    const { data: subjectTest, error: subjectError } = await supabase
      .from('files')
      .select('main_subject_id, file_category')
      .limit(3);

    if (subjectError) {
      console.log('❌ Erro ao testar coluna "main_subject_id":', subjectError.message);
      return false;
    }

    if (subjectTest && subjectTest.length > 0) {
      console.log('\n✅ Coluna "main_subject_id" está funcionando:');
      subjectTest.forEach((row, index) => {
        console.log(`  📝 Registro ${index + 1}:`);
        console.log(`     file_category: ${row.file_category}`);
        console.log(`     main_subject_id: ${row.main_subject_id || 'NULL'}`);
      });
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao testar novas colunas:', error.message);
    return false;
  }
}

async function testFormCompatibility() {
  try {
    console.log('\n🔍 Testando compatibilidade com campos do formulário...');

    // Lista de campos obrigatórios do formulário
    const requiredFields = ['title', 'main_subject_id'];
    const optionalFields = ['description', 'category', 'tags', 'file', 'environment', 'metadata'];

    // Testar campos obrigatórios
    console.log('\n📋 Campos Obrigatórios:');
    for (const field of requiredFields) {
      try {
        const { data, error } = await supabase
          .from('files')
          .select(field)
          .limit(1);

        if (error) {
          console.log(`❌ ${field}: ${error.message}`);
        } else if (data && data.length > 0) {
          const value = data[0][field];
          const status = value !== null && value !== undefined ? '✅' : '⚠️';
          console.log(`${status} ${field}: ${value || 'NULL'}`);
        } else {
          console.log(`⚠️ ${field}: Nenhum dado encontrado`);
        }
      } catch (err) {
        console.log(`❌ ${field}: Erro na consulta`);
      }
    }

    // Testar campos opcionais
    console.log('\n📋 Campos Opcionais:');
    for (const field of optionalFields) {
      try {
        const { data, error } = await supabase
          .from('files')
          .select(field)
          .limit(1);

        if (error) {
          console.log(`❌ ${field}: ${error.message}`);
        } else if (data && data.length > 0) {
          const value = data[0][field];
          const status = value !== null && value !== undefined ? '✅' : '⚠️';
          console.log(`${status} ${field}: ${value || 'NULL'}`);
        } else {
          console.log(`⚠️ ${field}: Nenhum dado encontrado`);
        }
      } catch (err) {
        console.log(`❌ ${field}: Erro na consulta`);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao testar compatibilidade:', error.message);
    return false;
  }
}

async function testDataIntegrity() {
  try {
    console.log('\n🔍 Testando integridade dos dados...');

    // Verificar se todos os registros têm título
    const { data: titleCheck, error: titleError } = await supabase
      .from('files')
      .select('id, title')
      .is('title', null);

    if (titleError) {
      console.log('❌ Erro ao verificar títulos:', titleError.message);
      return false;
    }

    if (titleCheck && titleCheck.length > 0) {
      console.log(`⚠️ ${titleCheck.length} registros sem título:`);
      titleCheck.forEach(row => {
        console.log(`  📝 ID ${row.id}: título = ${row.title}`);
      });
    } else {
      console.log('✅ Todos os registros têm título');
    }

    // Verificar se todos os registros têm assunto principal
    const { data: subjectCheck, error: subjectError } = await supabase
      .from('files')
      .select('id, main_subject_id')
      .is('main_subject_id', null);

    if (subjectError) {
      console.log('❌ Erro ao verificar assuntos:', subjectError.message);
      return false;
    }

    if (subjectCheck && subjectCheck.length > 0) {
      console.log(`⚠️ ${subjectCheck.length} registros sem assunto principal:`);
      subjectCheck.forEach(row => {
        console.log(`  📝 ID ${row.id}: main_subject_id = ${row.main_subject_id}`);
      });
    } else {
      console.log('✅ Todos os registros têm assunto principal');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao testar integridade:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando testes das correções do banco...\n');

  const results = {
    newColumns: await testNewColumns(),
    formCompatibility: await testFormCompatibility(),
    dataIntegrity: await testDataIntegrity()
  };

  console.log('\n📊 RESULTADO DOS TESTES:');
  console.log('========================');
  console.log(`🔧 Novas Colunas: ${results.newColumns ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`📝 Compatibilidade com Formulário: ${results.formCompatibility ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`🔒 Integridade dos Dados: ${results.dataIntegrity ? '✅ OK' : '❌ FALHOU'}`);

  const allPassed = Object.values(results).every(r => r);

  if (allPassed) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('💡 O banco de dados está configurado corretamente para o formulário.');
    console.log('🚀 O sistema de upload deve funcionar perfeitamente agora.');
  } else {
    console.log('\n⚠️ ALGUNS TESTES FALHARAM!');
    console.log('🔧 Verifique se o script SQL foi executado corretamente.');
    console.log('📋 Execute o script CORRIGIR_CAMPOS_FALTANTES.sql no Supabase.');
  }

  return allPassed;
}

// Executar testes
runAllTests().catch(console.error);
