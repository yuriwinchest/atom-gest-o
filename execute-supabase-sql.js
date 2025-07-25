// Script para executar comandos SQL diretamente no Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fbqocpozjmuzrdeacktb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTY3ODYsImV4cCI6MjA2NTQzMjc4Nn0.nZPmcY4QtgnZ0K68TW2VlrQm4gyqodQUxgrWDechhhY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLCommands() {
  console.log('🚀 Executando comandos SQL no Supabase...');
  
  // Comandos SQL individuais
  const commands = [
    // 1. Criar tabela users
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW()
    );`,
    
    // 2. Criar tabela documents
    `CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      content JSONB,
      author TEXT,
      category TEXT,
      tags TEXT[],
      file_path TEXT,
      file_size BIGINT,
      mime_type TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      user_id INTEGER
    );`,
    
    // 3-11. Criar tabelas de categorias dinâmicas
    `CREATE TABLE IF NOT EXISTS document_types (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );`,
    
    `CREATE TABLE IF NOT EXISTS public_organs (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );`,
    
    `CREATE TABLE IF NOT EXISTS responsible_sectors (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );`,
    
    `CREATE TABLE IF NOT EXISTS main_subjects (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );`,
    
    `CREATE TABLE IF NOT EXISTS confidentiality_levels (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );`,
    
    `CREATE TABLE IF NOT EXISTS availability_options (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );`,
    
    `CREATE TABLE IF NOT EXISTS language_options (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );`,
    
    `CREATE TABLE IF NOT EXISTS rights_options (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );`,
    
    `CREATE TABLE IF NOT EXISTS document_authorities (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );`
  ];
  
  // Executar cada comando
  for (let i = 0; i < commands.length; i++) {
    try {
      console.log(`📋 Executando comando ${i + 1}/${commands.length}...`);
      const { data, error } = await supabase.rpc('exec_raw_sql', { sql: commands[i] });
      
      if (error) {
        console.log(`❌ Erro no comando ${i + 1}:`, error);
      } else {
        console.log(`✅ Comando ${i + 1} executado com sucesso`);
      }
    } catch (err) {
      console.log(`❌ Erro inesperado no comando ${i + 1}:`, err);
    }
  }
  
  // Inserir dados iniciais
  await insertInitialData();
}

async function insertInitialData() {
  console.log('\n📊 Inserindo dados iniciais...');
  
  // Inserir usuário admin
  try {
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .insert([{
        username: 'admin',
        email: 'admin@empresa.com',
        password: 'admin123',
        role: 'admin'
      }])
      .select()
      .single();
    
    if (adminError && !adminError.message.includes('duplicate')) {
      console.log('❌ Erro ao criar admin:', adminError);
    } else {
      console.log('✅ Usuário admin criado/já existe');
    }
  } catch (err) {
    console.log('❌ Erro inesperado ao criar admin:', err);
  }
  
  // Inserir dados de exemplo nas tabelas de categorias
  const categoryData = {
    document_types: ['Ofício', 'Memorando', 'Relatório', 'Ata', 'Decreto', 'Lei'],
    public_organs: ['Presidência da República', 'Ministério da Fazenda', 'Ministério da Justiça', 'Câmara dos Deputados', 'Senado Federal'],
    responsible_sectors: ['Departamento Jurídico', 'Secretaria Executiva', 'Assessoria de Comunicação', 'Gabinete', 'Diretoria Administrativa'],
    main_subjects: ['Administração Pública', 'Orçamento e Finanças', 'Recursos Humanos', 'Tecnologia da Informação', 'Meio Ambiente'],
    confidentiality_levels: ['Público', 'Restrito', 'Confidencial', 'Secreto'],
    availability_options: ['Disponível Online', 'Arquivo Físico', 'Biblioteca', 'Acesso Restrito'],
    language_options: ['Português', 'Inglês', 'Espanhol', 'Francês'],
    rights_options: ['Domínio Público', 'Direitos Reservados', 'Creative Commons', 'Uso Interno'],
    document_authorities: ['Presidente da República', 'Ministro de Estado', 'Secretário Executivo', 'Diretor Geral', 'Coordenador']
  };
  
  for (const [tableName, items] of Object.entries(categoryData)) {
    try {
      console.log(`📊 Inserindo dados em ${tableName}...`);
      const insertData = items.map(name => ({ name }));
      
      const { data, error } = await supabase
        .from(tableName)
        .insert(insertData)
        .select();
      
      if (error && !error.message.includes('duplicate')) {
        console.log(`❌ Erro ao inserir em ${tableName}:`, error);
      } else {
        console.log(`✅ Dados inseridos em ${tableName}: ${items.length} itens`);
      }
    } catch (err) {
      console.log(`❌ Erro inesperado em ${tableName}:`, err);
    }
  }
  
  console.log('\n🎉 Processo de criação e população das tabelas concluído!');
}

// Executar o script
executeSQLCommands().catch(console.error);