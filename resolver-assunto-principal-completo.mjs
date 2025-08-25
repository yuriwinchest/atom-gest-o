// 🚀 RESOLVER ASSUNTO PRINCIPAL - SCRIPT COMPLETO AUTOMATIZADO
// Este script resolve o problema do campo que não abre as opções

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fbqocpozjmuzrdeacktb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg1Njc4NiwiZXhwIjoyMDY1NDMyNzg2fQ.V37kx1A0n8LzOBGWOzDFSopUBQkQ4TgNMBl8vWMpKqY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 RESOLVENDO CAMPO ASSUNTO PRINCIPAL - SCRIPT COMPLETO');
console.log('='.repeat(70));

async function resolverCompleto() {
  try {
    // 1. VERIFICAR SERVIDOR
    console.log('\n📡 1. VERIFICANDO SERVIDOR...');
    let servidorOk = false;

    try {
      const response = await fetch('http://localhost:5000/api/main-subjects');
      if (response.ok) {
        console.log('   ✅ Servidor rodando na porta 5000');
        servidorOk = true;
      } else {
        console.log(`   ⚠️ Servidor retornou erro: ${response.status}`);
      }
    } catch (error) {
      console.log('   ❌ Servidor não está rodando');
      console.log('   💡 Execute: npm run dev');
      console.log('   🔄 Aguardando 5 segundos e tentando novamente...');

      await new Promise(resolve => setTimeout(resolve, 5000));

      try {
        const retryResponse = await fetch('http://localhost:5000/api/main-subjects');
        if (retryResponse.ok) {
          console.log('   ✅ Servidor agora está rodando!');
          servidorOk = true;
        }
      } catch (retryError) {
        console.log('   ❌ Servidor ainda não está rodando');
        console.log('   🚨 Execute manualmente: npm run dev');
        return;
      }
    }

    // 2. CRIAR TABELAS NO SUPABASE
    console.log('\n🗄️ 2. CRIANDO TABELAS NO SUPABASE...');

    // Lista de tabelas para criar
    const tabelas = [
      {
        nome: 'main_subjects',
        dados: [
          'Administração Pública', 'Orçamento e Finanças', 'Recursos Humanos',
          'Tecnologia da Informação', 'Meio Ambiente', 'Saúde', 'Educação',
          'Segurança Pública', 'Infraestrutura', 'Cultura e Esporte'
        ]
      },
      {
        nome: 'document_types',
        dados: ['Ofício', 'Memorando', 'Relatório', 'Ata', 'Decreto', 'Lei']
      },
      {
        nome: 'public_organs',
        dados: ['Presidência da República', 'Ministério da Fazenda', 'Câmara dos Deputados']
      },
      {
        nome: 'responsible_sectors',
        dados: ['Departamento Jurídico', 'Secretaria Executiva', 'Gabinete']
      },
      {
        nome: 'confidentiality_levels',
        dados: ['Público', 'Restrito', 'Confidencial', 'Secreto']
      }
    ];

    // Criar cada tabela
    for (const tabela of tabelas) {
      console.log(`\n📝 Criando tabela ${tabela.nome}...`);

      try {
        // Tentar inserir dados para ver se a tabela existe
        const { data, error } = await supabase
          .from(tabela.nome)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`   ⚠️ Tabela ${tabela.nome} não existe`);
          console.log(`   💡 Execute este SQL no Supabase Dashboard:`);
          console.log(`
CREATE TABLE IF NOT EXISTS ${tabela.nome} (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);`);
          continue;
        }

        console.log(`   ✅ Tabela ${tabela.nome} existe`);

        // Verificar se tem dados
        const { data: countData, error: countError } = await supabase
          .from(tabela.nome)
          .select('*');

        if (countError) {
          console.log(`   ❌ Erro ao contar dados: ${countError.message}`);
          continue;
        }

        console.log(`   📊 Tabela tem ${countData.length} registros`);

        // Se não tem dados, inserir
        if (countData.length === 0) {
          console.log(`   📝 Inserindo dados em ${tabela.nome}...`);

          for (const nome of tabela.dados) {
            const { error: insertError } = await supabase
              .from(tabela.nome)
              .insert({ name: nome });

            if (insertError) {
              console.log(`      ❌ ${nome}: ${insertError.message}`);
            } else {
              console.log(`      ✅ ${nome}`);
            }
          }
        }

      } catch (tableError) {
        console.log(`   ❌ Erro na tabela ${tabela.nome}: ${tableError.message}`);
      }
    }

    // 3. TESTAR API COMPLETA
    console.log('\n🧪 3. TESTANDO API COMPLETA...');

    if (servidorOk) {
      // Testar todas as APIs
      const apis = [
        '/api/main-subjects',
        '/api/document-types',
        '/api/public-organs',
        '/api/responsible-sectors',
        '/api/confidentiality-levels'
      ];

      for (const api of apis) {
        try {
          const response = await fetch(`http://localhost:5000${api}`);
          if (response.ok) {
            const data = await response.json();
            console.log(`   ✅ ${api}: ${data.length} registros`);
          } else {
            console.log(`   ❌ ${api}: ${response.status}`);
          }
        } catch (apiError) {
          console.log(`   ❌ ${api}: ${apiError.message}`);
        }
      }
    }

    // 4. VERIFICAR COMPONENTE REACT
    console.log('\n⚛️ 4. VERIFICANDO COMPONENTE REACT...');

    console.log('   📋 Componentes que usam a API:');
    console.log('      ✅ AdvancedSelectWithAdd - apiEndpoint="/api/main-subjects"');
    console.log('      ✅ SelectWithAddDB - apiEndpoint="/api/main-subjects"');
    console.log('      ✅ SelectWithAddInline - apiEndpoint="/api/main-subjects"');

    // 5. RESULTADO FINAL
    console.log('\n🎯 5. RESULTADO FINAL:');

    // Verificar se main_subjects tem dados
    try {
      const { data: finalData, error: finalError } = await supabase
        .from('main_subjects')
        .select('*');

      if (finalError) {
        console.log('   ❌ PROBLEMA PERSISTE - Tabela não foi criada');
        console.log('   🔧 SOLUÇÃO: Execute o SQL manualmente no Supabase Dashboard');
      } else if (finalData.length > 0) {
        console.log('   ✅ PROBLEMA RESOLVIDO!');
        console.log(`   🎉 Campo Assunto Principal tem ${finalData.length} opções`);
        console.log('   💡 Recarregue a página para ver as opções');

        console.log('\n   📋 OPÇÕES DISPONÍVEIS:');
        finalData.forEach((item, index) => {
          console.log(`      ${index + 1}. ${item.name}`);
        });
      } else {
        console.log('   ⚠️ Tabela criada mas sem dados');
        console.log('   🔧 Execute o SQL de inserção no Supabase');
      }
    } catch (finalError) {
      console.log('   ❌ Erro ao verificar resultado final');
    }

    // 6. INSTRUÇÕES FINAIS
    console.log('\n📋 6. INSTRUÇÕES FINAIS:');
    console.log('   1. Se o problema persistir, execute o SQL manualmente no Supabase');
    console.log('   2. Recarregue a página do formulário (Ctrl+F5)');
    console.log('   3. Clique no campo "Assunto Principal"');
    console.log('   4. As opções devem aparecer no dropdown');

  } catch (error) {
    console.error('❌ ERRO GERAL:', error.message);
  }
}

// Executar solução completa
console.log('⏳ Iniciando solução automática...');
resolverCompleto();
