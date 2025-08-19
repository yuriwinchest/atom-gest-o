// Script para corrigir o storage.ts
import fs from 'fs';

console.log('🔧 Corrigindo server/storage.ts...\n');

// Ler o arquivo
const content = fs.readFileSync('server/storage.ts', 'utf8');

// Verificar se está usando o db errado
if (content.includes('import { db } from "./db"')) {
  console.log('❌ Problema encontrado: storage.ts está importando db local');

  // Substituir a importação
  let newContent = content.replace(
    'import { db } from "./db";',
    '// import { db } from "./db"; // Removido - usando Supabase diretamente'
  );

  // Salvar o arquivo corrigido
  fs.writeFileSync('server/storage.ts', newContent);
  console.log('✅ Arquivo corrigido!');
  console.log('📌 Agora reinicie o servidor (Ctrl+C e npm run dev)');
} else {
  console.log('✅ O arquivo já está correto');
}
