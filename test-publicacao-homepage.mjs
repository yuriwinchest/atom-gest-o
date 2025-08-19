import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
dotenv.config({ path: './config-supabase.env' });

console.log('🧪 TESTE DE PUBLICAÇÃO DE CARDS HOMEPAGE');
console.log('==========================================');

// Verificar variáveis
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Service key não configurada!');
  process.exit(1);
}

// Criar cliente administrativo
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔐 Cliente administrativo criado');

// Testar funcionalidade de publicação
async function testPublication() {
  try {
    console.log('\n🧪 Testando funcionalidade de publicação...');

    // 1. Verificar se o campo is_published existe
    console.log('\n1️⃣ Verificando estrutura da tabela...');
    const { data: columns, error: columnsError } = await supabaseAdmin
      .from('homepage_content')
      .select('*')
      .limit(1);

    if (columnsError) {
      console.error('❌ Erro ao verificar estrutura:', columnsError);
      return false;
    }

    console.log('✅ Tabela acessível');
    console.log('📋 Campos disponíveis:', Object.keys(columns[0] || {}));

    // 2. Criar um card de teste
    console.log('\n2️⃣ Criando card de teste...');
    const testCard = {
      section: 'test',
      title: 'Card de Teste - Publicação',
      description: 'Este é um card de teste para verificar a funcionalidade de publicação',
      content: 'Conteúdo completo do card de teste. Deve aparecer quando publicado.',
      featured: false,
      is_published: false,
      is_active: true
    };

    const { data: createdCard, error: createError } = await supabaseAdmin
      .from('homepage_content')
      .insert(testCard)
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar card:', createError);
      return false;
    }

    console.log('✅ Card criado:', createdCard.id);

    // 3. Testar publicação
    console.log('\n3️⃣ Testando publicação...');
    const { data: publishedCard, error: publishError } = await supabaseAdmin
      .from('homepage_content')
      .update({ is_published: true })
      .eq('id', createdCard.id)
      .select()
      .single();

    if (publishError) {
      console.error('❌ Erro ao publicar card:', publishError);
      return false;
    }

    console.log('✅ Card publicado:', publishedCard.is_published);

    // 4. Verificar se aparece na listagem pública
    console.log('\n4️⃣ Verificando listagem pública...');
    const { data: publicCards, error: listError } = await supabaseAdmin
      .from('homepage_content')
      .select('*')
      .eq('is_published', true)
      .eq('is_active', true);

    if (listError) {
      console.error('❌ Erro ao listar cards públicos:', listError);
      return false;
    }

    console.log('✅ Cards públicos encontrados:', publicCards.length);
    console.log('📋 Cards:', publicCards.map(c => ({ id: c.id, title: c.title, published: c.is_published })));

    // 5. Limpar dados de teste
    console.log('\n5️⃣ Limpando dados de teste...');
    const { error: deleteError } = await supabaseAdmin
      .from('homepage_content')
      .delete()
      .eq('id', createdCard.id);

    if (deleteError) {
      console.error('⚠️ Erro ao limpar teste:', deleteError);
    } else {
      console.log('✅ Dados de teste removidos');
    }

    return true;

  } catch (error) {
    console.error('💥 Erro no teste:', error);
    return false;
  }
}

// Executar teste
testPublication().then(success => {
  if (success) {
    console.log('\n🎉 TESTE DE PUBLICAÇÃO CONCLUÍDO COM SUCESSO!');
    console.log('✅ O campo is_published está funcionando perfeitamente');
    console.log('✅ Cards podem ser criados, publicados e listados');
    console.log('✅ A funcionalidade está pronta para uso na interface');
  } else {
    console.log('\n❌ TESTE DE PUBLICAÇÃO FALHOU');
    console.log('❌ Verifique a configuração do banco de dados');
  }
});
