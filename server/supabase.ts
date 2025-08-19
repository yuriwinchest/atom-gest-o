import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente - caminho correto
dotenv.config({ path: './config-supabase.env' });

// Log para debug
console.log('🔧 Supabase Config - Carregando variáveis...');
console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Configurada' : '❌ Não configurada');
console.log('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada');
console.log('   SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ Configurada' : '❌ Não configurada');

// Credenciais corretas e fixas do Supabase - PROJETO CORRETO
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_CrgokHl7x1arwFyvuzLM5w_v9GEP6iK';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Cliente anônimo (para operações públicas)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cliente administrativo (para operações que precisam bypass RLS)
export const supabaseAdmin = SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Test connection function
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('count')
      .limit(1);

    return !error;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
}

// Função para testar conexão administrativa
export async function testSupabaseAdminConnection(): Promise<boolean> {
  if (!supabaseAdmin) {
    console.error('Service key não configurada para conexão administrativa');
    return false;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('homepage_content')
      .select('count')
      .limit(1);

    return !error;
  } catch (error) {
    console.error('Supabase admin connection test failed:', error);
    return false;
  }
}

// Types for the files table based on documentation
export interface FileRecord {
  id: number;
  name: string;
  description?: string;
  file_type: string;
  file_path: string;
  file_size?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  user_id?: string;
  is_active: boolean;
  environment: string;
  metadata?: any;
}

export interface InsertFileRecord {
  name: string;
  description?: string;
  file_type: string;
  file_path: string;
  file_size?: number;
  tags?: string[];
  user_id?: string;
  is_active?: boolean;
  environment?: string;
  metadata?: any;
}