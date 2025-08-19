import { createClient } from '@supabase/supabase-js';

// Credenciais corretas do Supabase - PROJETO ATUAL
const SUPABASE_URL = 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CrgokHl7x1arwFyvuzLM5w_v9GEP6iK';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection function
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('homepage_content')
      .select('count')
      .limit(1);

    return !error;
  } catch (error) {
    console.error('Erro na conexão Supabase:', error);
    return false;
  }
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };