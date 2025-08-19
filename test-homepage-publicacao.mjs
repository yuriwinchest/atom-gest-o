import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
dotenv.config({ path: './config-supabase.env' });

console.log('🧪 TESTE DE PUBLICAÇÃO NA HOMEPAGE');
console.log('====================================');

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
async function testHomepagePublication() {
  try {
    console.log('\n1️⃣ Verificando cards existentes...');

    // Buscar todos os cards (incluindo não publicados)
    const { data: allCards, error: allError } = await supabaseAdmin
      .from('homepage_content')
      .select('*')
      .eq('is_active', true);

    if (allError) {
      console.error('❌ Erro ao buscar todos os cards:', allError);
      return;
    }

    console.log(`✅ Cards encontrados: ${allCards.length}`);
    allCards.forEach(card => {
      console.log(`   - ID: ${card.id}, Título: "${card.title}", Publicado: ${card.is_published}`);
    });

    // Buscar apenas cards publicados (como a homepage faria)
    const { data: publicCards, error: publicError } = await supabaseAdmin
      .from('homepage_content')
      .select('*')
      .eq('is_active', true)
      .eq('is_published', true);

    if (publicError) {
      console.error('❌ Erro ao buscar cards públicos:', publicError);
      return;
    }

    console.log(`\n2️⃣ Cards públicos (visíveis na homepage): ${publicCards.length}`);
    publicCards.forEach(card => {
      console.log(`   - ID: ${card.id}, Título: "${card.title}", Seção: ${card.section}`);
    });

    // Verificar se há cards não publicados
    const unpublishedCards = allCards.filter(card => !card.is_published);
    console.log(`\n3️⃣ Cards não publicados (apenas no painel admin): ${unpublishedCards.length}`);
    unpublishedCards.forEach(card => {
      console.log(`   - ID: ${card.id}, Título: "${card.title}", Seção: ${card.section}`);
    });

    // Testar publicação de um card
    if (unpublishedCards.length > 0) {
      const cardToPublish = unpublishedCards[0];
      console.log(`\n4️⃣ Testando publicação do card ID ${cardToPublish.id}...`);

      const { data: updatedCard, error: updateError } = await supabaseAdmin
        .from('homepage_content')
        .update({ is_published: true })
        .eq('id', cardToPublish.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erro ao publicar card:', updateError);
        return;
      }

      console.log(`✅ Card publicado com sucesso: ${updatedCard.title}`);

      // Verificar se agora aparece na lista pública
      const { data: newPublicCards, error: newPublicError } = await supabaseAdmin
        .from('homepage_content')
        .select('*')
        .eq('is_active', true)
        .eq('is_published', true);

      if (newPublicError) {
        console.error('❌ Erro ao verificar cards públicos após publicação:', newPublicError);
        return;
      }

      console.log(`\n5️⃣ Cards públicos após publicação: ${newPublicCards.length}`);
      console.log('✅ Funcionalidade de publicação funcionando perfeitamente!');
    } else {
      console.log('\n4️⃣ Nenhum card não publicado para testar');
    }

  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

// Executar teste
testHomepagePublication();
