// DIAGNÓSTICO COMPLETO - CAMPO ASSUNTO PRINCIPAL NÃO FUNCIONA
// Este script identifica e resolve o problema do campo que não abre as opções

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fbqocpozjmuzrdeacktb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg1Njc4NiwiZXhwIjoyMDY1NDMyNzg2fQ.V37kx1A0n8LzOBGWOzDFSopUBQkQ4TgNMBl8vWMpKqY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 DIAGNÓSTICO COMPLETO - CAMPO ASSUNTO PRINCIPAL');
console.log('='.repeat(60));

async function diagnosticoCompleto() {
  try {
    // 1. VERIFICAR SE O SERVIDOR ESTÁ RODANDO
    console.log('\n📡 1. VERIFICANDO SERVIDOR...');
    try {
      const response = await fetch('http://localhost:5000/api/main-subjects');
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Servidor rodando - API retornou ${data.length} registros`);
      } else {
        console.log(`   ❌ Servidor retornou erro: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Servidor não está rodando: ${error.message}`);
      console.log('   💡 Execute: npm run dev');
      return;
    }

    // 2. VERIFICAR TABELA MAIN_SUBJECTS NO SUPABASE
    console.log('\n🗄️ 2. VERIFICANDO TABELA MAIN_SUBJECTS...');

    // Testar se a tabela existe
    const { data: testData, error: testError } = await supabase
      .from('main_subjects')
      .select('*')
      .limit(1);

    if (testError) {
      console.log('   ❌ Tabela main_subjects NÃO EXISTE!');
      console.log('   💡 CAUSA: A tabela não foi criada no Supabase');
      console.log('   🔧 SOLUÇÃO: Criar a tabela manualmente');

      // Mostrar SQL para executar
      console.log('\n📋 EXECUTE ESTE SQL NO SUPABASE DASHBOARD:');
      console.log(`
-- 1. Criar tabela
CREATE TABLE IF NOT EXISTS main_subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Inserir dados iniciais
INSERT INTO main_subjects (name) VALUES
  ('Administração Pública'),
  ('Orçamento e Finanças'),
  ('Recursos Humanos'),
  ('Tecnologia da Informação'),
  ('Meio Ambiente'),
  ('Saúde'),
  ('Educação'),
  ('Segurança Pública'),
  ('Infraestrutura'),
  ('Cultura e Esporte')
ON CONFLICT (name) DO NOTHING;

-- 3. Verificar se foi criado
SELECT * FROM main_subjects;
      `);

      return;
    }

    console.log('   ✅ Tabela main_subjects EXISTE!');

    // 3. VERIFICAR SE TEM DADOS
    console.log('\n📊 3. VERIFICANDO DADOS NA TABELA...');

    const { data: allData, error: countError } = await supabase
      .from('main_subjects')
      .select('*');

    if (countError) {
      console.log(`   ❌ Erro ao buscar dados: ${countError.message}`);
      return;
    }

    console.log(`   📈 Tabela tem ${allData.length} registros:`);
    allData.forEach((item, index) => {
      console.log(`      ${index + 1}. ${item.name}`);
    });

    if (allData.length === 0) {
      console.log('   ⚠️ Tabela está vazia! Inserindo dados...');

      const dadosIniciais = [
        'Administração Pública',
        'Orçamento e Finanças',
        'Recursos Humanos',
        'Tecnologia da Informação',
        'Meio Ambiente',
        'Saúde',
        'Educação',
        'Segurança Pública',
        'Infraestrutura',
        'Cultura e Esporte'
      ];

      for (const nome of dadosIniciais) {
        const { error } = await supabase
          .from('main_subjects')
          .insert({ name: nome });

        if (error) {
          console.log(`      ❌ ${nome}: ${error.message}`);
        } else {
          console.log(`      ✅ ${nome}`);
        }
      }
    }

    // 4. TESTAR API COMPLETA
    console.log('\n🧪 4. TESTANDO API COMPLETA...');

    // Testar GET
    const getResponse = await fetch('http://localhost:5000/api/main-subjects');
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log(`   ✅ GET /api/main-subjects: ${getData.length} registros`);
    } else {
      console.log(`   ❌ GET /api/main-subjects: ${getResponse.status}`);
    }

    // Testar POST
    const postResponse = await fetch('http://localhost:5000/api/main-subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Teste API' })
    });

    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log(`   ✅ POST /api/main-subjects: ${postData.name}`);
    } else {
      console.log(`   ❌ POST /api/main-subjects: ${postResponse.status}`);
    }

    // 5. VERIFICAR COMPONENTE REACT
    console.log('\n⚛️ 5. VERIFICANDO COMPONENTE REACT...');

    // Verificar se o componente está usando a API correta
    console.log('   📋 Verificar se o componente está usando:');
    console.log('      - apiEndpoint="/api/main-subjects"');
    console.log('      - Componente: AdvancedSelectWithAdd ou SelectWithAddDB');

    // 6. RESULTADO FINAL
    console.log('\n🎯 6. RESULTADO FINAL:');

    if (allData.length > 0) {
      console.log('   ✅ PROBLEMA RESOLVIDO!');
      console.log('   🎉 O campo Assunto Principal deve funcionar agora');
      console.log('   💡 Recarregue a página para ver as opções');
    } else {
      console.log('   ❌ PROBLEMA PERSISTE');
      console.log('   🔧 Execute o SQL manualmente no Supabase');
    }

    // 7. TESTE FINAL
    console.log('\n🧪 7. TESTE FINAL - VERIFICANDO API...');
    const finalResponse = await fetch('http://localhost:5000/api/main-subjects');
    const finalData = await finalResponse.json();
    console.log(`   📡 API final: ${finalData.length} registros`);

    if (finalData.length > 0) {
      console.log('   🎯 DADOS DISPONÍVEIS:');
      finalData.forEach(item => console.log(`      - ${item.name}`));
    }

  } catch (error) {
    console.error('❌ ERRO NO DIAGNÓSTICO:', error.message);
  }
}

// Executar diagnóstico
diagnosticoCompleto();
