# 🔐 CREDENCIAIS COMPLETAS DO BANCO DE DADOS - SISTEMA ATOM

## 🗄️ **SUPABASE DATABASE (Principal)**

### 📊 **Informações de Conexão**
```
URL do Projeto: https://fbqocpozjmuzrdeacktb.supabase.co  
Project ID: fbqocpozjmuzrdeacktb
Region: us-west-2
```

### 🔑 **API Keys**
```
SUPABASE_URL=https://fbqocpozjmuzrdeacktb.supabase.co

SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTY3ODYsImV4cCI6MjA2NTQzMjc4Nn0.nZPmcY4QtgnZ0K68TW2VlrQm4gyqodQUxgrWDechhhY
```

### 💾 **Connection String PostgreSQL**
```
DATABASE_URL=postgresql://postgres.fbqocpozjmuzrdeacktb:[SENHA_AQUI]@aws-0-us-west-2.pooler.supabase.com:6543/postgres

# Para transações diretas (sem pooling):
DIRECT_URL=postgresql://postgres.fbqocpozjmuzrdeacktb:[SENHA_AQUI]@aws-0-us-west-2.pooler.supabase.com:5432/postgres
```

## 🗄️ **NEON DATABASE (Fallback)**

### 📊 **Informações de Conexão**
```
Host: ep-round-sea-afdzzdpj.c-2.us-west-2.aws.neon.tech
Database: neondb
User: neondb_owner
Port: 5432
SSL Mode: require
```

### 🔑 **Connection String Completa**
```
DATABASE_URL=postgresql://neondb_owner:npg_bYMZqwoTg04V@ep-round-sea-afdzzdpj.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
```

### 🔓 **Credenciais Separadas**
```
DB_HOST=ep-round-sea-afdzzdpj.c-2.us-west-2.aws.neon.tech
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=npg_bYMZqwoTg04V
DB_PORT=5432
DB_SSL=require
```

## 🗃️ **SUPABASE STORAGE BUCKETS**

### 📁 **Buckets Ativos**
```
- documents (arquivos principais: PDF, Word, Excel)
- images (fotos anexadas e imagens)  
- videos (conteúdo multimídia)
- audio (arquivos de áudio)
- spreadsheets (planilhas específicas)
```

### 🔗 **URLs de Acesso Storage**
```
Base URL: https://fbqocpozjmuzrdeacktb.supabase.co/storage/v1/object/public/

Exemplos:
- https://fbqocpozjmuzrdeacktb.supabase.co/storage/v1/object/public/documents/arquivo.pdf
- https://fbqocpozjmuzrdeacktb.supabase.co/storage/v1/object/public/images/foto.jpg
```

## ⚙️ **ARQUIVO .ENV COMPLETO**

### 📝 **Para Desenvolvimento Local**
```env
# ===== BANCO PRINCIPAL SUPABASE =====
DATABASE_URL=postgresql://postgres.fbqocpozjmuzrdeacktb:[SUA_SENHA]@aws-0-us-west-2.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://fbqocpozjmuzrdeacktb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTY3ODYsImV4cCI6MjA2NTQzMjc4Nn0.nZPmcY4QtgnZ0K68TW2VlrQm4gyqodQUxgrWDechhhY

# ===== BANCO FALLBACK NEON =====
NEON_DATABASE_URL=postgresql://neondb_owner:npg_bYMZqwoTg04V@ep-round-sea-afdzzdpj.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require

# ===== SESSÕES =====
SESSION_SECRET=sistema-gestao-documentos-secret-key-2025

# ===== AMBIENTE =====
NODE_ENV=development
PORT=5000
```

## 🔧 **CONFIGURAÇÃO NO CÓDIGO**

### 📄 **server/supabase.ts**
```typescript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fbqocpozjmuzrdeacktb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTY3ODYsImV4cCI6MjA2NTQzMjc4Nn0.nZPmcY4QtgnZ0K68TW2VlrQm4gyqodQUxgrWDechhhY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 📄 **drizzle.config.ts**
```typescript  
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './shared/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## 🧪 **TESTE DE CONEXÃO**

### 🔍 **Comando de Teste**
```bash
# Testar Supabase
curl "https://fbqocpozjmuzrdeacktb.supabase.co/rest/v1/files?select=*&limit=1" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTY3ODYsImV4cCI6MjA2NTQzMjc4Nn0.nZPmcY4QtgnZ0K68TW2VlrQm4gyqodQUxgrWDechhhY"

# Testar PostgreSQL
psql "postgresql://neondb_owner:npg_bYMZqwoTg04V@ep-round-sea-afdzzdpj.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require" -c "SELECT version();"
```

### ✅ **Verificação de Funcionamento**
```javascript
// Teste JavaScript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fbqocpozjmuzrdeacktb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicW9jcG96am11enJkZWFja3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTY3ODYsImV4cCI6MjA2NTQzMjc4Nn0.nZPmcY4QtgnZ0K68TW2VlrQm4gyqodQUxgrWDechhhY'
);

async function testarConexao() {
  const { data, error } = await supabase.from('files').select('*').limit(1);
  console.log('Conexão:', error ? 'ERRO' : 'SUCESSO', data);
}
```

## 🛡️ **SEGURANÇA**

### ⚠️ **IMPORTANTE**
- **Anon Key**: Segura para uso frontend (já está pública no código)
- **Service Role Key**: NÃO incluída aqui (use apenas no backend)
- **Database Password**: Substitua `[SUA_SENHA]` pela senha real do Supabase
- **SSL**: Sempre necessário para conexões Supabase/Neon

### 🔒 **Permissões Ativas**
- ✅ **Leitura**: Tabela `files` (categorias e metadados)
- ✅ **Escrita**: Criação de registros na tabela `files`  
- ✅ **Storage**: Upload/download em todos os buckets
- ✅ **Auth**: Integração de autenticação Supabase

## 🎯 **STATUS ATUAL**

### ✅ **Funcionando 100%**
- Supabase Storage (arquivos físicos)
- Tabela `files` (categorias dinâmicas) 
- Sistema híbrido Supabase + Neon
- Upload/download de documentos
- APIs de categorias

### 📊 **Dados Reais no Sistema**
- **4 categorias ativas**: Ofício, Memorando, Relatório, CATEGORIA_TESTE_CRIADA_PELO_USUARIO
- **Arquivos**: PDFs, Word, Excel, imagens funcionando
- **Storage**: Múltiplos buckets com conteúdo real

---
*Credenciais atualizadas em: 30 de julho, 2025*
*Status: 🟢 Todas as conexões funcionando*