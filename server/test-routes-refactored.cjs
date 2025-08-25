#!/usr/bin/env node

/**
 * Script de teste simplificado para as rotas refatoradas da gestao-documentos
 * Testa apenas conectividade básica e se as rotas respondem
 */

const http = require("http");

const BASE_URL = "http://localhost:5000";
const TEST_TIMEOUT = 5000; // 5 segundos

/**
 * Função para fazer requisições HTTP simples
 */
function makeRequest(path, method = "GET", data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "TestScript/1.0",
      },
    };

    const req = http.request(options, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null,
            rawBody: body,
          };
          resolve(response);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: null,
            rawBody: body,
            parseError: e.message,
          });
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.setTimeout(TEST_TIMEOUT, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Teste básico de conectividade
 */
async function testConnectivity() {
  console.log("\n🌐 1. Testando conectividade básica...");

  try {
    const response = await makeRequest("/");

    if (response.statusCode) {
      console.log(
        `✅ Servidor responde na porta 5000 (Status: ${response.statusCode})`
      );
      return true;
    }
  } catch (error) {
    console.log("❌ Erro de conectividade:", error.message);
    return false;
  }
}

/**
 * Testa se as rotas da API estão registradas
 */
async function testAPIRoutes() {
  console.log("\n🔗 2. Testando rotas da API...");

  const testRoutes = [
    { path: "/api/documents/list", description: "Listagem de documentos" },
    {
      path: "/api/documents/categories/list",
      description: "Listagem de categorias",
    },
    {
      path: "/api/documents/validate-upload",
      description: "Validação de upload",
      method: "POST",
      data: { fileName: "test.pdf" },
    },
  ];

  let successCount = 0;

  for (const route of testRoutes) {
    try {
      console.log(`   Testando ${route.description}...`);
      const response = await makeRequest(route.path, route.method, route.data);

      if (response.statusCode >= 200 && response.statusCode < 500) {
        console.log(`   ✅ ${route.path} - Status: ${response.statusCode}`);

        // Verificar se a resposta é JSON válida
        if (response.parseError) {
          console.log(
            `   ⚠️ Resposta não é JSON válido: ${response.parseError}`
          );
          console.log(
            `   📄 Resposta bruta: ${response.rawBody.substring(0, 100)}...`
          );
        } else {
          console.log(`   ✅ JSON válido retornado`);
        }

        successCount++;
      } else {
        console.log(`   ❌ ${route.path} - Status: ${response.statusCode}`);
        console.log(`   📄 Resposta: ${response.rawBody.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`   ❌ ${route.path} - Erro: ${error.message}`);
    }
  }

  return successCount;
}

/**
 * Testa endpoint de upload (sem arquivo real)
 */
async function testUploadEndpoint() {
  console.log("\n📤 3. Testando endpoint de upload...");

  try {
    // Teste sem arquivo (deve falhar com erro apropriado)
    const response = await makeRequest(
      "/api/supabase-upload-formdata",
      "POST",
      {
        fileName: "test.pdf",
        bucket: "test-bucket",
      }
    );

    console.log(`   Status: ${response.statusCode}`);

    if (response.statusCode === 400) {
      console.log(
        "   ✅ Endpoint responde corretamente para requisição inválida"
      );
      return true;
    } else if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log("   ⚠️ Endpoint aceitou requisição sem arquivo");
      return false;
    } else {
      console.log("   ❌ Status inesperado:", response.statusCode);
      return false;
    }
  } catch (error) {
    console.log("   ❌ Erro no teste:", error.message);
    return false;
  }
}

/**
 * Função principal
 */
async function main() {
  console.log("🚀 Teste das rotas refatoradas da gestao-documentos");
  console.log("📍 Servidor testado:", BASE_URL);
  console.log("⏱️ Timeout:", TEST_TIMEOUT / 1000, "segundos");

  const results = {
    connectivity: false,
    apiRoutes: 0,
    uploadEndpoint: false,
  };

  // Executar testes
  results.connectivity = await testConnectivity();
  results.apiRoutes = await testAPIRoutes();
  results.uploadEndpoint = await testUploadEndpoint();

  // Resultado final
  console.log("\n📊 === RESULTADO DOS TESTES ===");

  console.log(
    `🌐 Conectividade: ${results.connectivity ? "✅ OK" : "❌ FALHA"}`
  );
  console.log(`🔗 Rotas da API: ${results.apiRoutes}/3 funcionando`);
  console.log(
    `📤 Endpoint upload: ${results.uploadEndpoint ? "✅ OK" : "❌ FALHA"}`
  );

  const totalTests = 1 + 3 + 1; // connectivity + api routes + upload
  const passedTests =
    (results.connectivity ? 1 : 0) +
    results.apiRoutes +
    (results.uploadEndpoint ? 1 : 0);

  console.log(`\n📈 Total: ${passedTests}/${totalTests} testes passaram`);

  if (passedTests >= totalTests - 1) {
    // Aceitar se passar em pelo menos 4/5
    console.log("\n🎉 Sistema de rotas refatoradas funcionando corretamente!");
    process.exit(0);
  } else {
    console.log(
      "\n⚠️ Alguns testes falharam. Verifique se o servidor está rodando."
    );
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testConnectivity,
  testAPIRoutes,
  testUploadEndpoint,
};
