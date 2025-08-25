import { createHash } from "crypto";
import { supabase } from "../supabase";

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Autentica um usuário com email e senha
   */
  async authenticateUser(credentials: LoginCredentials): Promise<User | null> {
    try {
      console.log("🔐 Tentando autenticar usuário:", credentials.email);

      // Buscar usuário no banco de dados
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", credentials.email)
        .single();

      if (error) {
        console.error("❌ Erro ao buscar usuário:", error);
        return null;
      }

      if (!users) {
        console.log("❌ Usuário não encontrado:", credentials.email);
        return null;
      }

      // Verificar senha (hash SHA256)
      const hashedPassword = createHash("sha256")
        .update(credentials.password)
        .digest("hex");

      if (users.password !== hashedPassword) {
        console.log("❌ Senha incorreta para usuário:", credentials.email);
        return null;
      }

      console.log("✅ Usuário autenticado com sucesso:", users.email);

      return {
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
      };
    } catch (error) {
      console.error("❌ Erro na autenticação:", error);
      return null;
    }
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(id: number): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      console.error("❌ Erro ao buscar usuário por ID:", error);
      return null;
    }
  }

  /**
   * Cria um novo usuário (para testes)
   */
  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<User | null> {
    try {
      // Hash da senha
      const hashedPassword = createHash("sha256")
        .update(userData.password)
        .digest("hex");

      const { data: newUser, error } = await supabase
        .from("users")
        .insert({
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          role: userData.role || "user",
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Erro ao criar usuário:", error);
        return null;
      }

      console.log("✅ Usuário criado com sucesso:", newUser.email);

      return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      };
    } catch (error) {
      console.error("❌ Erro ao criar usuário:", error);
      return null;
    }
  }

  /**
   * Verifica se um usuário existe
   */
  async userExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows found
        console.error("❌ Erro ao verificar usuário:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("❌ Erro ao verificar usuário:", error);
      return false;
    }
  }

  /**
   * Lista todos os usuários (apenas para admin)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Erro ao listar usuários:", error);
        return [];
      }

      return users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      }));
    } catch (error) {
      console.error("❌ Erro ao listar usuários:", error);
      return [];
    }
  }
}
