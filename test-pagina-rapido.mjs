#!/usr/bin/env node

console.log('🧪 TESTE RÁPIDO DA PÁGINA');
console.log('===========================\n');

console.log('🔍 Testando página simplificada...');

// Teste simples com fetch
fetch('http://localhost:5000/gestao-documentos')
  .then(response => {
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Content-Type: ${response.headers.get('content-type')}`);
    return response.text();
  })
  .then(html => {
    console.log(`✅ Tamanho: ${html.length} caracteres`);
    
    if (html.includes('🎉 Sistema Restaurado com Sucesso!')) {
      console.log('✅ PÁGINA FUNCIONANDO PERFEITAMENTE!');
      console.log('✅ Conteúdo carregado corretamente!');
    } else if (html.includes('Gestão de Documentos')) {
      console.log('⚠️ Página carregou mas pode ter problemas');
    } else {
      console.log('❌ Página não carregou corretamente');
      console.log('💡 Primeiros 200 caracteres:', html.substring(0, 200));
    }
  })
  .catch(error => {
    console.log('❌ Erro:', error.message);
  });

console.log('\n🎉 TESTE INICIADO!');
