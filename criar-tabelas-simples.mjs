// Script simples para criar tabelas de categorias no Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fbqocpozjmuzrdeacktb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg1Njc4NiwiZXhwIjoyMDY1NDMyNzg2fQ.V37kx1A0n8LzOBGWOzDFSopUBQkQ4TgNMBl8vWMpKqY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Criando tabelas de categorias no Supabase...\n');

async function criarTabelas() {
  try {
    // 1. Criar tabela main_subjects
    console.log('📝 Criando tabela main_subjects...');
    
    // Tentar inserir um registro para ver se a tabela existe
    const { data: testData, error: testError } = await supabase
      .from('main_subjects')
      .select('*')
      .limit(1);

    if (testError) {
      console.log('❌ Tabela main_subjects não existe. Execute o SQL manualmente no Supabase Dashboard:');
      console.log('\n📋 SQL para executar:');
      console.log(`
CREATE TABLE IF NOT EXISTS main_subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir dados iniciais
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
      `);
      return;
    }

    console.log('✅ Tabela main_subjects já existe!');

    // 2. Verificar se tem dados
    const { data: countData, error: countError } = await supabase
      .from('main_subjects')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Erro ao contar registros:', countError.message);
      return;
    }

    console.log(`📊 Tabela tem ${countData.length} registros`);

    if (countData.length === 0) {
      console.log('📝 Inserindo dados iniciais...');
      
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
          console.log(`   ❌ ${nome}: ${error.message}`);
        } else {
          console.log(`   ✅ ${nome}`);
        }
      }
    }

    // 3. Testar a API
    console.log('\n🧪 Testando API...');
    const response = await fetch('http://localhost:5000/api/main-subjects');
    const data = await response.json();
    console.log(`📡 API retornou ${data.length} registros:`, data);

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

criarTabelas();
