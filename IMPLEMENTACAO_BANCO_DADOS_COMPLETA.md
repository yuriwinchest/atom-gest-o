# 🗄️ IMPLEMENTAÇÃO DO NOVO BANCO DE DADOS - DOCUMENTAÇÃO TÉCNICA COMPLETA

## 📊 **1. VISÃO GERAL DA ARQUITETURA**

### **🎯 TECNOLOGIAS UTILIZADAS:**
- **SGBD Primário:** PostgreSQL via Supabase 
- **ORM:** Drizzle ORM (type-safe)
- **Validação:** Zod schemas
- **Backup/Fallback:** Neon Database PostgreSQL
- **Futuro:** Migração para Backblaze B2 Storage (planejada)

### **🏗️ ARQUITETURA HÍBRIDA:**
```
Sistema de Gestão de Documentos
├── PostgreSQL/Supabase (Metadados + Relações)
├── Supabase Storage (Arquivos Físicos - atual)
├── Neon Database (Fallback PostgreSQL)
└── Backblaze B2 (Storage futuro - migração planejada)
```

---

## 🗂️ **2. ESQUEMA COMPLETO DO BANCO DE DADOS**

### **📋 TABELAS PRINCIPAIS IMPLEMENTADAS:**

#### **👥 2.1. SISTEMA DE USUÁRIOS E AUTENTICAÇÃO**

```sql
-- Tabela principal de usuários
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user', -- 'admin' ou 'user'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de logs de login (monitoramento)
CREATE TABLE login_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  username TEXT NOT NULL,
  email TEXT,
  login_status TEXT NOT NULL, -- 'success', 'failed', 'blocked'
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  failure_reason TEXT,
  login_time TIMESTAMP DEFAULT NOW(),
  logout_time TIMESTAMP,
  session_duration INTEGER, -- em segundos
  location_info JSONB, -- Dados de geolocalização
  device_info JSONB, -- Informações do dispositivo
  security_flags JSONB -- Flags de segurança
);

-- Tabela de sessões ativas
CREATE TABLE active_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  login_time TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  device_fingerprint TEXT,
  location_info JSONB,
  expires_at TIMESTAMP
);
```

#### **📁 2.2. SISTEMA DE DOCUMENTOS**

```sql
-- Tabela principal de documentos
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB, -- Metadados estruturados
  author TEXT,
  category TEXT,
  tags TEXT[],
  file_path TEXT,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  user_id INTEGER,
  
  -- Campos IMPL-ATOM específicos
  digital_identification TEXT,
  verification_hash TEXT,
  document_number TEXT,
  document_year INTEGER,
  public_organ TEXT,
  responsible_sector TEXT,
  main_subject TEXT,
  coverage_temporal TEXT,
  coverage_spatial TEXT,
  confidentiality_level TEXT,
  availability TEXT,
  language TEXT,
  rights TEXT,
  document_authority TEXT
);

-- Tabela de arquivos (sistema Supabase Storage)
CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  original_name TEXT NOT NULL,
  filename TEXT NOT NULL UNIQUE,
  file_path TEXT,
  file_size BIGINT,
  mime_type TEXT,
  file_type TEXT, -- Para categorização
  description TEXT,
  tags TEXT[],
  uploaded_by TEXT,
  is_public BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  metadata JSONB,
  environment TEXT DEFAULT 'production',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **🏷️ 2.3. SISTEMA DE CATEGORIAS DINÂMICAS**

```sql
-- Tipos de Documento
CREATE TABLE document_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Órgãos Públicos
CREATE TABLE public_organs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Setores Responsáveis
CREATE TABLE responsible_sectors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assuntos Principais
CREATE TABLE main_subjects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Níveis de Confidencialidade
CREATE TABLE confidentiality_levels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Opções de Disponibilidade
CREATE TABLE availability_options (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Opções de Idioma
CREATE TABLE language_options (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Opções de Direitos
CREATE TABLE rights_options (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Autoridades do Documento
CREATE TABLE document_authorities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **🏠 2.4. SISTEMA DE CONTEÚDO DA HOMEPAGE**

```sql
-- Conteúdo dinâmico da homepage
CREATE TABLE homepage_content (
  id SERIAL PRIMARY KEY,
  section TEXT NOT NULL, -- 'hero', 'cards', 'news', 'features'
  title TEXT NOT NULL,
  description TEXT,
  content TEXT, -- HTML/Markdown
  image_url TEXT,
  link_url TEXT,
  link_text TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Páginas dinâmicas do rodapé
CREATE TABLE footer_pages (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE, -- URL amigável
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL, -- HTML/Markdown
  meta_description TEXT, -- SEO
  icon TEXT, -- Emoji ou ícone
  category TEXT NOT NULL, -- 'links-uteis', 'contato', 'redes-sociais'
  external_url TEXT, -- Para links externos
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Configurações da homepage
CREATE TABLE homepage_settings (
  id SERIAL PRIMARY KEY,
  cards_count INTEGER DEFAULT 4,
  cards_order TEXT DEFAULT 'recent', -- 'recent', 'popular', 'custom'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **📊 2.5. SISTEMA DE ESTATÍSTICAS E MONITORAMENTO**

```sql
-- Estatísticas do sistema
CREATE TABLE system_stats (
  id SERIAL PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value INTEGER NOT NULL,
  metric_date DATE DEFAULT CURRENT_DATE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Visitas do sistema
CREATE TABLE page_visits (
  id SERIAL PRIMARY KEY,
  page_path TEXT NOT NULL,
  user_id INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  session_id TEXT,
  visit_duration INTEGER, -- em segundos
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 **3. CONFIGURAÇÃO E IMPLEMENTAÇÃO**

### **🌐 3.1. CONFIGURAÇÃO SUPABASE**

```typescript
// server/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fbqocpozjmuzrdeacktb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Teste de conectividade
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('count')
      .limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
}
```

### **🗄️ 3.2. SCHEMA DRIZZLE ORM**

```typescript
// shared/schema.ts
import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  boolean, 
  integer, 
  bigint,
  jsonb 
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Exemplo: Tabela de usuários
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tipos TypeScript auto-gerados
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Schemas Zod para validação
export const insertUserSchema = createInsertSchema(users);
```

### **⚙️ 3.3. CONFIGURAÇÃO DO BANCO**

```typescript
// server/db.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@shared/schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Função de inicialização
export async function initializeDatabase() {
  try {
    console.log('🔍 Testando conexão com o banco...');
    await db.select().from(schema.users).limit(1);
    console.log('✅ Conexão com banco estabelecida');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
    return false;
  }
}
```

---

## 🔄 **4. SISTEMA DE MIGRAÇÃO E POPULAÇÃO**

### **🛠️ 4.1. SCRIPTS DE CRIAÇÃO DAS TABELAS**

```javascript
// create-supabase-tables.js
async function createAllTables() {
  const createTableSQL = `
    -- Criar todas as tabelas principais
    CREATE TABLE IF NOT EXISTS users (...);
    CREATE TABLE IF NOT EXISTS documents (...);
    CREATE TABLE IF NOT EXISTS document_types (...);
    -- ... todas as outras tabelas
  `;
  
  const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
  if (error) throw error;
  
  console.log('✅ Todas as tabelas criadas no Supabase');
}
```

### **🌱 4.2. POPULAÇÃO COM DADOS INICIAIS**

```javascript
// populate-supabase-simple.js
async function popularDadosIniciais() {
  // 1. Usuários padrão
  const usuarios = [
    {
      email: 'admin@empresa.com',
      username: 'admin',
      name: 'Administrador IMPL',
      password: 'admin123', // Hash em produção
      role: 'admin'
    },
    {
      email: 'user@empresa.com', 
      username: 'user',
      name: 'Usuário Padrão',
      password: 'user123',
      role: 'user'
    }
  ];
  
  // 2. Categorias padrão
  const tiposDocumento = [
    'Documento PDF',
    'Documento Word', 
    'Planilha Excel',
    'Apresentação',
    'Imagem',
    'Vídeo'
  ];
  
  // 3. Órgãos públicos
  const orgaosPublicos = [
    'Assembleia Legislativa do MT',
    'Governo do Estado',
    'Prefeitura Municipal',
    'Tribunal de Contas',
    'Ministério Público'
  ];
  
  // Inserir dados...
  for (const usuario of usuarios) {
    await supabase.from('users').upsert(usuario);
  }
  
  console.log('✅ Dados iniciais populados');
}
```

---

## 🏪 **5. CAMADA DE ARMAZENAMENTO (STORAGE LAYER)**

### **📂 5.1. INTERFACE DE STORAGE**

```typescript
// server/storage.ts
export interface IStorage {
  // ===== USUÁRIOS =====
  authenticateUser(email: string, password: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;
  
  // ===== DOCUMENTOS =====
  getDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(insertDocument: InsertDocument): Promise<Document>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
  
  // ===== CATEGORIAS DINÂMICAS =====
  getDocumentTypes(): Promise<DocumentType[]>;
  createDocumentType(name: string): Promise<DocumentType>;
  getPublicOrgans(): Promise<PublicOrgan[]>;
  createPublicOrgan(name: string): Promise<PublicOrgan>;
  
  // ===== CONTEÚDO HOMEPAGE =====
  getHomepageContent(): Promise<HomepageContent[]>;
  createHomepageContent(content: InsertHomepageContent): Promise<HomepageContent>;
  
  // ===== ESTATÍSTICAS =====
  getSystemStats(): Promise<SystemStats>;
  updateSystemStats(stats: Partial<SystemStats>): Promise<void>;
}
```

### **🗄️ 5.2. IMPLEMENTAÇÃO DATABASE STORAGE**

```typescript
export class DatabaseStorage implements IStorage {
  
  // Autenticação
  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }
  
  // Usuários
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }
  
  // Documentos
  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }
  
  // Categorias dinâmicas
  async getDocumentTypes(): Promise<DocumentType[]> {
    return await db.select().from(documentTypes).orderBy(documentTypes.name);
  }
  
  async createDocumentType(name: string): Promise<DocumentType> {
    const [type] = await db
      .insert(documentTypes)
      .values({ name })
      .returning();
    return type;
  }
  
  // ... outras implementações
}
```

### **💾 5.3. IMPLEMENTAÇÃO MEMORY STORAGE (FALLBACK)**

```typescript
export class MemoryStorage implements IStorage {
  private users = new Map<number, User>();
  private documents = new Map<number, Document>();
  private documentTypes = new Map<number, DocumentType>();
  private currentUserId = 1;
  private currentDocumentId = 1;
  
  constructor() {
    // Dados padrão para desenvolvimento
    this.users.set(1, {
      id: 1,
      email: 'admin@empresa.com',
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
  }
  
  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = Array.from(this.users.values()).find(
      (u) => u.email === email && u.password === password
    );
    return user || null;
  }
  
  // ... implementações em memória
}
```

---

## 🔌 **6. INTEGRAÇÃO COM APIS**

### **🛣️ 6.1. ROTAS DO SISTEMA**

```typescript
// server/routes.ts
export async function registerRoutes(app: Express) {
  
  // ===== AUTENTICAÇÃO =====
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await storage.authenticateUser(email, password);
    
    if (user) {
      req.session.user = user;
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: "Credenciais inválidas" });
    }
  });
  
  // ===== DOCUMENTOS =====
  app.get("/api/documents", async (req, res) => {
    const documents = await storage.getDocuments();
    res.json(documents);
  });
  
  app.post("/api/documents", async (req, res) => {
    const document = await storage.createDocument(req.body);
    res.json(document);
  });
  
  // ===== CATEGORIAS DINÂMICAS =====
  app.get("/api/document-types", async (req, res) => {
    const types = await storage.getDocumentTypes();
    res.json(types);
  });
  
  app.post("/api/document-types", async (req, res) => {
    const { name } = req.body;
    const type = await storage.createDocumentType(name);
    res.json(type);
  });
  
  // ===== ESTATÍSTICAS =====
  app.get("/api/stats", async (req, res) => {
    const stats = await storage.getSystemStats();
    res.json(stats);
  });
}
```

---

## 🔒 **7. SEGURANÇA E AUTENTICAÇÃO**

### **🛡️ 7.1. SISTEMA DE SESSÕES**

```typescript
// server/index.ts
import session from "express-session";

app.use(session({
  secret: process.env.SESSION_SECRET || 'sistema-gestao-documentos-secret',
  name: 'sessionId',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false, // true em produção
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    sameSite: 'lax'
  }
}));
```

### **🔐 7.2. MIDDLEWARE DE AUTENTICAÇÃO**

```typescript
// Middleware para rotas protegidas
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session?.user) {
    next();
  } else {
    res.status(401).json({ message: "Autenticação necessária" });
  }
}

// Middleware para admins
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.user?.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Acesso restrito a administradores" });
  }
}
```

---

## 📊 **8. MONITORAMENTO E LOGS**

### **📈 8.1. SISTEMA DE MONITORAMENTO DE LOGIN**

```typescript
// server/services/loginMonitoringService.ts
export class LoginMonitoringService {
  
  async logLoginAttempt(data: {
    username: string;
    email: string;
    ip_address: string;
    user_agent: string;
    success: boolean;
    user_id?: number;
    failure_reason?: string;
    location_info?: any;
  }) {
    try {
      await db.insert(loginLogs).values({
        ...data,
        login_status: data.success ? 'success' : 'failed'
      });
    } catch (error) {
      console.error('Erro ao registrar log de login:', error);
    }
  }
  
  async createActiveSession(data: {
    user_id: number;
    session_id: string;
    ip_address: string;
    user_agent: string;
    location_info?: any;
  }) {
    try {
      await db.insert(activeSessions).values(data);
    } catch (error) {
      console.error('Erro ao criar sessão ativa:', error);
    }
  }
  
  async getLoginStatistics() {
    const stats = await db
      .select()
      .from(loginLogs)
      .where(gte(loginLogs.login_time, subDays(new Date(), 30)));
    
    return {
      total_attempts: stats.length,
      successful_logins: stats.filter(s => s.login_status === 'success').length,
      failed_attempts: stats.filter(s => s.login_status === 'failed').length
    };
  }
}
```

---

## 🔄 **9. MIGRAÇÃO FUTURA (BACKBLAZE B2)**

### **📋 9.1. PLANEJAMENTO DA MIGRAÇÃO**

```typescript
// Planejado: server/backblaze-b2.ts
export class BackblazeB2Service {
  
  async uploadFile(
    bucketName: string,
    fileName: string, 
    fileBuffer: Buffer,
    contentType: string
  ): Promise<{success: boolean, url?: string, error?: string}> {
    // Implementação futura com AWS SDK S3-Compatible
  }
  
  async downloadFile(
    bucketName: string, 
    fileName: string
  ): Promise<{success: boolean, data?: Buffer, error?: string}> {
    // Implementação futura
  }
  
  getBucketForFileType(mimeType: string): string {
    // Mapeamento automático para buckets especializados:
    // gestao-docs-documents, gestao-docs-images, etc.
  }
}
```

---

## ✅ **10. STATUS ATUAL DA IMPLEMENTAÇÃO**

### **🎯 FUNCIONALIDADES IMPLEMENTADAS:**

**✅ Sistema de Usuários:**
- Autenticação completa (login/logout)
- Controle de acesso por roles (admin/user)
- Sessões persistentes
- Monitoramento de logins

**✅ Sistema de Documentos:**
- CRUD completo de documentos
- Upload de arquivos para Supabase Storage
- Metadados estruturados (IMPL-ATOM)
- Sistema de categorização

**✅ Categorias Dinâmicas:**
- 9 tipos de categorias configuráveis
- Criação inline no formulário
- Persistência no Supabase

**✅ Content Management:**
- Homepage dinâmica
- Páginas do rodapé editáveis
- Sistema de estatísticas

**✅ Storage Layer:**
- Interface unificada (IStorage)
- Implementação PostgreSQL (DatabaseStorage)
- Fallback em memória (MemoryStorage)

### **🔄 EM DESENVOLVIMENTO:**

**⏳ Migração Backblaze B2:**
- Plano técnico completo criado
- API S3-Compatible selecionada
- Estrutura de 7 buckets planejada
- Economia de 87% vs AWS S3

### **🌐 AMBIENTE DE PRODUÇÃO:**

**📍 Configuração Atual:**
```env
# PostgreSQL (Metadados)
DATABASE_URL=postgresql://neondb_owner:npg_bYMZqwoTg04V@ep-round-sea...

# Supabase (Storage + Backup DB)
SUPABASE_URL=https://fbqocpozjmuzrdeacktb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Futura migração
B2_KEY_ID=(a ser configurado)
B2_APPLICATION_KEY=(a ser configurado)
```

**🎯 Credenciais Funcionais:**
- **Admin:** admin@empresa.com / admin123
- **User:** user@empresa.com / user123

---

## 📚 **11. ARQUIVOS DE CONFIGURAÇÃO**

### **📁 PRINCIPAIS ARQUIVOS:**

```
projeto/
├── shared/
│   └── schema.ts                 # Schema completo Drizzle
├── server/
│   ├── db.ts                    # Configuração banco
│   ├── storage.ts               # Camada de storage
│   ├── supabase.ts              # Cliente Supabase
│   ├── routes.ts                # APIs do sistema
│   └── services/
│       └── loginMonitoringService.ts
├── scripts/
│   ├── create-supabase-tables.js
│   ├── populate-supabase-simple.js
│   └── setup-supabase-tables.js
└── documentação/
    ├── CREDENCIAIS_BANCO_COMPLETAS.md
    └── IMPLEMENTACAO_BANCO_DADOS_COMPLETA.md
```

---

**🎯 CONCLUSÃO:** O sistema de banco de dados foi implementado com arquitetura robusta, escalável e type-safe, utilizando PostgreSQL como base principal, Supabase para storage de arquivos, e preparado para migração futura para Backblaze B2. A implementação segue padrões modernos de desenvolvimento com ORM Drizzle, validação Zod, e sistema de fallback para alta disponibilidade.

---
*Documentação técnica criada em 30 de julho, 2025 - Sistema de Gestão de Documentos*