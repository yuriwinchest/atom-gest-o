// Script para debug do tracking de buscas
// Execute: node debug-tracking.mjs

import fetch from 'node-fetch';

async function debugTracking() {
  console.log('🔍 Debug do tracking de buscas...\n');

  try {
    // 1. Verificar se o servidor está rodando
    console.log('1️⃣ Verificando servidor...');
    const healthCheck = await fetch('http://localhost:5000/api/stats');
    console.log('Status do servidor:', healthCheck.status);

    if (healthCheck.status !== 200) {
      console.log('❌ Servidor não está respondendo corretamente');
      return;
    }

    // 2. Fazer uma busca
    console.log('\n2️⃣ Fazendo busca...');
    const searchResponse = await fetch('http://localhost:5000/api/documents/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Debug-Tracking/1.0'
      },
      body: JSON.stringify({
        query: 'debug-tracking',
        filters: {}
      })
    });

    console.log('Status da busca:', searchResponse.status);
    const searchData = await searchResponse.json();
    console.log('Resultados da busca:', searchData.length);

    // 3. Aguardar um pouco
    console.log('\n3️⃣ Aguardando 3 segundos...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4. Verificar estatísticas
    console.log('\n4️⃣ Verificando estatísticas...');
    const statsResponse = await fetch('http://localhost:5000/api/stats');
    const stats = await statsResponse.json();

    console.log('📊 Estatísticas após busca:');
    console.log('- Documentos:', stats.documentos);
    console.log('- Visitas:', stats.visitantes);
    console.log('- Buscas:', stats.busca);
    console.log('- Downloads:', stats.downloads);

    // 5. Verificar se houve mudança
    if (stats.busca > 0) {
      console.log('\n✅ SUCESSO! Tracking está funcionando!');
    } else {
      console.log('\n❌ FALHA! Tracking não está funcionando.');
      console.log('Possíveis causas:');
      console.log('- Erro na inserção no banco');
      console.log('- Cache do servidor');
      console.log('- Problema no AnalyticsTracker');
    }

  } catch (error) {
    console.error('❌ Erro no debug:', error.message);
  }
}

debugTracking();
