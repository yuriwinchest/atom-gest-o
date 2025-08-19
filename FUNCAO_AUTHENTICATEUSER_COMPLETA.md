# 🔐 FUNÇÃO AUTHENTICATEUSER - CÓDIGO COMPLETO PARA LOGIN

## 📋 **1. INTERFACE BASE (IStorage)**

```typescript
// server/storage.ts - Linha 11
export interface IStorage {
  // Autenticação de usuários
  authenticateUser(email: string, password: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;
  
  // ... outras funções
}
```

## 🗄️ **2. IMPLEMENTAÇÃO DATABASE STORAGE (PostgreSQL/Supabase)**

```typescript
// server/storage.ts - Linha 569
export class DatabaseStorage implements IStorage {
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async deleteUser(id: number): Promise<boolean> {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return !!deletedUser;
  }
}
```

## 💾 **3. IMPLEMENTAÇÃO MEMORY STORAGE (Fallback)**

```typescript
// server/storage.ts - Linha 231
export class MemoryStorage implements IStorage {
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || 'user'
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
}
```

## 🔗 **4. ROTA DE LOGIN COMPLETA (server/routes.ts)**

```typescript
// Imports necessários
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';

// Schema de validação do login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// ============= ROTA DE LOGIN =============
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("🔐 Tentativa de login:", req.body);
    const loginData = loginSchema.parse(req.body);
    console.log("✅ Dados validados:", loginData);
    
    // CHAMADA DA FUNÇÃO AUTHENTICATEUSER
    const user = await storage.authenticateUser(loginData.email, loginData.password);
    console.log("🔍 Usuario encontrado:", user ? "SIM" : "NÃO");
    
    // Importar serviço de monitoramento
    const { loginMonitoringService } = await import('./services/loginMonitoringService');
    
    // Preparar dados para o monitoramento
    const monitoringData = {
      username: user?.username || loginData.email,
      email: loginData.email,
      ip_address: req.ip || req.connection.remoteAddress || 'unknown',
      user_agent: req.get('User-Agent') || 'unknown',
      success: !!user,
      user_id: user?.id,
      location_info: {
        country: 'BR',
        city: 'Unknown',
        timezone: 'America/Sao_Paulo'
      }
    };
    
    if (user) {
      // Remove password from response for security
      const { password, ...userWithoutPassword } = user;
      
      // Gerar session ID único para o usuário
      const sessionId = uuidv4();
      
      // Salvar usuário na sessão
      if (req.session) {
        (req.session as any).user = userWithoutPassword;
        (req.session as any).sessionId = sessionId;
      }
      
      // Registrar login bem-sucedido
      await loginMonitoringService.logLoginAttempt(monitoringData);
      
      // Criar sessão ativa
      await loginMonitoringService.createActiveSession({
        user_id: user.id,
        session_id: sessionId,
        ip_address: monitoringData.ip_address,
        user_agent: monitoringData.user_agent,
        location_info: monitoringData.location_info
      });
      
      console.log("✅ Login realizado com sucesso para:", user.email);
      res.json({
        success: true,
        message: "Login realizado com sucesso",
        user: userWithoutPassword
      });
    } else {
      console.log("❌ Credenciais inválidas para:", loginData.email);
      
      // Registrar tentativa de login falhada
      await loginMonitoringService.logLoginAttempt({
        ...monitoringData,
        failure_reason: 'Invalid credentials'
      });
      
      res.status(401).json({
        success: false,
        message: "Email ou senha incorretos"
      });
    }
  } catch (error: any) {
    console.error('❌ Erro no login:', error);
    
    // Registrar tentativa de login com erro
    try {
      const { loginMonitoringService } = await import('./services/loginMonitoringService');
      await loginMonitoringService.logLoginAttempt({
        username: req.body.email || 'unknown',
        email: req.body.email || 'unknown',
        ip_address: req.ip || 'unknown',
        user_agent: req.get('User-Agent') || 'unknown',
        success: false,
        failure_reason: error.message || 'System error',
        location_info: {
          country: 'BR',
          city: 'Unknown',
          timezone: 'America/Sao_Paulo'
        }
      });
    } catch (logError) {
      console.error('❌ Erro ao registrar tentativa de login:', logError);
    }
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Dados de login inválidos",
        errors: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  }
});

// ============= ROTA VERIFICAR USUÁRIO ATUAL =============
app.get("/api/auth/me", (req, res) => {
  const user = req.session ? (req.session as any).user : null;
  
  if (user) {
    res.json({
      success: true,
      user: user
    });
  } else {
    res.json({
      success: false,
      message: "Não há usuário logado"
    });
  }
});

// ============= ROTA DE LOGOUT =============
app.post("/api/auth/logout", async (req, res) => {
  try {
    if (req.session) {
      // Destruir sessão
      req.session.destroy((err) => {
        if (err) {
          console.error('❌ Erro ao destruir sessão:', err);
          return res.status(500).json({
            success: false,
            message: "Erro ao fazer logout"
          });
        }
        
        console.log("✅ Logout realizado com sucesso");
        res.json({
          success: true,
          message: "Logout realizado com sucesso"
        });
      });
    } else {
      res.json({
        success: true,
        message: "Nenhuma sessão ativa"
      });
    }
  } catch (error) {
    console.error('❌ Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
});
```

## 📱 **5. IMPLEMENTAÇÃO FRONTEND (client/src/contexts/AuthContext.tsx)**

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'same-origin',
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('🔍 Verificação de autenticação:', userData);
        if (userData.success && userData.user) {
          setUser(userData.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Login bem-sucedido:', userData);
        if (userData.success && userData.user) {
          setUser(userData.user);
          setTimeout(() => checkAuth(), 50);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'same-origin'
      });
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

## 🗄️ **6. SCHEMA DO USUÁRIO (shared/schema.ts)**

```typescript
import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabela de usuários
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("user"), // 'admin' ou 'user'
  createdAt: timestamp("created_at").defaultNow(),
});

// Tipos TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Schemas de validação
export const insertUserSchema = createInsertSchema(users);
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória")
});
```

## 🧪 **7. EXEMPLO DE USO**

### **Chamada Direta da Função:**
```typescript
// No servidor
import { storage } from './storage';

async function exemploLogin(email: string, password: string) {
  try {    
    // Usar a função authenticateUser
    const user = await storage.authenticateUser(email, password);
    
    if (user) {
      console.log('✅ Login bem-sucedido:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });
      
      // Criar sessão, salvar tokens, etc.
      return user;
    } else {
      console.log('❌ Credenciais inválidas');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro no login:', error);
    throw error;
  }
}

// Exemplo de uso
exemploLogin('admin@empresa.com', 'admin123')
  .then(user => {
    if (user) {
      console.log('Usuário logado:', user.name);
    } else {
      console.log('Login falhou');
    }
  });
```

### **Via API REST:**
```javascript
// No frontend
async function fazerLogin(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Login bem-sucedido:', result.user);
      return result.user;
    } else {
      console.log('❌ Login falhou:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    return null;
  }
}

// Exemplo de uso
fazerLogin('admin@empresa.com', 'admin123')
  .then(user => {
    if (user) {
      // Redirecionar para dashboard
      window.location.href = '/gestao-documentos';
    } else {
      // Mostrar erro na interface
      alert('Email ou senha incorretos');
    }
  });
```

## 🔧 **8. CONFIGURAÇÃO DA SESSÃO (server/index.ts)**

```typescript
import session from "express-session";

// Configuração de sessão no servidor
app.use(session({
  secret: process.env.SESSION_SECRET || 'sistema-gestao-documentos-secret-key-2025',
  name: 'sessionId',
  resave: true,
  saveUninitialized: true,
  rolling: true,
  cookie: {
    secure: false, // true em produção com HTTPS
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    sameSite: 'lax'
  }
}));
```

## 🎯 **9. CREDENCIAIS DE TESTE**

```typescript
// Usuários padrão no sistema
const defaultUsers = [
  {
    id: 1,
    email: 'admin@empresa.com',
    username: 'admin',
    name: 'Administrador',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: 2,
    email: 'user@empresa.com',
    username: 'user',
    name: 'Usuário Padrão',
    password: 'user123',
    role: 'user'
  }
];
```

## ✅ **10. STATUS DE FUNCIONAMENTO**

**✅ Testado e Funcionando:**
- Login com email/senha
- Validação de credenciais  
- Criação de sessão
- Verificação de autenticação
- Logout completo
- Controle de acesso por role (admin/user)

**🎯 APIs Disponíveis:**
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Verificar usuário logado
- `POST /api/auth/logout` - Fazer logout

**🔐 Credenciais Funcionais:**
- **Admin:** admin@empresa.com / admin123
- **User:** user@empresa.com / user123

---
*Código extraído do sistema em funcionamento - 30 de julho, 2025*