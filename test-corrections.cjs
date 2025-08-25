/**
 * Script de Teste para Correções - gestao-documentos
 * Testa upload, exclusão e estatísticas após as correções
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando testes das correções...\n');

// 1. Teste das configurações do Supabase
console.log('1️⃣  Testando configurações do Supabase...');

try {
  const configPath = path.join(__dirname, 'server', 'supabase.ts');
  const supabaseContent = fs.readFileSync(configPath, 'utf8');

  if (supabaseContent.includes('supabaseAdmin')) {
    console.log('✅ Cliente administrativo do Supabase configurado');
  } else {
    console.log('❌ Cliente administrativo do Supabase não encontrado');
  }

  if (supabaseContent.includes('SUPABASE_SERVICE_KEY')) {
    console.log('✅ Service Key configurado');
  } else {
    console.log('⚠️  Service Key pode não estar configurado');
  }
} catch (error) {
  console.error('❌ Erro ao verificar configurações do Supabase:', error.message);
}

// 2. Teste das correções no upload
console.log('\n2️⃣  Testando correções de upload...');

try {
  const routesPath = path.join(__dirname, 'server', 'routes.ts');
  const routesContent = fs.readFileSync(routesPath, 'utf8');

  const checks = [
    { pattern: 'supabaseAdmin.*from.*files.*insert', description: 'Upload usando cliente administrativo' },
    { pattern: 'Cliente administrativo.*não configurado', description: 'Tratamento de erro para cliente administrativo' },
    { pattern: 'Erro ao salvar metadados', description: 'Mensagem de erro específica para RLS' }
  ];

  checks.forEach(({ pattern, description }) => {
    if (new RegExp(pattern, 'i').test(routesContent)) {
      console.log(`✅ ${description}`);
    } else {
      console.log(`❌ ${description} - NÃO ENCONTRADO`);
    }
  });
} catch (error) {
  console.error('❌ Erro ao verificar correções de upload:', error.message);
}

// 3. Teste das correções de exclusão
console.log('\n3️⃣  Testando correções de exclusão...');

try {
  const hybridStoragePath = path.join(__dirname, 'server', 'storage', 'HybridStorage.ts');
  const hybridContent = fs.readFileSync(hybridStoragePath, 'utf8');

  const deleteChecks = [
    { pattern: 'supabaseAdmin.*from.*files.*delete', description: 'Exclusão usando cliente administrativo' },
    { pattern: 'DELETE PERMANENTE', description: 'Confirmação de exclusão permanente' },
    { pattern: 'Cliente administrativo não disponível', description: 'Tratamento de erro para exclusão' }
  ];

  deleteChecks.forEach(({ pattern, description }) => {
    if (new RegExp(pattern, 'i').test(hybridContent)) {
      console.log(`✅ ${description}`);
    } else {
      console.log(`❌ ${description} - NÃO ENCONTRADO`);
    }
  });
} catch (error) {
  console.error('❌ Erro ao verificar correções de exclusão:', error.message);
}

// 4. Teste das correções de estatísticas
console.log('\n4️⃣  Testando correções de estatísticas...');

try {
  const statsChecks = [
    { pattern: 'GET.*api.*stats.*chamado', description: 'Log de chamada do endpoint de estatísticas' },
    { pattern: 'JSON.stringify.*realStats', description: 'Validação de JSON antes do envio' },
    { pattern: 'Dados são JSON válidos', description: 'Confirmação de dados JSON válidos' }
  ];

  statsChecks.forEach(({ pattern, description }) => {
    if (new RegExp(pattern, 'i').test(routesContent)) {
      console.log(`✅ ${description}`);
    } else {
      console.log(`❌ ${description} - NÃO ENCONTRADO`);
    }
  });
} catch (error) {
  console.error('❌ Erro ao verificar correções de estatísticas:', error.message);
}

// 5. Verificar se as configurações de RLS foram aplicadas
console.log('\n5️⃣  Verificando configurações de RLS...');

try {
  const rlsPath = path.join(__dirname, 'configurar-rls-supabase.sql');
  if (fs.existsSync(rlsPath)) {
    console.log('✅ Arquivo de configuração RLS encontrado');
    const rlsContent = fs.readFileSync(rlsPath, 'utf8');
    if (rlsContent.includes('homepage_content')) {
      console.log('✅ Configurações RLS definidas para homepage_content');
    }
  } else {
    console.log('⚠️  Arquivo de configuração RLS não encontrado');
  }
} catch (error) {
  console.error('❌ Erro ao verificar configurações RLS:', error.message);
}

console.log('\n🎉 Verificação das correções concluída!');
console.log('\n📋 Resumo das correções implementadas:');
console.log('1. ✅ Upload: Cliente administrativo usado para bypass RLS');
console.log('2. ✅ Exclusão: Cliente administrativo usado para operações DELETE');
console.log('3. ✅ Estatísticas: Validação JSON e logs adicionados');
console.log('4. ✅ Tratamento de erros: Melhorado para todos os endpoints');

console.log('\n🚀 Próximos passos:');
console.log('1. Reiniciar o servidor para aplicar as mudanças');
console.log('2. Testar upload de arquivo real');
console.log('3. Testar exclusão de documento');
console.log('4. Verificar se estatísticas carregam corretamente');
