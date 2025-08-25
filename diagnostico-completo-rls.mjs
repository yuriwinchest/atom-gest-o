#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config({ path: "./config-supabase.env" });

console.log("🔍 === DIAGNÓSTICO COMPLETO RLS - VERSÃO MELHORADA ===");
console.log("");

// 1. VERIFICAR VARIÁVEIS DE AMBIENTE
console.log("📋 1. VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE:");
console.log(
  "   SUPABASE_URL:",
  process.env.SUPABASE_URL ? "✅ Configurada" : "❌ Não configurada"
);
console.log(
  "   SUPABASE_ANON_KEY:",
  process.env.SUPABASE_ANON_KEY ? "✅ Configurada" : "❌ Não configurada"
);
console.log(
  "   SUPABASE_SERVICE_KEY:",
  process.env.SUPABASE_SERVICE_KEY ? "✅ Configurada" : "❌ Não configurada"
);
console.log("");

// 2. TESTAR CONEXÕES
console.log("🔌 2. TESTE DE CONEXÕES:");

// Cliente anônimo
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Cliente administrativo
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Teste cliente anônimo
try {
  const { data: anonData, error: anonError } = await supabase
    .from("files")
    .select("count")
    .limit(1);

  console.log("   Cliente Anônimo:", anonError ? "❌ Erro" : "✅ Funcionando");
  if (anonError) console.log("      Erro:", anonError.message);
} catch (error) {
  console.log("   Cliente Anônimo: ❌ Exceção:", error.message);
}

// Teste cliente administrativo
try {
  const { data: adminData, error: adminError } = await supabaseAdmin
    .from("files")
    .select("count")
    .limit(1);

  console.log("   Cliente Admin:", adminError ? "❌ Erro" : "✅ Funcionando");
  if (adminError) console.log("      Erro:", adminError.message);
} catch (error) {
  console.log("   Cliente Admin: ❌ Exceção:", error.message);
}

console.log("");

// 3. VERIFICAR ESTRUTURA DA TABELA FILES
console.log("📊 3. VERIFICAÇÃO DA TABELA FILES:");

try {
  // Teste simples: tentar selecionar uma linha
  const { data: sampleData, error: sampleError } = await supabaseAdmin
    .from("files")
    .select("*")
    .limit(1);

  if (sampleError) {
    console.log("   ❌ Erro ao acessar tabela:", sampleError.message);
  } else {
    console.log("   ✅ Tabela files acessível");
    if (sampleData && sampleData.length > 0) {
      console.log("   📋 Estrutura da primeira linha:");
      const firstRow = sampleData[0];
      Object.keys(firstRow).forEach((key) => {
        const value = firstRow[key];
        const type = value === null ? "NULL" : typeof value;
        console.log(`      - ${key}: ${type} = ${value}`);
      });
    } else {
      console.log("   📋 Tabela vazia - não é possível ver estrutura");
    }
  }
} catch (error) {
  console.log("   ❌ Exceção ao verificar tabela:", error.message);
}

console.log("");

// 4. TESTE ESPECÍFICO COM CAMPOS OBRIGATÓRIOS (baseado no erro anterior)
console.log("🧪 4. TESTE COM CAMPOS OBRIGATÓRIOS IDENTIFICADOS:");

try {
  // Dados com TODOS os campos obrigatórios baseados no erro anterior
  const testDataCompleto = {
    filename: `teste-completo-${Date.now()}.txt`,
    original_name: "teste-completo.txt",
    file_path: "teste/completo.txt",
    file_size: 100,
    mime_type: "text/plain",
    file_type: "documents",
    file_category: "general", // ✅ CAMPO OBRIGATÓRIO que estava faltando!
    file_extension: "txt", // ✅ CAMPO OBRIGATÓRIO que pode estar faltando!
    title: "Teste Completo",
    main_subject: "Teste",
    uploaded_by: "system",
    is_public: true,
    environment: "production",
    metadata: { teste: true, completo: true },
  };

  console.log("   📋 Tentando inserção com campos obrigatórios:");
  console.log("      - file_category:", testDataCompleto.file_category);
  console.log("      - file_extension:", testDataCompleto.file_extension);
  console.log("      - file_type:", testDataCompleto.file_type);

  const { data: insertCompleto, error: errorCompleto } = await supabaseAdmin
    .from("files")
    .insert(testDataCompleto)
    .select()
    .single();

  if (errorCompleto) {
    console.log("   ❌ Erro na inserção completa:", errorCompleto.message);
    console.log("      Código:", errorCompleto.code);
    console.log("      Detalhes:", errorCompleto.details);

    // Identificar qual campo específico está causando problema
    if (errorCompleto.message.includes("null value in column")) {
      const match = errorCompleto.message.match(
        /null value in column "([^"]+)"/
      );
      if (match) {
        console.log(`   🎯 Campo problemático identificado: "${match[1]}"`);
      }
    }
  } else {
    console.log("   ✅ Inserção completa bem-sucedida!");
    console.log("      ID:", insertCompleto.id);
    console.log("      Filename:", insertCompleto.filename);

    // Limpar teste
    const { error: deleteError } = await supabaseAdmin
      .from("files")
      .delete()
      .eq("id", insertCompleto.id);

    if (!deleteError) {
      console.log("   🧹 Teste limpo com sucesso");
    }
  }
} catch (error) {
  console.log("   ❌ Exceção no teste completo:", error.message);
}

console.log("");

// 5. TESTE PROGRESSIVO - ADICIONAR CAMPOS UM POR VEZ
console.log("🔄 5. TESTE PROGRESSIVO - IDENTIFICAR CAMPO FALTANTE:");

const camposBase = {
  filename: `teste-progressivo-${Date.now()}.txt`,
  original_name: "teste-progressivo.txt",
  file_path: "teste/progressivo.txt",
  file_size: 50,
  mime_type: "text/plain",
  file_type: "documents",
  title: "Teste Progressivo",
  main_subject: "Teste",
  uploaded_by: "system",
  is_public: true,
  environment: "production",
  metadata: { progressivo: true },
};

const camposAdicionais = [
  { nome: "file_category", valor: "general" },
  { nome: "file_extension", valor: "txt" },
  { nome: "description", valor: "Teste de descrição" },
  { nome: "tags", valor: ["teste"] },
  { nome: "is_active", valor: true },
  { nome: "download_count", valor: 0 },
];

for (let i = 0; i <= camposAdicionais.length; i++) {
  const dadosTeste = { ...camposBase };

  // Adicionar campos progressivamente
  for (let j = 0; j < i; j++) {
    dadosTeste[camposAdicionais[j].nome] = camposAdicionais[j].valor;
  }

  const camposIncluidos =
    i === 0
      ? "apenas básicos"
      : camposAdicionais
          .slice(0, i)
          .map((c) => c.nome)
          .join(", ");

  console.log(`   🧪 Teste ${i + 1}: ${camposIncluidos}`);

  try {
    const { data: testeData, error: testeError } = await supabaseAdmin
      .from("files")
      .insert(dadosTeste)
      .select("id")
      .single();

    if (testeError) {
      console.log(`      ❌ Falhou: ${testeError.message}`);

      // Se conseguimos identificar o campo problemático, parar aqui
      if (testeError.message.includes("null value in column")) {
        const match = testeError.message.match(
          /null value in column "([^"]+)"/
        );
        if (match) {
          console.log(`      🎯 CAMPO OBRIGATÓRIO ENCONTRADO: "${match[1]}"`);
          break;
        }
      }
    } else {
      console.log(`      ✅ Sucesso! ID: ${testeData.id}`);

      // Limpar teste bem-sucedido
      await supabaseAdmin.from("files").delete().eq("id", testeData.id);
      console.log(`      ✅ CONFIGURAÇÃO MÍNIMA FUNCIONANDO!`);
      break;
    }
  } catch (error) {
    console.log(`      ❌ Exceção: ${error.message}`);
  }
}

console.log("");

// 6. VERIFICAÇÃO DE RLS
console.log("🔒 6. VERIFICAÇÃO DE POLÍTICAS RLS:");

try {
  // Primeiro, teste com cliente admin (deve funcionar)
  const testRLSAdmin = {
    filename: `teste-rls-admin-${Date.now()}.txt`,
    original_name: "teste-rls-admin.txt",
    file_path: "teste/rls-admin.txt",
    file_size: 100,
    mime_type: "text/plain",
    file_type: "documents",
    file_category: "general",
    file_extension: "txt",
    title: "Teste RLS Admin",
    main_subject: "RLS",
    uploaded_by: "admin",
    is_public: true,
    environment: "production",
    metadata: { rls: true },
  };

  const { data: adminRLSData, error: adminRLSError } = await supabaseAdmin
    .from("files")
    .insert(testRLSAdmin)
    .select("id")
    .single();

  if (adminRLSError) {
    console.log("   ❌ Cliente ADMIN bloqueado:", adminRLSError.message);
    if (adminRLSError.message.includes("row-level security policy")) {
      console.log("   🔒 RLS está MUITO RESTRITIVO (bloqueia até admin)");
    }
  } else {
    console.log("   ✅ Cliente ADMIN funcionando");

    // Agora teste com cliente anônimo (deve falhar se RLS estiver funcionando)
    const { data: anonRLSData, error: anonRLSError } = await supabase
      .from("files")
      .insert({
        ...testRLSAdmin,
        filename: `teste-rls-anon-${Date.now()}.txt`,
      })
      .select("id")
      .single();

    if (anonRLSError) {
      if (anonRLSError.message.includes("row-level security policy")) {
        console.log("   ✅ RLS funcionando corretamente (bloqueia anônimo)");
      } else {
        console.log(
          "   ⚠️ Cliente anônimo bloqueado por outro motivo:",
          anonRLSError.message
        );
      }
    } else {
      console.log("   ❌ RLS NÃO está funcionando (anônimo conseguiu inserir)");

      // Limpar teste anônimo se funcionou
      await supabase.from("files").delete().eq("id", anonRLSData.id);
    }

    // Limpar teste admin
    await supabaseAdmin.from("files").delete().eq("id", adminRLSData.id);
  }
} catch (error) {
  console.log("   ❌ Exceção no teste RLS:", error.message);
}

console.log("");

// 7. RESUMO E DIAGNÓSTICO FINAL
console.log("📝 7. RESUMO E DIAGNÓSTICO FINAL:");
console.log("   🎯 Com base nos testes acima, o problema mais provável é:");
console.log("   1️⃣ Campo obrigatório faltando na inserção do backend");
console.log("   2️⃣ Backend usando ANON_KEY em vez de SERVICE_KEY");
console.log("   3️⃣ Políticas RLS muito restritivas");
console.log("");
console.log("   🔧 PRÓXIMOS PASSOS:");
console.log("   • Verificar se backend inclui todos os campos obrigatórios");
console.log("   • Confirmar uso de SERVICE_KEY no backend");
console.log("   • Aplicar correções de RLS se necessário");
console.log("");

console.log("🔍 === DIAGNÓSTICO COMPLETO FINALIZADO ===");
