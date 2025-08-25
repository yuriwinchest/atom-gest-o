/**
 * SERVIDOR DE TESTE SIMPLES - SEM VITE, SEM MIDDLEWARES COMPLEXOS
 * Como engenheiro sênior, vou testar as rotas diretamente
 */

const express = require("express");
const app = express();

console.log("🚀 SERVIDOR DE TESTE SIMPLES - INICIANDO...\n");

// Middleware básico
app.use(express.json());

// Rota de teste direta
app.get("/api/test", (req, res) => {
  console.log("✅ ROTA /api/test FUNCIONANDO!");
  res.json({ success: true, message: "API funcionando!" });
});

// Rota de documentos
app.get("/api/documents", (req, res) => {
  console.log("✅ ROTA /api/documents FUNCIONANDO!");
  res.json({
    success: true,
    documents: [
      { id: 1, title: "Documento Teste 1", category: "Teste" },
      { id: 2, title: "Documento Teste 2", category: "Teste" },
    ],
  });
});

// Rota de estatísticas
app.get("/api/stats", (req, res) => {
  console.log("✅ ROTA /api/stats FUNCIONANDO!");
  res.json({
    success: true,
    totalDocuments: 2,
  });
});

// Middleware de captura para rotas não encontradas
app.use("*", (req, res) => {
  console.log(`❌ ROTA NÃO ENCONTRADA: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  });
});

// Iniciar servidor
const PORT = 5001; // Porta diferente para não conflitar
app.listen(PORT, () => {
  console.log(`✅ Servidor de teste rodando na porta ${PORT}`);
  console.log(`🌐 Teste: http://localhost:${PORT}/api/documents`);
  console.log(`🌐 Teste: http://localhost:${PORT}/api/stats`);
  console.log(`🌐 Teste: http://localhost:${PORT}/api/test`);
});
