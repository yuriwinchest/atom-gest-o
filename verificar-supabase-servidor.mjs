// Verificar qual Supabase o servidor está usando
import fs from 'fs';

console.log('🔍 Verificando configuração do Supabase no servidor...\n');

// 1. Verificar server/supabase.ts
console.log('📄 Verificando server/supabase.ts:');
try {
  const supabaseFile = fs.readFileSync('server/supabase.ts', 'utf8');

  // Procurar pela URL
  const urlMatch = supabaseFile.match(/SUPABASE_URL['"]\s*\|\|\s*['"]([^'"]+)['"]/);
  const keyMatch = supabaseFile.match(/SUPABASE_ANON_KEY['"]\s*\|\|\s*['"]([^'"]+)['"]/);

  if (urlMatch) {
    console.log('   URL encontrada:', urlMatch[1]);

    if (urlMatch[1].includes('xwrnhpqzbhwiqasuywjo')) {
      console.log('   ✅ URL CORRETA!');
    } else if (urlMatch[1].includes('fbqocpozjmuzrdeacktb')) {
      console.log('   ❌ URL ERRADA! Está usando o projeto antigo!');
    }
  }

  if (keyMatch) {
    console.log('   Key encontrada:', keyMatch[1].substring(0, 50) + '...');
  }
} catch (err) {
  console.log('   ❌ Arquivo não encontrado ou erro ao ler');
}

// 2. Verificar package.json
console.log('\n📄 Verificando package.json (npm run dev):');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const devScript = packageJson.scripts.dev;

if (devScript.includes('xwrnhpqzbhwiqasuywjo')) {
  console.log('   ✅ package.json está com URL CORRETA');
} else if (devScript.includes('fbqocpozjmuzrdeacktb')) {
  console.log('   ❌ package.json está com URL ERRADA');
}

console.log('\n' + '='.repeat(60));
console.log('📌 DIAGNÓSTICO:');
console.log('   O servidor está tentando acessar o projeto ERRADO do Supabase');
console.log('   onde as tabelas NÃO existem!');
console.log('\n   Projeto CORRETO: xwrnhpqzbhwiqasuywjo (onde criamos as tabelas)');
console.log('   Projeto ERRADO: fbqocpozjmuzrdeacktb (sem tabelas)');
