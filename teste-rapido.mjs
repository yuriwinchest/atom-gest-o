// Teste rápido da API
console.log('🔍 Testando API...');

try {
  const response = await fetch('http://localhost:5000/api/document-types');
  const data = await response.json();

  console.log(`Status: ${response.status}`);
  console.log(`Dados: ${Array.isArray(data) ? data.length + ' registros' : 'não é array'}`);

  if (Array.isArray(data) && data.length > 0) {
    console.log('✅ SUCESSO! Primeiros 3:', data.slice(0, 3).map(d => d.name));
  } else {
    console.log('❌ Ainda vazio!');
  }
} catch (err) {
  console.log('❌ Erro:', err.message);
}
