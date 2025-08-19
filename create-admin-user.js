// Script para criar usuário admin diretamente no banco
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const SUPABASE_URL = 'https://fbqocpozjmuzrdeacktb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTY3ODYsImV4cCI6MjA2NTQzMjc4Nn0.nZPmcY4QtgnZ0K68TW2VlrQm4gyqodQUxgrWDechhhY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createAdminUser() {
  try {
    console.log('🔐 Criando usuário admin...');

    // Hash da senha
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Dados do usuário admin - usando campos corretos da tabela
    const adminUser = {
      username: 'admin',
      email: 'admin@empresa.com',
      password: hashedPassword,
      role: 'admin'
    };

    console.log('📝 Dados do usuário:', adminUser);

    // Inserir usuário na tabela users
    const { data, error } = await supabase
      .from('users')
      .insert([adminUser])
      .select();

    if (error) {
      console.error('❌ Erro ao criar usuário:', error);
      return;
    }

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Senha: admin123');
    console.log('👤 Role:', adminUser.role);
    console.log('🆔 ID:', data[0]?.id);

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

createAdminUser();