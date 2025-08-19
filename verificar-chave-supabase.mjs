import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
dotenv.config({ path: './config-supabase.env' });

console.log('🔑 VERIFICAÇÃO DA CHAVE SUPABASE');
console.log('================================');

// Verificar variáveis
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

console.log('📋 Configurações:');
console.log('   URL:', SUPABASE_URL);
console.log('   Service Key:', SUPABASE_SERVICE_KEY ? '✅ Configurada' : '❌ Não configurada');
console.log('   Anon Key:', SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada');

// Decodificar JWT (sem verificar assinatura)
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch (error) {
    return null;
  }
}

// Verificar chave de serviço
if (SUPABASE_SERVICE_KEY) {
  console.log('\n🔍 DECODIFICANDO SERVICE KEY:');
  const decoded = decodeJWT(SUPABASE_SERVICE_KEY);

  if (decoded) {
    console.log('   ✅ JWT válido');
    console.log('   📝 Payload:');
    console.log('      iss:', decoded.iss);
    console.log('      ref:', decoded.ref);
    console.log('      role:', decoded.role);
    console.log('      iat:', new Date(decoded.iat * 1000).toISOString());
    console.log('      exp:', new Date(decoded.exp * 1000).toISOString());

    // Verificar se não expirou
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp > now) {
      console.log('   ✅ Chave não expirou');
    } else {
      console.log('   ❌ Chave EXPIRADA!');
    }

    // Verificar role
    if (decoded.role === 'service_role') {
      console.log('   ✅ Role correto: service_role');
    } else {
      console.log('   ❌ Role incorreto:', decoded.role);
    }

    // Verificar se é o projeto correto
    if (decoded.ref === 'xwrnhpqzbhwiqasuywjo') {
      console.log('   ✅ Projeto correto');
    } else {
      console.log('   ❌ Projeto incorreto:', decoded.ref);
    }

  } else {
    console.log('   ❌ JWT inválido');
  }
}

// Testar conexão com service key
async function testServiceKey() {
  if (!SUPABASE_SERVICE_KEY) {
    console.log('\n❌ Service key não configurada para teste');
    return false;
  }

  try {
    console.log('\n🧪 TESTANDO CONEXÃO COM SERVICE KEY...');

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Testar listagem de tabelas
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('homepage_content')
      .select('count')
      .limit(1);

    if (tablesError) {
      console.error('❌ Erro ao acessar tabela:', tablesError);
      return false;
    }

    console.log('✅ Conexão com service key funcionando');
    console.log('✅ Pode acessar tabelas sem problemas de RLS');

    // Testar storage
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Erro ao acessar storage:', bucketsError);
      return false;
    }

    console.log('✅ Storage acessível');
    console.log('📁 Buckets:', buckets?.map(b => b.id) || []);

    return true;

  } catch (error) {
    console.error('💥 Erro no teste:', error);
    return false;
  }
}

// Testar conexão com anon key
async function testAnonKey() {
  if (!SUPABASE_ANON_KEY) {
    console.log('\n❌ Anon key não configurada para teste');
    return false;
  }

  try {
    console.log('\n🧪 TESTANDO CONEXÃO COM ANON KEY...');

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Testar listagem de tabelas (deve falhar por RLS)
    const { data: tables, error: tablesError } = await supabase
      .from('homepage_content')
      .select('count')
      .limit(1);

    if (tablesError) {
      console.log('✅ Anon key funcionando (RLS bloqueando como esperado)');
      console.log('   Erro esperado:', tablesError.message);
    } else {
      console.log('⚠️ Anon key pode estar com permissões muito amplas');
    }

    return true;

  } catch (error) {
    console.error('💥 Erro no teste da anon key:', error);
    return false;
  }
}

// Executar testes
async function runTests() {
  console.log('\n🚀 INICIANDO TESTES...');

  const serviceKeyOk = await testServiceKey();
  const anonKeyOk = await testAnonKey();

  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('   Service Key:', serviceKeyOk ? '✅ FUNCIONANDO' : '❌ FALHOU');
  console.log('   Anon Key:', anonKeyOk ? '✅ FUNCIONANDO' : '❌ FALHOU');

  if (serviceKeyOk) {
    console.log('\n🎉 A chave de serviço está funcionando perfeitamente!');
    console.log('✅ Pode fazer upload e operações CRUD sem problemas de RLS');
  } else {
    console.log('\n❌ Problema com a chave de serviço');
    console.log('💡 Verifique se a chave está correta no painel do Supabase');
  }
}

runTests();
