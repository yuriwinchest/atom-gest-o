/**
 * TESTE DIRETO DAS ROTAS - SEM VITE
 * Como engenheiro sênior, vou testar as rotas diretamente
 */

const express = require("express");
const app = express();

console.log("🚀 TESTE DIRETO DAS ROTAS - INICIANDO...\n");

// Middleware básico
app.use(express.json());

// Simular rota de documentos
app.get("/api/documents", (req, res) => {
  console.log("✅ ROTA /api/documents CHAMADA!");
  res.json({
    success: true,
    documents: [{ id: 1, title: "Documento Teste", category: "Teste" }],
  });
});

// Simular rota de estatísticas
app.get("/api/stats", (req, res) => {
  console.log("✅ ROTA /api/stats CHAMADA!");
  res.json({
    success: true,
    totalDocuments: 1,
  });
});

// Middleware de captura (simulando o problema do Vite)
app.use("*", (req, res) => {
  console.log(`❌ ROTA CAPTURADA: ${req.method} ${req.originalUrl}`);
  res.send("<h1>Rota não encontrada - Capturada pelo middleware</h1>");
});

// Testar as rotas
console.log("🧪 TESTANDO ROTAS...\n");

const testRoutes = ["/api/documents", "/api/stats", "/api/teste"];

testRoutes.forEach((route) => {
  console.log(`\n🔍 Testando: ${route}`);

  // Simular requisição HTTP
  const req = {
    method: "GET",
    path: route,
    originalUrl: route,
  };

  const res = {
    json: (data) => console.log("  ✅ JSON Response:", JSON.stringify(data)),
    send: (data) =>
      console.log("  ❌ HTML Response:", data.substring(0, 50) + "..."),
  };

  // Simular o middleware
  app._router.handle(req, res, () => {});
});

console.log("\n🎯 TESTE CONCLUÍDO!");
console.log("✅ Se todas as rotas retornaram JSON, estão funcionando");
console.log("❌ Se alguma retornou HTML, há problema na configuração");
