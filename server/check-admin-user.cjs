/**
 * Verificar e Criar Usuário Admin
 *
 * Este script verifica se o usuário admin@empresa.com existe no banco
 * e o cria se necessário
 */

const { createClient } = require("@supabase/supabase-js");

// Configuração do Supabase
const supabaseUrl =
  process.env.SUPABASE_URL || "https://xwrnhpqzbhwiqasuywjo.supabase.co";
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_CrgokHl7x1arwFyvuzLM5w_v9GEP6iK";

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndCreateAdminUser() {
  console.log("🔍 VERIFICANDO USUÁRIO ADMIN...\n");

  try {
    // 1. Verificar se o usuário admin já existe
    console.log("📋 1. Verificando se usuário admin existe...");

    const { data: existingUser, error: searchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", "admin@empresa.com")
      .single();

    if (searchError && searchError.code !== "PGRST116") {
      console.error("❌ Erro ao buscar usuário:", searchError);
      return;
    }

    if (existingUser) {
      console.log("✅ Usuário admin já existe:");
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Username: ${existingUser.username}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   Senha: ${existingUser.password}`);

      // Verificar se a senha está correta
      if (existingUser.password === "admin123") {
        console.log("✅ Senha está correta: admin123");
      } else {
        console.log("❌ Senha incorreta. Atualizando...");

        // Atualizar senha
        const { error: updateError } = await supabase
          .from("users")
          .update({ password: "admin123" })
          .eq("id", existingUser.id);

        if (updateError) {
          console.error("❌ Erro ao atualizar senha:", updateError);
        } else {
          console.log("✅ Senha atualizada para: admin123");
        }
      }
    } else {
      console.log("❌ Usuário admin não encontrado. Criando...");

      // 2. Criar usuário admin
      const adminUser = {
        username: "admin",
        email: "admin@empresa.com",
        password: "admin123",
        role: "admin",
      };

      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert(adminUser)
        .select()
        .single();

      if (createError) {
        console.error("❌ Erro ao criar usuário admin:", createError);
        return;
      }

      console.log("✅ Usuário admin criado com sucesso:");
      console.log(`   ID: ${newUser.id}`);
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Username: ${newUser.username}`);
      console.log(`   Role: ${newUser.role}`);
      console.log(`   Senha: ${newUser.password}`);
    }

    // 3. Testar autenticação
    console.log("\n🧪 3. Testando autenticação...");

    const { data: testUser, error: authError } = await supabase
      .from("users")
      .select("*")
      .eq("email", "admin@empresa.com")
      .eq("password", "admin123")
      .single();

    if (authError) {
      console.error("❌ Erro na autenticação:", authError);
    } else if (testUser) {
      console.log("✅ Autenticação funcionando!");
      console.log(`   Usuário autenticado: ${testUser.email}`);
    } else {
      console.log("❌ Autenticação falhou");
    }

    // 4. Verificar estrutura da tabela users
    console.log("\n📊 4. Verificando estrutura da tabela users...");

    const { data: tableInfo, error: tableError } = await supabase
      .from("users")
      .select("*")
      .limit(1);

    if (tableError) {
      console.error("❌ Erro ao verificar tabela:", tableError);
    } else {
      console.log("✅ Tabela users está acessível");
      console.log(
        `   Colunas disponíveis: ${Object.keys(tableInfo[0] || {}).join(", ")}`
      );
    }

    console.log("\n🎯 VERIFICAÇÃO CONCLUÍDA!");
    console.log("✅ Usuário admin@empresa.com configurado");
    console.log("✅ Senha: admin123");
    console.log("✅ Role: admin");
  } catch (error) {
    console.error("❌ ERRO GERAL:", error);
    console.error("Stack trace:", error.stack);
  }
}

// Executar verificação
checkAndCreateAdminUser();
