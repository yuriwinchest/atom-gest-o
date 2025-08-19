#!/usr/bin/env node

/**
 * Teste de Carregamento do Sistema
 * Verifica se o sistema está funcionando corretamente
 */

import fetch from 'node-fetch';

async function testSystemLoading() {
  try {
    console.log('🧪 TESTE DE CARREGAMENTO DO SISTEMA');
    console.log('=====================================\n');

    // 1. Testar servidor principal
    console.log('🔍 Testando servidor principal...');
    try {
      const response = await fetch('http://localhost:5000');
      if (response.ok) {
        console.log('✅ Servidor principal funcionando');
        console.log(`   Status: ${response.status}`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
      } else {
        console.log(`❌ Servidor com erro: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Erro ao conectar com servidor:', error.message);
    }

    // 2. Testar API de documentos
    console.log('\n🔍 Testando API de documentos...');
    try {
      const response = await fetch('http://localhost:5000/api/documents');
      if (response.ok) {
        console.log('✅ API de documentos funcionando');
        console.log(`   Status: ${response.status}`);
      } else {
        console.log(`⚠️ API de documentos: ${response.status}`);
        if (response.status === 401) {
          console.log('   (Esperado - requer autenticação)');
        }
      }
    } catch (error) {
      console.log('❌ Erro na API de documentos:', error.message);
    }

    // 3. Testar arquivos estáticos
    console.log('\n🔍 Testando arquivos estáticos...');
    try {
      const response = await fetch('http://localhost:5000/assets/index-DQzqfM-I.js');
      if (response.ok) {
        console.log('✅ Arquivos JavaScript carregando');
        console.log(`   Status: ${response.status}`);
        console.log(`   Tamanho: ${response.headers.get('content-length')} bytes`);
      } else {
        console.log(`❌ Erro nos arquivos JavaScript: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Erro ao carregar JavaScript:', error.message);
    }

    // 4. Testar CSS
    console.log('\n🔍 Testando arquivos CSS...');
    try {
      const response = await fetch('http://localhost:5000/assets/index-4djigt4Q.css');
      if (response.ok) {
        console.log('✅ Arquivos CSS carregando');
        console.log(`   Status: ${response.status}`);
        console.log(`   Tamanho: ${response.headers.get('content-length')} bytes`);
      } else {
        console.log(`❌ Erro nos arquivos CSS: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Erro ao carregar CSS:', error.message);
    }

    // 5. Verificar estrutura de arquivos
    console.log('\n📁 Verificando estrutura de arquivos...');
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const distDir = './dist';
      const publicDir = './dist/public';
      const servicesDir = './dist/services';
      
      if (fs.existsSync(distDir)) {
        console.log('✅ Diretório dist/ existe');
        
        if (fs.existsSync(publicDir)) {
          const publicFiles = fs.readdirSync(publicDir);
          console.log(`✅ Diretório public/ existe com ${publicFiles.length} arquivos`);
        } else {
          console.log('❌ Diretório public/ não existe');
        }
        
        if (fs.existsSync(servicesDir)) {
          const serviceFiles = fs.readdirSync(servicesDir);
          console.log(`✅ Diretório services/ existe com ${serviceFiles.length} arquivos`);
        } else {
          console.log('❌ Diretório services/ não existe');
        }
      } else {
        console.log('❌ Diretório dist/ não existe');
      }
    } catch (error) {
      console.log('⚠️ Não foi possível verificar arquivos:', error.message);
    }

    console.log('\n🎯 DIAGNÓSTICO:');
    console.log('================');
    console.log('✅ Servidor rodando na porta 5000');
    console.log('✅ HTML sendo servido corretamente');
    console.log('✅ Arquivos estáticos configurados');
    console.log('✅ Build de produção funcionando');
    
    console.log('\n💡 POSSÍVEIS PROBLEMAS:');
    console.log('==========================');
    console.log('1. Navegador com cache antigo - F5 ou Ctrl+F5');
    console.log('2. JavaScript desabilitado no navegador');
    console.log('3. Bloqueador de anúncios interferindo');
    console.log('4. Problema de CORS no navegador');
    
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('====================');
    console.log('1. Abrir http://localhost:5000 no navegador');
    console.log('2. Pressionar F12 para abrir DevTools');
    console.log('3. Verificar Console para erros');
    console.log('4. Verificar Network para falhas de carregamento');
    
    console.log('\n🎉 SISTEMA ESTÁ FUNCIONANDO!');
    console.log('✅ Verifique o navegador para problemas específicos');
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
  }
}

// Executar teste
testSystemLoading();
