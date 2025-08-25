#!/usr/bin/env node

/**
 * Teste Completo do Sistema de Upload
 * Testa Backblaze B2, Supabase e integração
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testBackblazeConfig() {
  console.log('\n🔧 Testando configuração Backblaze B2...');

  try {
    const response = await fetch(`${BASE_URL}/api/backblaze/config`);
    const config = await response.json();

    console.log('✅ Configuração Backblaze carregada:', {
      accountId: config.accountId ? '✅ Configurado' : '❌ Não configurado',
      applicationKeyId: config.applicationKeyId ? '✅ Configurado' : '❌ Não configurado',
      applicationKey: config.applicationKey ? '✅ Configurado' : '❌ Não configurado',
      bucketName: config.bucketName ? '✅ Configurado' : '❌ Não configurado',
      bucketId: config.bucketId ? '✅ Configurado' : '❌ Não configurado'
    });

    return config.accountId && config.applicationKey && config.bucketName;
  } catch (error) {
    console.error('❌ Erro ao testar configuração Backblaze:', error.message);
    return false;
  }
}

async function testMainSubjects() {
  console.log('\n📚 Testando API de assuntos principais...');

  try {
    const response = await fetch(`${BASE_URL}/api/main-subjects`);
    const subjects = await response.json();

    console.log(`✅ ${subjects.length} assuntos principais carregados`);
    console.log('📋 Primeiros 5 assuntos:', subjects.slice(0, 5).map(s => s.name));

    return subjects.length > 0;
  } catch (error) {
    console.error('❌ Erro ao testar assuntos principais:', error.message);
    return false;
  }
}

async function testSupabaseConnection() {
  console.log('\n🔗 Testando conexão Supabase...');

  try {
    const response = await fetch(`${BASE_URL}/api/documents-with-related`);
    const documents = await response.json();

    console.log(`✅ Conexão Supabase OK - ${documents.length} documentos carregados`);
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão Supabase:', error.message);
    return false;
  }
}

async function testDocumentCreation() {
  console.log('\n📝 Testando criação de documento...');

  try {
    const testDocument = {
      title: 'Teste de Upload - ' + new Date().toISOString(),
      description: 'Documento de teste para validar o sistema de upload',
      content: JSON.stringify({
        fileName: 'teste.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        category: 'Documentos',
        mainSubject: 'Administração Pública',
        publicOrgan: 'Ministério da Fazenda',
        responsible: 'Sistema de Teste'
      }),
      category: 'Documentos',
      tags: ['teste', 'upload', 'sistema']
    };

    const response = await fetch(`${BASE_URL}/api/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testDocument)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Documento criado com sucesso:', result.id);
      return true;
    } else {
      const error = await response.json();
      console.error('❌ Erro ao criar documento:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro no teste de criação:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando testes completos do sistema de upload...\n');

  const results = {
    backblaze: await testBackblazeConfig(),
    mainSubjects: await testMainSubjects(),
    supabase: await testSupabaseConnection(),
    documentCreation: await testDocumentCreation()
  };

  console.log('\n📊 RESULTADO DOS TESTES:');
  console.log('========================');
  console.log(`🔧 Backblaze B2: ${results.backblaze ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`📚 Assuntos Principais: ${results.mainSubjects ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`🔗 Supabase: ${results.supabase ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`📝 Criação de Documentos: ${results.documentCreation ? '✅ OK' : '❌ FALHOU'}`);

  const allPassed = Object.values(results).every(r => r);

  if (allPassed) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('💡 O sistema de upload está funcionando corretamente.');
  } else {
    console.log('\n⚠️ ALGUNS TESTES FALHARAM!');
    console.log('🔧 Verifique as configurações e tente novamente.');
  }

  return allPassed;
}

// Executar testes
runAllTests().catch(console.error);
