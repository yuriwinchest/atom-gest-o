// Script para testar o tracking de buscas
// Execute: node testar-tracking.mjs

import fetch from 'node-fetch';

async function testarTracking() {
  console.log('🧪 Testando tracking de buscas...\n');

  try {
    // 1. Testar busca simples
    console.log('1️⃣ Testando busca simples...');
    const response1 = await fetch('http://localhost:5000/api/documents/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Teste-Tracking/1.0'
      },
      body: JSON.stringify({
        query: 'teste-tracking',
        filters: {}
      })
    });

    console.log('Status da busca:', response1.status);
    const data1 = await response1.json();
    console.log('Resultados encontrados:', data1.length);
    console.log('✅ Busca realizada com sucesso\n');

    // 2. Aguardar um pouco
    console.log('⏳ Aguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Verificar se foi registrado no analytics
    console.log('2️⃣ Verificando se foi registrado no analytics...');
    const response2 = await fetch('http://localhost:5000/api/stats');
    const stats = await response2.json();
    
    console.log('📊 Estatísticas atuais:');
    console.log('- Documentos:', stats.documentos);
    console.log('- Visitas:', stats.visitantes);
    console.log('- Buscas:', stats.busca);
    console.log('- Downloads:', stats.downloads);

    if (stats.busca > 0) {
      console.log('✅ Tracking funcionando! Busca registrada.');
    } else {
      console.log('❌ Tracking não funcionando. Busca não registrada.');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testarTracking();
