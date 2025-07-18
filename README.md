# 📂 Sistema de Gestão de Documentos AtoM

Sistema completo de gerenciamento de documentos governamentais com funcionalidades avançadas de upload, categorização e visualização.

## 🚀 Funcionalidades Principais

### ✨ Edição Inline de Categorias
- Clique no botão "+" para adicionar novas categorias diretamente no formulário
- Sem modais ou popups - tudo inline
- Dados salvos automaticamente no banco PostgreSQL

### 📄 Gestão de Documentos
- Upload de múltiplos arquivos (PDF, Word, Excel, Imagens)
- Preview integrado de documentos
- Metadados completos com validação
- Sistema de tags e categorização

### 👥 Sistema de Usuários
- Autenticação completa
- Níveis de permissão
- Painel administrativo

### 📱 Interface Responsiva
- Design mobile-first
- Componentes nativos iOS/Android
- Performance otimizada

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Banco de Dados**: PostgreSQL (Neon)
- **Storage**: Supabase Storage
- **ORM**: Drizzle
- **Build**: Vite

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL
- Conta no Supabase (para storage)

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/yuriwinchest/atom-gest-o.git
cd atom-gest-o
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env` na raiz do projeto:
```env
DATABASE_URL=postgresql://usuario:senha@host:5432/banco
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
```

4. **Configure o banco de dados**
```bash
npm run db:push
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

## 🔐 Credenciais Padrão

- **Email**: admin@empresa.com
- **Senha**: admin123

## 📁 Estrutura do Projeto

```
atom-gest-o/
├── client/           # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── lib/
├── server/           # Backend Express
│   ├── routes.ts
│   ├── storage.ts
│   └── index.ts
├── shared/           # Schemas compartilhados
│   └── schema.ts
└── drizzle.config.ts # Configuração do ORM
```

## 🚀 Deploy

### Vercel/Netlify (Frontend)
1. Configure as variáveis de ambiente
2. Build command: `npm run build`
3. Output directory: `dist/public`

### Railway/Render (Backend)
1. Configure as variáveis de ambiente
2. Start command: `npm start`

## 📝 Funcionalidades Detalhadas

### Edição Inline
- Tipo de Documento
- Órgão Público
- Setor Responsável
- Assunto Principal
- Nível de Confidencialidade

### Upload de Arquivos
- Suporte para múltiplos formatos
- Preview integrado
- Validação de tipos
- Sem limite de tamanho

### Sistema de Busca
- Busca por título, descrição, tags
- Filtros por categoria
- Ordenação customizada

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença proprietária. Todos os direitos reservados.

## 👤 Autor

**Instituto Memória do Poder Legislativo - ALMT**

---

⭐ Se este projeto foi útil, considere dar uma estrela!