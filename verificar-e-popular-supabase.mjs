// Script para verificar e popular categorias no Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fbqocpozjmuzrdeacktb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTY3ODYsImV4cCI6MjA2NTQzMjc4Nn0.nZPmcY4QtgnZ0K68TW2VlrQm4gyqodQUxgrWDechhhY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Verificando e populando categorias no Supabase...\n');

// Primeiro, vamos verificar se as tabelas existem e têm dados
async function verificarEPopular() {
  try {
    // Verificar tipos de documento
    console.log('📄 Verificando tipos de documento...');
    const { data: tipos, error: tiposError } = await supabase
      .from('document_types')
      .select('*');

    if (tiposError) {
      console.log('❌ Erro ao buscar tipos:', tiposError.message);
    } else {
      console.log(`   Encontrados: ${tipos?.length || 0} tipos`);

      // Se vazio, popular
      if (!tipos || tipos.length === 0) {
        console.log('   📝 Populando tipos de documento...');
        const tiposParaInserir = [
          'Ofício', 'Memorando', 'Relatório', 'Ata', 'Decreto',
          'Lei', 'Portaria', 'Resolução', 'Circular', 'Edital',
          'Contrato', 'Convênio', 'Parecer', 'Nota Técnica', 'Carta'
        ];

        for (const name of tiposParaInserir) {
          const { error } = await supabase
            .from('document_types')
            .insert([{ name }]);

          if (error) {
            console.log(`      ⚠️ Erro ao inserir ${name}: ${error.message}`);
          } else {
            console.log(`      ✅ ${name} inserido`);
          }
        }
      }
    }

    // Verificar órgãos públicos
    console.log('\n🏛️ Verificando órgãos públicos...');
    const { data: orgaos, error: orgaosError } = await supabase
      .from('public_organs')
      .select('*');

    if (orgaosError) {
      console.log('❌ Erro ao buscar órgãos:', orgaosError.message);
    } else {
      console.log(`   Encontrados: ${orgaos?.length || 0} órgãos`);

      if (!orgaos || orgaos.length === 0) {
        console.log('   🏛️ Populando órgãos públicos...');
        const orgaosParaInserir = [
          'Presidência da República', 'Ministério da Fazenda',
          'Ministério da Justiça', 'Câmara dos Deputados',
          'Senado Federal', 'Ministério da Saúde',
          'Ministério da Educação', 'Tribunal de Contas da União',
          'Ministério do Meio Ambiente', 'Controladoria-Geral da União'
        ];

        for (const name of orgaosParaInserir) {
          const { error } = await supabase
            .from('public_organs')
            .insert([{ name }]);

          if (error) {
            console.log(`      ⚠️ Erro ao inserir ${name}: ${error.message}`);
          } else {
            console.log(`      ✅ ${name} inserido`);
          }
        }
      }
    }

    // Verificar setores responsáveis
    console.log('\n📋 Verificando setores responsáveis...');
    const { data: setores, error: setoresError } = await supabase
      .from('responsible_sectors')
      .select('*');

    if (setoresError) {
      console.log('❌ Erro ao buscar setores:', setoresError.message);
    } else {
      console.log(`   Encontrados: ${setores?.length || 0} setores`);

      if (!setores || setores.length === 0) {
        console.log('   📋 Populando setores responsáveis...');
        const setoresParaInserir = [
          'Departamento Jurídico', 'Secretaria Executiva',
          'Assessoria de Comunicação', 'Gabinete',
          'Diretoria Administrativa', 'Departamento de Recursos Humanos',
          'Departamento Financeiro', 'Departamento de TI',
          'Ouvidoria', 'Controladoria Interna'
        ];

        for (const name of setoresParaInserir) {
          const { error } = await supabase
            .from('responsible_sectors')
            .insert([{ name }]);

          if (error) {
            console.log(`      ⚠️ Erro ao inserir ${name}: ${error.message}`);
          } else {
            console.log(`      ✅ ${name} inserido`);
          }
        }
      }
    }

    // Verificar assuntos principais
    console.log('\n📚 Verificando assuntos principais...');
    const { data: assuntos, error: assuntosError } = await supabase
      .from('main_subjects')
      .select('*');

    if (assuntosError) {
      console.log('❌ Erro ao buscar assuntos:', assuntosError.message);
    } else {
      console.log(`   Encontrados: ${assuntos?.length || 0} assuntos`);

      if (!assuntos || assuntos.length === 0) {
        console.log('   📚 Populando assuntos principais...');
        const assuntosParaInserir = [
          'Administração Pública', 'Orçamento e Finanças',
          'Recursos Humanos', 'Tecnologia da Informação',
          'Meio Ambiente', 'Saúde', 'Educação',
          'Segurança Pública', 'Infraestrutura', 'Cultura e Esporte'
        ];

        for (const name of assuntosParaInserir) {
          const { error } = await supabase
            .from('main_subjects')
            .insert([{ name }]);

          if (error) {
            console.log(`      ⚠️ Erro ao inserir ${name}: ${error.message}`);
          } else {
            console.log(`      ✅ ${name} inserido`);
          }
        }
      }
    }

    // Verificar e popular outras tabelas...
    const outrasTabelas = [
      {
        nome: 'confidentiality_levels',
        label: '🔒 níveis de confidencialidade',
        dados: ['Público', 'Restrito', 'Confidencial', 'Secreto', 'Ultra-secreto']
      },
      {
        nome: 'availability_options',
        label: '🌐 opções de disponibilidade',
        dados: ['Disponível Online', 'Arquivo Físico', 'Biblioteca',
                'Acesso Restrito', 'Em Digitalização', 'Temporariamente Indisponível']
      },
      {
        nome: 'language_options',
        label: '🗣️ opções de idioma',
        dados: ['Português', 'Inglês', 'Espanhol', 'Francês',
                'Alemão', 'Italiano', 'Chinês', 'Japonês']
      },
      {
        nome: 'rights_options',
        label: '⚖️ opções de direitos',
        dados: ['Domínio Público', 'Direitos Reservados', 'Creative Commons',
                'Uso Interno', 'Licença Comercial', 'Uso Educacional']
      },
      {
        nome: 'document_authorities',
        label: '👑 autoridades de documento',
        dados: ['Presidente', 'Ministro', 'Secretário', 'Diretor',
                'Coordenador', 'Chefe de Gabinete', 'Procurador',
                'Auditor', 'Assessor', 'Gerente']
      }
    ];

    for (const tabela of outrasTabelas) {
      console.log(`\n${tabela.label.split(' ')[0]} Verificando ${tabela.label.substring(2)}...`);
      const { data, error } = await supabase
        .from(tabela.nome)
        .select('*');

      if (error) {
        console.log(`❌ Erro ao buscar ${tabela.label.substring(2)}:`, error.message);
      } else {
        console.log(`   Encontrados: ${data?.length || 0} registros`);

        if (!data || data.length === 0) {
          console.log(`   Populando ${tabela.label.substring(2)}...`);

          for (const name of tabela.dados) {
            const { error: insertError } = await supabase
              .from(tabela.nome)
              .insert([{ name }]);

            if (insertError) {
              console.log(`      ⚠️ Erro ao inserir ${name}: ${insertError.message}`);
            } else {
              console.log(`      ✅ ${name} inserido`);
            }
          }
        }
      }
    }

    console.log('\n🎉 Verificação e população concluída!');

    // Testar a API novamente
    console.log('\n🔍 Testando APIs...');

    const { data: tiposFinal } = await supabase
      .from('document_types')
      .select('*')
      .order('name');

    const { data: assuntosFinal } = await supabase
      .from('main_subjects')
      .select('*')
      .order('name');

    console.log(`\n✅ Total de tipos de documento: ${tiposFinal?.length || 0}`);
    console.log(`✅ Total de assuntos principais: ${assuntosFinal?.length || 0}`);

    if (tiposFinal && tiposFinal.length > 0) {
      console.log('\n📄 Primeiros 3 tipos de documento:');
      tiposFinal.slice(0, 3).forEach(t => console.log(`   - ${t.name}`));
    }

    if (assuntosFinal && assuntosFinal.length > 0) {
      console.log('\n📚 Primeiros 3 assuntos principais:');
      assuntosFinal.slice(0, 3).forEach(a => console.log(`   - ${a.name}`));
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar
verificarEPopular();
