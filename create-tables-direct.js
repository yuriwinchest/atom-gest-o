// Criar tabelas usando Drizzle Kit direto no Supabase
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// String de conexão PostgreSQL do Supabase
const connectionString = 'postgresql://postgres.fbqocpozjmuzrdeacktb:CadastroMT2025@aws-0-us-west-1.pooler.supabase.co:6543/postgres';

const client = postgres(connectionString);
const db = drizzle(client);

async function createTables() {
  console.log('🔨 Criando tabelas usando PostgreSQL direto...\n');
  
  const tables = [
    {
      name: 'document_types',
      sql: `CREATE TABLE IF NOT EXISTS document_types (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );`
    },
    {
      name: 'public_organs',
      sql: `CREATE TABLE IF NOT EXISTS public_organs (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );`
    },
    {
      name: 'responsible_sectors',
      sql: `CREATE TABLE IF NOT EXISTS responsible_sectors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );`
    },
    {
      name: 'main_subjects',
      sql: `CREATE TABLE IF NOT EXISTS main_subjects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );`
    },
    {
      name: 'confidentiality_levels',
      sql: `CREATE TABLE IF NOT EXISTS confidentiality_levels (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );`
    },
    {
      name: 'availability_options',
      sql: `CREATE TABLE IF NOT EXISTS availability_options (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );`
    },
    {
      name: 'language_options',
      sql: `CREATE TABLE IF NOT EXISTS language_options (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );`
    },
    {
      name: 'rights_options',
      sql: `CREATE TABLE IF NOT EXISTS rights_options (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );`
    },
    {
      name: 'document_authorities',
      sql: `CREATE TABLE IF NOT EXISTS document_authorities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );`
    },
    {
      name: 'documents',
      sql: `CREATE TABLE IF NOT EXISTS documents (
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
      );`
    }
  ];
  
  for (const table of tables) {
    try {
      console.log(`📋 Criando tabela: ${table.name}...`);
      await client.unsafe(table.sql);
      console.log(`✅ Tabela ${table.name} criada com sucesso!`);
    } catch (error) {
      console.log(`❌ Erro ao criar ${table.name}:`, error.message);
    }
  }
  
  console.log('\n🎯 Verificando tabelas criadas...');
  
  // Verificar se as tabelas existem
  for (const table of tables) {
    try {
      const result = await client`SELECT COUNT(*) FROM ${client(table.name)} LIMIT 1`;
      console.log(`✅ Tabela ${table.name}: funcionando`);
    } catch (error) {
      console.log(`❌ Tabela ${table.name}: ${error.message}`);
    }
  }
  
  await client.end();
  console.log('\n🎉 Processo concluído!');
}

createTables().catch(console.error);