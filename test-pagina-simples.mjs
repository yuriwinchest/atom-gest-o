#!/usr/bin/env node

import { createServer } from 'http';

console.log('🧪 TESTE DE PÁGINA SIMPLES');
console.log('============================\n');

console.log('🔍 Testando se a página está carregando...');

// Função para testar se a página está respondendo
async function testPageLoading() {
  try {
    console.log('📱 Fazendo requisição para a página...');

    const response = await fetch('http://localhost:5000/gestao-documentos', {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Headers: ${response.headers.get('content-type')}`);

    if (response.ok) {
      const html = await response.text();
      console.log(`✅ Tamanho da resposta: ${html.length} caracteres`);

      if (html.includes('Gestão de Documentos')) {
        console.log('✅ Página carregou corretamente!');
      } else {
        console.log('⚠️ Página carregou mas conteúdo pode estar incompleto');
      }
    } else {
      console.log(`❌ Erro HTTP: ${response.status}`);
    }

  } catch (error) {
    console.log('❌ Erro ao carregar página:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Servidor não está respondendo');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Host não encontrado');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Timeout na conexão');
    }
  }
}

// Função para testar com timeout
function testWithTimeout() {
  console.log('⏱️ Testando com timeout de 10 segundos...');

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout após 10 segundos')), 10000);
  });

  Promise.race([
    testPageLoading(),
    timeoutPromise
  ]).catch(error => {
    if (error.message.includes('Timeout')) {
      console.log('❌ Página não carregou dentro do tempo limite');
      console.log('💡 Possível problema:');
      console.log('   - Servidor muito lento');
      console.log('   - Página com muito JavaScript');
      console.log('   - Problema de rede');
    }
  });
}

// Executar teste
testWithTimeout();

console.log('\n🎉 TESTE INICIADO!');
console.log('💡 Verifique o console do navegador para erros JavaScript');
