#!/usr/bin/env node

/**
 * Servidor de Teste Simples
 * Verifica se a porta 5000 está livre
 */

import { createServer } from 'http';

console.log('🧪 TESTE DE SERVIDOR SIMPLES');
console.log('=============================\n');

console.log('🔍 Tentando criar servidor na porta 5000...');

try {
  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Teste de Servidor</title>
        </head>
        <body>
          <h1>✅ Servidor de Teste Funcionando!</h1>
          <p>Porta 5000 está livre e funcionando.</p>
          <p>Data: ${new Date().toLocaleString()}</p>
        </body>
      </html>
    `);
  });

  server.listen(5000, '0.0.0.0', () => {
    console.log('✅ Servidor de teste criado com sucesso!');
    console.log('🌐 Acesse: http://localhost:5000');
    console.log('📱 Porta 5000 está funcionando perfeitamente');

    console.log('\n🎯 DIAGNÓSTICO:');
    console.log('================');
    console.log('✅ Porta 5000 está livre');
    console.log('✅ Servidor HTTP funcionando');
    console.log('✅ Problema não é com a porta');

    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('====================');
    console.log('1. Este servidor está funcionando');
    console.log('2. O problema está no código principal');
    console.log('3. Verifique erros de sintaxe ou import');

    // Parar o servidor após 10 segundos
    setTimeout(() => {
      console.log('\n🔄 Parando servidor de teste...');
      server.close(() => {
        console.log('✅ Servidor de teste parado');
        console.log('🎯 Agora teste o servidor principal');
      });
    }, 10000);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log('❌ Porta 5000 ainda está em uso');
      console.log('💡 Execute: netstat -ano | findstr :5000');
      console.log('💡 Depois: taskkill /PID <PID> /F');
    } else {
      console.log('❌ Erro no servidor:', err.message);
    }
  });

} catch (error) {
  console.log('❌ Erro ao criar servidor:', error.message);
}

console.log('\n🎉 TESTE INICIADO!');
