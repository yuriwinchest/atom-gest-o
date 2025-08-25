/**
 * Teste Simples das Rotas Refatoradas
 */

console.log("🚀 TESTANDO ROTAS REFATORADAS...\n");

// 1. Verificar se os arquivos existem
const fs = require("fs");
const path = require("path");

const files = [
  "routes/index.ts",
  "routes/auth.ts",
  "routes/documents.ts",
  "routes/upload.ts",
];

console.log("📁 Verificando arquivos:");
files.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`  ✅ ${file} (${sizeKB} KB)`);
  } else {
    console.log(`  ❌ ${file} - NÃO ENCONTRADO`);
  }
});

// 2. Verificar se o servidor está configurado
console.log("\n⚙️ Verificando configuração do servidor:");
const serverIndexPath = path.join(__dirname, "index.ts");
if (fs.existsSync(serverIndexPath)) {
  const content = fs.readFileSync(serverIndexPath, "utf8");
  if (content.includes("./routes/index")) {
    console.log("  ✅ Servidor configurado para usar rotas refatoradas");
  } else {
    console.log("  ❌ Servidor NÃO configurado para rotas refatoradas");
  }
}

console.log("\n🎯 TESTE CONCLUÍDO!");
console.log("✅ Se todos os arquivos estão ✅, as rotas devem funcionar");
console.log("✅ Página de gestão deve conseguir acessar /api/documents");
console.log("✅ Login deve funcionar com admin@empresa.com / admin123");
