import fetch from 'node-fetch';

console.log('🧪 TESTE DE EXIBIÇÃO DOS CARDS NA HOMEPAGE');
console.log('============================================');

async function testHomepageCards() {
  try {
    console.log('\n1️⃣ Testando API de cards públicos...');

    const response = await fetch('http://localhost:5000/api/homepage-content');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const cards = await response.json();
    console.log(`✅ Cards públicos encontrados: ${cards.length}`);

    cards.forEach((card, index) => {
      console.log(`\n   📋 Card ${index + 1}:`);
      console.log(`      ID: ${card.id}`);
      console.log(`      Título: "${card.title}"`);
      console.log(`      Descrição: "${card.description}"`);
      console.log(`      Seção: ${card.section}`);
      console.log(`      Imagem: ${card.image_url ? '✅ Sim' : '❌ Não'}`);
      console.log(`      Conteúdo: ${card.content ? '✅ Sim' : '❌ Não'}`);
      console.log(`      Destaque: ${card.featured ? '✅ Sim' : '❌ Não'}`);
      console.log(`      Publicado: ${card.is_published ? '✅ Sim' : '❌ Não'}`);

      if (card.image_url) {
        console.log(`      URL da imagem: ${card.image_url}`);
      }

      if (card.content) {
        console.log(`      Conteúdo completo: "${card.content}"`);
      }
    });

    console.log('\n2️⃣ Verificando se há cards com imagens...');
    const cardsWithImages = cards.filter(card => card.image_url);
    console.log(`✅ Cards com imagens: ${cardsWithImages.length}`);

    if (cardsWithImages.length > 0) {
      console.log('   As imagens devem aparecer na homepage!');
    } else {
      console.log('   ⚠️ Nenhum card tem imagem configurada');
    }

    console.log('\n3️⃣ Verificando se há cards com conteúdo completo...');
    const cardsWithContent = cards.filter(card => card.content);
    console.log(`✅ Cards com conteúdo completo: ${cardsWithContent.length}`);

    if (cardsWithContent.length > 0) {
      console.log('   O conteúdo completo deve aparecer ao clicar em "Ler mais"!');
    } else {
      console.log('   ⚠️ Nenhum card tem conteúdo completo configurado');
    }

    console.log('\n4️⃣ Verificando se há cards em destaque...');
    const featuredCards = cards.filter(card => card.featured);
    console.log(`✅ Cards em destaque: ${featuredCards.length}`);

    if (featuredCards.length > 0) {
      console.log('   Os cards em destaque devem ter badge especial!');
    } else {
      console.log('   ⚠️ Nenhum card está marcado como destaque');
    }

    console.log('\n🎯 RESULTADO DO TESTE:');
    if (cards.length > 0) {
      console.log('✅ A API está retornando cards corretamente');
      console.log('✅ Os cards devem aparecer na homepage com:');
      console.log('   - Título e descrição');
      console.log('   - Imagem (se configurada)');
      console.log('   - Conteúdo completo (ao expandir)');
      console.log('   - Badge de destaque (se aplicável)');
    } else {
      console.log('❌ Nenhum card encontrado na API');
      console.log('   Verifique se há cards publicados no painel administrativo');
    }

  } catch (error) {
    console.error('💥 Erro no teste:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 DICA: O servidor não está rodando na porta 5000');
      console.log('   Execute: npm run dev');
    }
  }
}

// Executar teste
testHomepageCards();
