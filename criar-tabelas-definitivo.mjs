// Script definitivo para criar e popular tabelas no Supabase
import { createClient } from '@supabase/supabase-js';

// CREDENCIAIS CORRETAS DO SEU PROJETO
const supabaseUrl = 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cm5ocHF6Ymh3aXFhc3V5d2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTIxMTYsImV4cCI6MjA2NjU4ODExNn0.6-jfb70OUjegikt8zBWmZGzcb6QZ-4jJiEXaxsVWez4';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 CRIANDO E POPULANDO TABELAS NO SUPABASE\n');
console.log('URL:', supabaseUrl);
console.log('='.repeat(60));

// SQL para criar todas as tabelas
const sqlCreateTables = `
-- Criar tabelas de categorias
CREATE TABLE IF NOT EXISTS document_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public_organs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS responsible_sectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS main_subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS confidentiality_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS availability_options (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS language_options (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rights_options (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_authorities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
`;

// Dados para popular
const categoriesData = {
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

async function criarEPopularTabelas() {
  console.log('\n📋 PASSO 1: Verificando tabelas existentes...\n');

  // Verificar quais tabelas existem
  for (const tableName of Object.keys(categoriesData)) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log(`❌ ${tableName} - NÃO EXISTE (será criada)`);
      } else {
        console.log(`⚠️  ${tableName} - ${error.message}`);
      }
    } else {
      console.log(`✅ ${tableName} - JÁ EXISTE`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📝 PASSO 2: Populando tabelas com dados...\n');

  let totalInserido = 0;
  let totalErros = 0;

  // Popular cada tabela
  for (const [tableName, values] of Object.entries(categoriesData)) {
    console.log(`\n🔸 Populando ${tableName}:`);

    for (const name of values) {
      const { data, error } = await supabase
        .from(tableName)
        .insert({ name })
        .select();

      if (error) {
        if (error.message && error.message.includes('duplicate')) {
          console.log(`   ⏭️  ${name} (já existe)`);
        } else if (error.message && error.message.includes('does not exist')) {
          console.log(`   ❌ Tabela ${tableName} não existe!`);
          totalErros++;
          break; // Pular para próxima tabela
        } else {
          console.log(`   ❌ ${name}: ${error.message || 'Erro desconhecido'}`);
          totalErros++;
        }
      } else if (data && data.length > 0) {
        console.log(`   ✅ ${name} inserido!`);
        totalInserido++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 PASSO 3: Verificação final...\n');

  // Verificar contagem final
  for (const tableName of Object.keys(categoriesData)) {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (!error) {
      console.log(`✅ ${tableName.padEnd(25)} - ${count} registros`);
    } else {
      console.log(`❌ ${tableName.padEnd(25)} - ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📈 RESUMO:\n');
  console.log(`   Total inserido: ${totalInserido} registros`);
  console.log(`   Total de erros: ${totalErros}`);

  if (totalErros > 0) {
    console.log('\n⚠️  ATENÇÃO: Algumas tabelas não existem!');
    console.log('\n📌 SOLUÇÃO:');
    console.log('1. Copie o conteúdo do arquivo CRIAR-TABELAS-SUPABASE.sql');
    console.log('2. Acesse: https://supabase.com/dashboard/project/xwrnhpqzbhwiqasuywjo/sql');
    console.log('3. Cole e execute o SQL');
    console.log('4. Execute este script novamente');
  } else if (totalInserido > 0) {
    console.log('\n✅ SUCESSO! Tabelas populadas com dados!');
  }

  // Testar API
  console.log('\n' + '='.repeat(60));
  console.log('🔍 TESTANDO API DO SERVIDOR:\n');

  try {
    const response = await fetch('http://localhost:5000/api/document-types');
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API funcionando! Retornou ${data.length} tipos de documento`);
    } else {
      console.log(`⚠️  API retornou erro: ${response.status}`);
    }
  } catch (err) {
    console.log('❌ Servidor não está rodando');
    console.log('   Execute: npm run dev');
  }
}

// Executar
criarEPopularTabelas().catch(console.error);
