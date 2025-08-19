# 🚀 CONFIGURAÇÃO DO BACKBLAZE B2

## 📋 **PASSO A PASSO:**

### **1. Criar Conta no Backblaze B2**
- Acesse: https://www.backblaze.com/b2/
- Clique em "Sign Up" e crie sua conta
- Confirme seu email

### **2. Criar Bucket**
- Faça login na sua conta
- Clique em "Create Bucket"
- Nome: `seu-bucket-nome` (ex: `documentos-empresa`)
- Tipo: `Public` (para acesso público aos arquivos)
- Clique em "Create Bucket"

### **3. Obter Credenciais**
- No menu lateral, clique em "App Keys"
- Clique em "Add Application Key"
- Nome: `chave-documentos` (ou qualquer nome)
- Permissões: `Read & Write`
- Bucket: Selecione o bucket criado
- Clique em "Create Application Key"

### **4. Copiar Dados**
- **Account ID**: Mostrado no topo da página
- **Key ID**: ID da chave criada
- **Application Key**: A chave secreta (copie agora, não será mostrada novamente)

### **5. Configurar Variáveis de Ambiente**
Crie um arquivo `.env.local` na raiz do projeto com:

```bash
# Backblaze B2
BACKBLAZE_B2_ACCOUNT_ID=seu_account_id_aqui
BACKBLAZE_B2_APPLICATION_KEY_ID=sua_key_id_aqui
BACKBLAZE_B2_APPLICATION_KEY=sua_application_key_aqui
BACKBLAZE_B2_BUCKET_NAME=seu_bucket_nome_aqui
```

### **6. Testar Conexão**
```bash
node testar-backblaze.mjs
```

## 🔑 **EXEMPLO DE CONFIGURAÇÃO:**

```bash
BACKBLAZE_B2_ACCOUNT_ID=4a48f8b8c9d0
BACKBLAZE_B2_APPLICATION_KEY_ID=001234567890abcdef
BACKBLAZE_B2_APPLICATION_KEY=K001234567890abcdefghijklmnop
BACKBLAZE_B2_BUCKET_NAME=documentos-empresa
```

## ⚠️ **IMPORTANTE:**
- **NUNCA** compartilhe suas chaves
- **NUNCA** commite o arquivo `.env.local` no Git
- Mantenha suas credenciais seguras
- Use buckets separados para desenvolvimento e produção

## 🆘 **PROBLEMAS COMUNS:**

### **Erro de Autenticação:**
- Verifique se as credenciais estão corretas
- Confirme se a chave tem permissões de escrita

### **Erro de Bucket:**
- Verifique se o nome do bucket está correto
- Confirme se o bucket existe e é público

### **Erro de Permissões:**
- Verifique se a chave tem permissões de `Read & Write`
- Confirme se a chave está associada ao bucket correto

## ✅ **TESTE FINAL:**
Após configurar, execute:
```bash
npm run dev
```

E teste criando um novo documento no sistema!
