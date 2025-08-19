// Testar chamando a API diretamente via HTTP
console.log('🔍 Testando API diretamente...\n');

try {
  const response = await fetch('http://localhost:5000/api/document-types');
  const data = await response.json();

  console.log(`📡 Status: ${response.status}`);
  console.log(`📊 Dados recebidos: ${Array.isArray(data) ? data.length + ' registros' : 'não é array'}`);

  if (Array.isArray(data) && data.length > 0) {
    console.log('\nPrimeiros 3 registros:');
    data.slice(0, 3).forEach(item => {
      console.log(`  - ${item.name} (ID: ${item.id})`);
    });
  } else if (Array.isArray(data) && data.length === 0) {
    console.log('\n❌ API retornou array vazio!');
    console.log('\n💡 Vamos verificar os logs do servidor...');
    console.log('   Procure por mensagens como:');
    console.log('   - "HybridStorage: Buscando tipos de documento"');
    console.log('   - "Erro ao buscar tipos de documento"');
  } else {
    console.log('\n❌ Resposta inesperada:', data);
  }
} catch (error) {
  console.log('❌ Erro ao chamar API:', error.message);
}

console.log('\n' + '='.repeat(60));
console.log('📌 PRÓXIMO PASSO:');
console.log('   Olhe o terminal do servidor e veja se apareceu alguma mensagem de erro!');