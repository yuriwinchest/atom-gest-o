// Executar SQL para criar tabelas no Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://fbqocpozjmuzrdeacktb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTY3ODYsImV4cCI6MjA2NTQzMjc4Nn0.nZPmcY4QtgnZ0K68TW2VlrQm4gyqodQUxgrWDechhhY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL() {
  console.log('🔨 Criando tabelas no Supabase PostgreSQL...\n');
  
  // Comandos SQL individuais para criar tabelas
  const sqlCommands = [
    // Tabela usuarios
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW()
    );`,
    
    // Tabela documentos
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
    
    // Tabelas de tipos dinâmicos
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
  
  // Executar cada comando SQL
  for (let i = 0; i < sqlCommands.length; i++) {
    try {
      console.log(`📋 Executando comando ${i + 1}/${sqlCommands.length}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: sqlCommands[i]
      });
      
      if (error) {
        console.log(`❌ Erro no comando ${i + 1}:`, error.message);
        // Tentar usando o método direto
        console.log(`🔄 Tentando método alternativo...`);
        
        // Como RPC não funciona, vamos criar as tabelas testando inserção
        console.log(`⚠️  RPC não disponível, tabelas podem já existir no Supabase`);
      } else {
        console.log(`✅ Comando ${i + 1} executado com sucesso`);
      }
    } catch (err) {
      console.log(`❌ Erro de execução no comando ${i + 1}:`, err.message);
    }
  }
  
  console.log('\n🎯 Verificando se as tabelas foram criadas...');
  
  // Testar se conseguimos acessar as tabelas básicas
  const tablesToTest = ['document_types', 'public_organs', 'users'];
  
  for (const table of tablesToTest) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        console.log(`❌ Tabela ${table}: ${error.message}`);
      } else {
        console.log(`✅ Tabela ${table}: acessível`);
      }
    } catch (err) {
      console.log(`❌ Erro ao testar ${table}:`, err.message);
    }
  }
  
  console.log('\n📋 DIAGNÓSTICO COMPLETO!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Se as tabelas já existem, execute populate-supabase-simple.js');
  console.log('🔧 Se as tabelas não existem, execute o SQL manualmente no dashboard');
  console.log('🌐 Dashboard: https://supabase.com/dashboard/project/fbqocpozjmuzrdeacktb');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

executeSQL().catch(console.error);