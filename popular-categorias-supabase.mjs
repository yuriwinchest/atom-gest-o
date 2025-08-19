// Script para popular as tabelas de categorias no Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fbqocpozjmuzrdeacktb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTY3ODYsImV4cCI6MjA2NTQzMjc4Nn0.nZPmcY4QtgnZ0K68TW2VlrQm4gyqodQUxgrWDechhhY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Populando tabelas de categorias no Supabase...\n');
console.log('='.repeat(60));

// Dados para popular
const dados = {
  document_types: [
    'Ofício', 'Memorando', 'Relatório', 'Ata', 'Decreto',
    'Lei', 'Portaria', 'Resolução', 'Circular', 'Edital',
    'Contrato', 'Convênio', 'Parecer', 'Nota Técnica', 'Carta'
  ],
  public_organs: [
    'Presidência da República', 'Ministério da Fazenda',
    'Ministério da Justiça', 'Câmara dos Deputados',
    'Senado Federal', 'Ministério da Saúde',
    'Ministério da Educação', 'Tribunal de Contas da União',
    'Ministério do Meio Ambiente', 'Controladoria-Geral da União'
  ],
  responsible_sectors: [
    'Departamento Jurídico', 'Secretaria Executiva',
    'Assessoria de Comunicação', 'Gabinete',
    'Diretoria Administrativa', 'Departamento de Recursos Humanos',
    'Departamento Financeiro', 'Departamento de TI',
    'Ouvidoria', 'Controladoria Interna'
  ],
  main_subjects: [
    'Administração Pública', 'Orçamento e Finanças',
    'Recursos Humanos', 'Tecnologia da Informação',
    'Meio Ambiente', 'Saúde', 'Educação',
    'Segurança Pública', 'Infraestrutura', 'Cultura e Esporte'
  ],
  confidentiality_levels: [
    'Público', 'Restrito', 'Confidencial', 'Secreto', 'Ultra-secreto'
  ],
  availability_options: [
    'Disponível Online', 'Arquivo Físico', 'Biblioteca',
    'Acesso Restrito', 'Em Digitalização', 'Temporariamente Indisponível'
  ],
  language_options: [
    'Português', 'Inglês', 'Espanhol', 'Francês',
    'Alemão', 'Italiano', 'Chinês', 'Japonês'
  ],
  rights_options: [
    'Domínio Público', 'Direitos Reservados', 'Creative Commons',
    'Uso Interno', 'Licença Comercial', 'Uso Educacional'
  ],
  document_authorities: [
    'Presidente', 'Ministro', 'Secretário', 'Diretor',
    'Coordenador', 'Chefe de Gabinete', 'Procurador',
    'Auditor', 'Assessor', 'Gerente'
  ]
};

async function popularTabelas() {
  let totalInserido = 0;
  let totalErros = 0;

  // Popular cada tabela
  for (const [tabela, valores] of Object.entries(dados)) {
    console.log(`\n📝 Populando ${tabela}...`);

    for (const nome of valores) {
      // Inserir cada registro
      const { data, error } = await supabase
        .from(tabela)
        .insert({ name: nome })
        .select();

      if (error) {
        console.log(`   ❌ ${nome}: ${error.message || 'Erro ao inserir'}`);
        totalErros++;
      } else if (data && data.length > 0) {
        console.log(`   ✅ ${nome} inserido com sucesso!`);
        totalInserido++;
      } else {
        console.log(`   ⏭️  ${nome} processado`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICANDO RESULTADO FINAL:\n');

  // Verificar contagem final em cada tabela
  const tabelas = Object.keys(dados);
  let totalRegistros = 0;

  for (const tabela of tabelas) {
    const { count, error } = await supabase
      .from(tabela)
      .select('*', { count: 'exact', head: true });

    if (!error) {
      console.log(`✅ ${tabela.padEnd(25)} - ${count} registros`);
      totalRegistros += count;
    } else {
      console.log(`❌ ${tabela.padEnd(25)} - Erro ao contar`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ POPULAÇÃO CONCLUÍDA!\n');
  console.log(`📈 Total de registros inseridos: ${totalInserido}`);
  console.log(`📊 Total de registros no banco: ${totalRegistros}`);
  if (totalErros > 0) {
    console.log(`⚠️  Total de erros: ${totalErros}`);
  }

  // Testar se as APIs estão retornando dados
  console.log('\n' + '='.repeat(60));
  console.log('🔍 TESTANDO APIS:\n');

  // Testar document_types
  const { data: tipos, error: tiposError } = await supabase
    .from('document_types')
    .select('*')
    .order('name')
    .limit(3);

  if (!tiposError && tipos && tipos.length > 0) {
    console.log('📄 Tipos de documento (primeiros 3):');
    tipos.forEach(t => console.log(`   - ${t.name}`));
  }

  // Testar main_subjects
  const { data: assuntos, error: assuntosError } = await supabase
    .from('main_subjects')
    .select('*')
    .order('name')
    .limit(3);

  if (!assuntosError && assuntos && assuntos.length > 0) {
    console.log('\n📚 Assuntos principais (primeiros 3):');
    assuntos.forEach(a => console.log(`   - ${a.name}`));
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 SISTEMA PRONTO PARA USO!');
  console.log('✅ As categorias agora aparecerão nos dropdowns');
  console.log('✅ Novas categorias podem ser adicionadas pelo botão +');
  console.log('✅ Todos os dados são salvos no Supabase');
}

// Executar
popularTabelas().catch(console.error);
