/**
 * Script simples para verificar correções
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Verificando correções aplicadas...\n");

// Verificar upload
const routesPath = path.join(__dirname, "server", "routes.ts");
const routesContent = fs.readFileSync(routesPath, "utf8");

if (routesContent.includes("supabaseAdmin.from('files').insert")) {
  console.log("✅ UPLOAD: Cliente administrativo usado");
} else {
  console.log("❌ UPLOAD: Cliente administrativo NÃO usado");
}

// Verificar exclusão
const hybridPath = path.join(
  __dirname,
  "server",
  "storage",
  "HybridStorage.ts"
);
const hybridContent = fs.readFileSync(hybridPath, "utf8");

if (hybridContent.includes("supabaseAdmin.from('files').delete")) {
  console.log("✅ DELETE: Cliente administrativo usado");
} else {
  console.log("❌ DELETE: Cliente administrativo NÃO usado");
}

// Verificar estatísticas
if (routesContent.includes("JSON.stringify(realStats)")) {
  console.log("✅ STATS: Validação JSON adicionada");
} else {
  console.log("❌ STATS: Validação JSON NÃO adicionada");
}

console.log("\n🎉 Verificação concluída!");
