/**
 * Teste de Debug das Rotas
 */

console.log("🚀 TESTANDO REGISTRO DAS ROTAS...\n");

// Simular o que acontece no servidor
const express = require("express");
const app = express();

// Simular o registro de rotas
console.log("📋 1. Registrando rotas...");

// Middleware para capturar todas as rotas
app.use("/api/*", (req, res, next) => {
  console.log(`🔒 API ROUTE PROTECTED: ${req.method} ${req.path}`);
  next();
});

// Simular rotas de documentos
app.get("/api/documents", (req, res) => {
  console.log("✅ ROTA /api/documents FUNCIONANDO!");
  res.json({ message: "Documentos carregados", count: 0 });
});

// Simular rota de estatísticas
app.get("/api/stats", (req, res) => {
  console.log("✅ ROTA /api/stats FUNCIONANDO!");
  res.json({ message: "Estatísticas carregadas" });
});

// Simular rota de autenticação
app.get("/api/auth/me", (req, res) => {
  console.log("✅ ROTA /api/auth/me FUNCIONANDO!");
  res.json({ message: "Usuário autenticado" });
});

// Middleware de captura (simulando o Vite)
app.use("*", (req, res) => {
  console.log(`❌ ROTA CAPTURADA PELO VITE: ${req.method} ${req.originalUrl}`);
  res.send("<h1>Rota não encontrada - Capturada pelo Vite</h1>");
});

// Testar as rotas
console.log("\n🧪 2. Testando rotas...");

// Simular requisições
const testRoutes = [
  "/api/documents",
  "/api/stats",
  "/api/auth/me",
  "/api/teste",
];

testRoutes.forEach((route) => {
  console.log(`\n🔍 Testando: ${route}`);
  const req = { method: "GET", path: route, originalUrl: route };
  const res = {
    json: (data) => console.log("  ✅ JSON Response:", data),
    send: (data) =>
      console.log("  ❌ HTML Response:", data.substring(0, 50) + "..."),
  };

  // Simular o middleware
  app._router.handle(req, res, () => {});
});

console.log("\n🎯 TESTE CONCLUÍDO!");
console.log("✅ Se todas as rotas retornaram JSON, estão funcionando");
console.log("❌ Se alguma retornou HTML, há problema na configuração");
