# 🚀 GUIA COMPLETO - SETUP LOCAL DO SISTEMA ATOM

## 📋 REQUISITOS DO SISTEMA

### 🖥️ **SOFTWARE BASE OBRIGATÓRIO**
```bash
# Node.js (versão 20 ou superior)
node --version  # deve retornar v20.x.x ou superior

# NPM (vem com Node.js)
npm --version   # deve retornar 9.x.x ou superior

# Git (para versionamento)
git --version   # qualquer versão recente

# Editor de código (recomendado: VSCode)
```

### 🔧 **DEPENDÊNCIAS DE SISTEMA**
- **Sistema operacional**: Windows 10+, macOS 10.15+, ou Linux Ubuntu 18.04+
- **RAM**: Mínimo 4GB (recomendado 8GB+)
- **Espaço em disco**: 2GB livres para dependências
- **Conexão com internet**: Para instalação de pacotes e APIs

## 📦 BIBLIOTECAS E DEPENDÊNCIAS

### 🎯 **DEPENDÊNCIAS PRINCIPAIS DE PRODUÇÃO**

```json
{
  "dependencies": {
    "@neondatabase/serverless": "^0.9.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@supabase/supabase-js": "^2.39.0",
    "@tanstack/react-query": "^5.17.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "drizzle-orm": "^0.29.0",
    "drizzle-zod": "^0.5.1",
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "framer-motion": "^10.16.16",
    "lucide-react": "^0.263.1",
    "mammoth": "^1.6.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.48.2",
    "tailwind-merge": "^2.2.0",
    "tailwindcss": "^3.4.0",
    "wouter": "^3.0.0",
    "zod": "^3.22.4"
  }
}
```

### 🛠️ **DEPENDÊNCIAS DE DESENVOLVIMENTO**

```json
{
  "devDependencies": {
    "@hookform/resolvers": "^3.3.2",
    "@types/express": "^4.17.21",
    "@types/express-session": "^1.17.10",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "concurrently": "^8.2.2",
    "drizzle-kit": "^0.20.0",
    "postcss": "^8.4.32",
    "tsx": "^4.6.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.8"
  }
}
```

## 🔧 CONFIGURAÇÃO PASSO A PASSO

### 1️⃣ **CLONAR O REPOSITÓRIO**
```bash
# Clonar do GitHub
git clone https://github.com/yuriwinchest/atom-gest-o.git
cd atom-gest-o

# Verificar se todos os arquivos foram baixados
ls -la
```

### 2️⃣ **INSTALAR DEPENDÊNCIAS**
```bash
# Limpar cache do npm (opcional mas recomendado)
npm cache clean --force

# Instalar todas as dependências
npm install

# Verificar se instalação foi bem-sucedida
npm list --depth=0
```

### 3️⃣ **CONFIGURAR VARIÁVEIS DE AMBIENTE**

Criar arquivo `.env` na raiz do projeto:

```env
# ===== BANCO DE DADOS SUPABASE =====
DATABASE_URL="sua_connection_string_supabase_aqui"
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_ANON_KEY="sua_anon_key_aqui"

# ===== SESSÕES =====
SESSION_SECRET="uma_chave_secreta_muito_forte_aqui"

# ===== AMBIENTE =====
NODE_ENV="development"
```

### 4️⃣ **CONFIGURAR BANCO DE DADOS SUPABASE**

**Opção A: Usar Supabase existente (recomendado)**
1. Acesse [https://supabase.com](https://supabase.com)
2. Crie conta ou faça login
3. Crie novo projeto
4. Copie a connection string do painel "Settings > Database"
5. Cole no arquivo `.env`

**Opção B: PostgreSQL local**
```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Criar banco de dados
sudo -u postgres createdb atom_gestao
```

### 5️⃣ **EXECUTAR MIGRAÇÕES DO BANCO**
```bash
# Aplicar schema no banco
npm run db:push

# Verificar se tabelas foram criadas
npm run db:studio  # abre interface visual
```

## 🎮 COMANDOS PARA DESENVOLVIMENTO

### 🚀 **INICIAR SERVIDOR DE DESENVOLVIMENTO**
```bash
# Comando principal (inicia frontend + backend)
npm run dev

# Acessar aplicação
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
```

### 🔍 **OUTROS COMANDOS ÚTEIS**
```bash
# Verificar dependências desatualizadas
npm outdated

# Atualizar dependências (cuidado!)
npm update

# Executar apenas o backend
npm run server

# Executar apenas o frontend
npm run client

# Build para produção
npm run build

# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 🗂️ ESTRUTURA DO PROJETO

```
atom-gest-o/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # React hooks customizados
│   │   └── lib/           # Utilitários e configurações
├── server/                # Backend Express
│   ├── routes.ts          # Rotas da API
│   ├── storage.ts         # Interface de armazenamento
│   └── index.ts           # Servidor principal
├── shared/                # Código compartilhado
│   └── schema.ts          # Schemas Drizzle
├── public/                # Arquivos estáticos
├── package.json           # Dependências do projeto
├── vite.config.ts         # Configuração Vite
├── tailwind.config.ts     # Configuração Tailwind
└── .env                   # Variáveis de ambiente
```

## 🔧 CONFIGURAÇÕES DO EDITOR (VSCODE)

Criar arquivo `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### 📋 **EXTENSÕES RECOMENDADAS VSCODE**
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Prettier - Code formatter
- GitLens — Git supercharged

## 🐛 SOLUÇÃO DE PROBLEMAS COMUNS

### ❌ **Erro: "Cannot find module"**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### ❌ **Erro: "Port already in use"**
```bash
# Encontrar processo usando a porta
lsof -ti:5000
kill -9 [PID]

# Ou usar porta diferente
PORT=3000 npm run dev
```

### ❌ **Erro: "Database connection failed"**
```bash
# Verificar variáveis de ambiente
cat .env

# Testar conexão manualmente
npm run db:studio
```

### ❌ **Erro: "Permission denied"**
```bash
# Linux/Mac - dar permissões
chmod +x node_modules/.bin/*
sudo chown -R $USER:$USER node_modules
```

## 🚀 DEPLOY LOCAL PARA PRODUÇÃO

### 📦 **BUILD PARA PRODUÇÃO**
```bash
# Gerar build otimizado
npm run build

# Testar build localmente
npm run preview
```

### 🌐 **CONFIGURAR PROXY REVERSO (NGINX)**
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📋 CHECKLIST FINAL

- [ ] Node.js 20+ instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Banco Supabase conectado
- [ ] Servidor inicia sem erros (`npm run dev`)
- [ ] Frontend acessível em http://localhost:5173
- [ ] API responde em http://localhost:5000/api/stats
- [ ] Páginas carregam corretamente
- [ ] Upload de arquivos funciona
- [ ] Sistema de autenticação operacional

## 🆘 SUPORTE

Se encontrar problemas:

1. **Verificar logs**: Console do navegador + terminal do servidor
2. **Conferir .env**: Todas as variáveis preenchidas corretamente
3. **Testar conexões**: Banco de dados + APIs externas
4. **Limpar cache**: `npm cache clean --force`
5. **Reinstalar**: `rm -rf node_modules && npm install`

**Sistema testado e funcionando em:**
- ✅ Windows 11 + Node.js 20.10.0
- ✅ macOS Ventura + Node.js 20.9.0  
- ✅ Ubuntu 22.04 + Node.js 20.8.0
- ✅ Replit Environment

---
*Documentação atualizada em: 30 de julho, 2025*