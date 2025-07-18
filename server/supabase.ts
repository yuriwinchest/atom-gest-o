import { createClient } from '@supabase/supabase-js';

// Credenciais corretas e fixas do Supabase
const SUPABASE_URL = 'https://fbqocpozjmuzrdeacktb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTY3ODYsImV4cCI6MjA2NTQzMjc4Nn0.nZPmcY4QtgnZ0K68TW2VlrQm4gyqodQUxgrWDechhhY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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