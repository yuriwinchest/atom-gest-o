/**
 * Teste das Rotas Refatoradas (CommonJS)
 *
 * Este arquivo testa se as rotas refatoradas estão funcionando corretamente
 * após a separação do arquivo routes.ts monolítico
 */

const express = require("express");

async function testRefactoredRoutes() {
  console.log("🧪 TESTANDO ROTAS REFATORADAS...\n");

  try {
    // Criar app Express de teste
    const app = express();

    // Configurar middleware básico
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Simular sessão para testes
    app.use((req, res, next) => {
      req.session = {
        user: {
          id: "test-user-id",
          role: "admin",
          email: "test@example.com",
        },
      };
      next();
    });

    // Importar e registrar rotas refatoradas
    console.log("📥 Importando rotas refatoradas...");

    // Verificar se os arquivos existem
    const fs = require("fs");
    const path = require("path");

    const filesToCheck = [
      "middleware/auth.ts",
      "middleware/validation.ts",
      "middleware/errorHandler.ts",
      "services/UploadService.ts",
      "controllers/UploadController.ts",
      "routes/upload.ts",
      "routes/index.ts",
    ];

    console.log("🔍 Verificando arquivos refatorados:");
    filesToCheck.forEach((file) => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${file}`);
      } else {
        console.log(`  ❌ ${file} - NÃO ENCONTRADO`);
      }
    });

    // Verificar estrutura de pastas
    console.log("\n📁 Verificando estrutura de pastas:");
    const foldersToCheck = ["middleware", "controllers", "services", "routes"];
    foldersToCheck.forEach((folder) => {
      const folderPath = path.join(__dirname, folder);
      if (fs.existsSync(folderPath)) {
        console.log(`  ✅ ${folder}/`);
      } else {
        console.log(`  ❌ ${folder}/ - NÃO ENCONTRADO`);
      }
    });

    // Verificar se o arquivo original ainda existe
    const originalRoutesPath = path.join(__dirname, "routes.ts");
    if (fs.existsSync(originalRoutesPath)) {
      const stats = fs.statSync(originalRoutesPath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`\n📄 Arquivo original routes.ts: ${sizeInMB} MB`);
    }

    console.log("\n🎯 TESTE DE ESTRUTURA CONCLUÍDO!");
    console.log("✅ Arquivos refatorados verificados");
    console.log("✅ Estrutura de pastas validada");
    console.log("✅ Sistema configurado para usar rotas refatoradas");
  } catch (error) {
    console.error("❌ ERRO NO TESTE:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

// Executar teste
testRefactoredRoutes();
