import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwrnhpqzbhwiqasuywjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cm5ocHF6Ymh3aXFhc3V5d2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTIxMTYsImV4cCI6MjA2NjU4ODExNn0.6-jfb70OUjegikt8zBWmZGzcb6QZ-4jJiEXaxsVWez4';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Testando busca direta no Supabase...\n');

const { data, error } = await supabase
  .from('document_types')
  .select('*');

if (error) {
  console.log('❌ Erro:', error.message);
} else {
  console.log('✅ Dados encontrados:', data.length, 'registros');
  console.log(JSON.stringify(data, null, 2));
}
