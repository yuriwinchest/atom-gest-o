console.log('🧪 Testando funcionalidade de palavras-chave...\n');

// Simular o comportamento do campo
function testarSeparacao(texto) {
  console.log(`📝 Texto original: "${texto}"`);

  // Separar por vírgula e limpar espaços
  const keywords = texto
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);

  console.log(`🔍 Palavras separadas: [${keywords.map(k => `"${k}"`).join(', ')}]`);
  console.log(`📊 Total de palavras: ${keywords.length}`);

  // Simular como ficaria no campo após separação
  const textoFormatado = keywords.join(', ');
  console.log(`✨ Texto formatado: "${textoFormatado}"`);

  console.log('---');
  return keywords;
}

// Testes
testarSeparacao('TESTE, TESTE1, TESTE3');
testarSeparacao('administração, legislação, política');
testarSeparacao('sistema, CRUD, PostgreSQL, interface');
testarSeparacao('palavra1, palavra2, palavra3, palavra4');

console.log('✅ Teste concluído!');
