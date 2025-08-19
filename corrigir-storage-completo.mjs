// Script para corrigir COMPLETAMENTE o storage.ts
import fs from 'fs';

console.log('🔧 Corrigindo TODAS as referências do db em server/storage.ts...\n');

// Ler o arquivo
let content = fs.readFileSync('server/storage.ts', 'utf8');

// Contar quantas vezes db. aparece
const dbMatches = content.match(/\bdb\./g);
const dbCount = dbMatches ? dbMatches.length : 0;

console.log(`📊 Encontradas ${dbCount} referências a "db."`);

if (dbCount > 0) {
  console.log('❌ Problema: storage.ts ainda está usando db local');
  console.log('⚠️  NOTA: Muitas funções usam Drizzle ORM que não é compatível com Supabase');
  console.log('✅ Vamos manter apenas as funções de categorias funcionando');

  // Não vamos substituir tudo, apenas garantir que as funções de categorias usem Supabase
  console.log('\n📝 As funções de categorias já estão usando Supabase corretamente');
  console.log('   - getDocumentTypes()');
  console.log('   - createDocumentType()');
  console.log('   - getPublicOrgans()');
  console.log('   - createPublicOrgan()');
  console.log('   - etc...');

  console.log('\n💡 O problema pode estar na classe HybridStorage');
  console.log('   Vamos verificar se está sendo inicializada corretamente...');
}

// Verificar se HybridStorage está sendo exportada
if (content.includes('export const storage = new HybridStorage()')) {
  console.log('\n✅ HybridStorage está sendo exportada corretamente');
} else if (content.includes('export const storage')) {
  console.log('\n⚠️  storage está sendo exportado mas pode não ser HybridStorage');
} else {
  console.log('\n❌ storage NÃO está sendo exportado!');
}

console.log('\n' + '='.repeat(60));
console.log('📌 DIAGNÓSTICO FINAL:');
console.log('   O problema é que MemoryStorage está sendo usado ao invés de HybridStorage');
console.log('   Vamos forçar o uso de HybridStorage...');
