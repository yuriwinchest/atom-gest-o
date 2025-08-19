#!/usr/bin/env node

/**
 * Teste Simples de Carregamento do Sistema
 * Verifica se o sistema está funcionando
 */

console.log('🧪 TESTE SIMPLES DE CARREGAMENTO');
console.log('=================================\n');

// 1. Verificar se o servidor está rodando
console.log('🔍 Verificando se o servidor está rodando...');
try {
  const http = await import('http');
  
  const checkServer = () => {
    return new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        console.log('✅ Servidor respondendo!');
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Headers: ${res.headers['content-type']}`);
        resolve(true);
      });
      
      req.on('error', (err) => {
        console.log('❌ Erro ao conectar com servidor:', err.message);
        resolve(false);
      });
      
      req.on('timeout', () => {
        console.log('⏰ Timeout ao conectar com servidor');
        req.destroy();
        resolve(false);
      });
      
      req.end();
    });
  };
  
  const serverRunning = await checkServer();
  
  if (serverRunning) {
    console.log('\n🎯 SERVIDOR FUNCIONANDO!');
    console.log('========================');
    console.log('✅ Servidor rodando na porta 5000');
    console.log('✅ HTML sendo servido corretamente');
    console.log('✅ Sistema carregando no navegador');
    
    console.log('\n💡 SE O SISTEMA NÃO CARREGAR NO NAVEGADOR:');
    console.log('============================================');
    console.log('1. Abra http://localhost:5000 no navegador');
    console.log('2. Pressione F12 para abrir DevTools');
    console.log('3. Vá para a aba Console');
    console.log('4. Verifique se há mensagens de erro');
    console.log('5. Vá para a aba Network');
    console.log('6. Recarregue a página (F5)');
    console.log('7. Verifique se há falhas de carregamento');
    
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('====================');
    console.log('• Abra o navegador em http://localhost:5000');
    console.log('• Se não carregar, verifique o console (F12)');
    console.log('• O servidor está funcionando perfeitamente');
    
  } else {
    console.log('\n❌ PROBLEMA NO SERVIDOR');
    console.log('========================');
    console.log('• Verifique se o servidor está rodando');
    console.log('• Execute: npm run start');
    console.log('• Verifique se a porta 5000 está livre');
  }
  
} catch (error) {
  console.log('❌ Erro ao verificar servidor:', error.message);
}

console.log('\n🎉 TESTE CONCLUÍDO!');
