// 🔍 VERIFICAR DADOS NO BANCO SUPABASE
// Script para verificar se os dados estão realmente no banco

import { createClient } from '@supabase/supabase-js';

// Usar a Service Key para acessar o banco
const supabaseUrl = 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cm5ocHF6Ymh3aXFhc3V5d2pvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTAxMjExNiwiZXhwIjoyMDY2NTg4MTE2fQ.QfaYEtwUHpzOsCuxt1ubJJH3d3AacMb_xTI1gqcUcHE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 VERIFICANDO DADOS NO BANCO SUPABASE');
console.log('='.repeat(50));

async function verificarDados() {
  try {
    // 1. VERIFICAR TABELA MAIN_SUBJECTS
    console.log('\n📋 1. VERIFICANDO TABELA MAIN_SUBJECTS...');

    const { data: mainSubjects, error: mainError } = await supabase
      .from('main_subjects')
      .select('*');

    if (mainError) {
      console.log('   ❌ Erro ao acessar main_subjects:', mainError.message);
    } else {
      console.log(`   ✅ Tabela main_subjects acessível!`);
      console.log(`   📊 Total de registros: ${mainSubjects.length}`);

      if (mainSubjects.length > 0) {
        console.log('   📝 Primeiros 5 registros:');
        mainSubjects.slice(0, 5).forEach((subject, index) => {
          console.log(`      ${index + 1}. ID: ${subject.id}, Nome: ${subject.name}`);
        });
      } else {
        console.log('   ⚠️ Tabela vazia!');
      }
    }

    // 2. VERIFICAR TABELA RESPONSIBLE_SECTORS
    console.log('\n📋 2. VERIFICANDO TABELA RESPONSIBLE_SECTORS...');

    const { data: sectors, error: sectorsError } = await supabase
      .from('responsible_sectors')
      .select('*');

    if (sectorsError) {
      console.log('   ❌ Erro ao acessar responsible_sectors:', sectorsError.message);
    } else {
      console.log(`   ✅ Tabela responsible_sectors acessível!`);
      console.log(`   📊 Total de registros: ${sectors.length}`);

      if (sectors.length > 0) {
        console.log('   📝 Primeiros 5 registros:');
        sectors.slice(0, 5).forEach((sector, index) => {
          console.log(`      ${index + 1}. ID: ${sector.id}, Nome: ${sector.name}`);
        });
      } else {
        console.log('   ⚠️ Tabela vazia!');
      }
    }

    // 3. VERIFICAR TABELA CONFIDENTIALITY_LEVELS
    console.log('\n📋 3. VERIFICANDO TABELA CONFIDENTIALITY_LEVELS...');

    const { data: levels, error: levelsError } = await supabase
      .from('confidentiality_levels')
      .select('*');

    if (levelsError) {
      console.log('   ❌ Erro ao acessar confidentiality_levels:', levelsError.message);
    } else {
      console.log(`   ✅ Tabela confidentiality_levels acessível!`);
      console.log(`   📊 Total de registros: ${levels.length}`);

      if (levels.length > 0) {
        console.log('   📝 Primeiros 5 registros:');
        levels.slice(0, 5).forEach((level, index) => {
          console.log(`      ${index + 1}. ID: ${level.id}, Nome: ${level.name}`);
        });
      } else {
        console.log('   ⚠️ Tabela vazia!');
      }
    }

    // 4. TESTAR QUERY DIRETA
    console.log('\n🔍 4. TESTANDO QUERY DIRETA...');

    try {
      const { data: queryData, error: queryError } = await supabase
        .rpc('get_main_subjects_count');

      if (queryError) {
        console.log('   ❌ Função RPC não existe, tentando query direta...');

        // Query direta
        const { data: directData, error: directError } = await supabase
          .from('main_subjects')
          .select('count', { count: 'exact', head: true });

        if (directError) {
          console.log('   ❌ Query direta falhou:', directError.message);
        } else {
          console.log('   ✅ Query direta funcionou!');
        }
      } else {
        console.log('   ✅ Função RPC funcionou!');
        console.log('   📊 Resultado:', queryData);
      }
    } catch (queryError) {
      console.log('   ❌ Erro na query:', queryError.message);
    }

    // 5. RESULTADO FINAL
    console.log('\n🎯 5. RESULTADO FINAL:');

    if (mainSubjects && mainSubjects.length > 0) {
      console.log('   ✅ DADOS ENCONTRADOS NO BANCO!');
      console.log(`   📊 Total de assuntos principais: ${mainSubjects.length}`);
      console.log('   💡 O problema está na API do servidor');
      console.log('   🔧 Verifique as rotas do servidor');
    } else {
      console.log('   ❌ DADOS NÃO ENCONTRADOS NO BANCO!');
      console.log('   💡 Execute o SQL para criar e popular as tabelas');
    }

  } catch (error) {
    console.error('❌ ERRO GERAL NA VERIFICAÇÃO:', error.message);
  }
}

// Executar verificação
console.log('⏳ Iniciando verificação dos dados...');
verificarDados();
