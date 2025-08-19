# 🔑 CONFIGURAR CREDENCIAIS BACKBLAZE B2

## 🚨 **PROBLEMA ATUAL:**
As credenciais do Backblaze B2 ainda não foram configuradas no sistema.

## 🚀 **SOLUÇÃO PASSO A PASSO:**

### **PASSO 1: Criar Conta no Backblaze B2**
1. Acesse: https://www.backblaze.com/b2/
2. Clique em "Sign Up"
3. Preencha seus dados e confirme o email
4. Faça login na sua conta

### **PASSO 2: Obter Account ID**
- Após fazer login, o Account ID aparece no topo da página
- Exemplo: `4a48f8b8c9d0`

### **PASSO 3: Criar Bucket**
1. Clique em "Create Bucket"
2. Nome: `documentos-empresa` (ou qualquer nome)
3. Tipo: `Public` (para acesso público aos arquivos)
4. Clique em "Create Bucket"

### **PASSO 4: Criar App Key**
1. Menu lateral → "App Keys"
2. Clique em "Add Application Key"
3. Nome: `chave-documentos`
4. Permissões: `Read & Write`
5. Bucket: Selecione o bucket criado
6. Clique em "Create Application Key"

### **PASSO 5: Copiar Credenciais**
- **Account ID**: Mostrado no topo da página
- **Key ID**: ID da chave criada (ex: `001234567890abcdef`)
- **Application Key**: A chave secreta (ex: `K001234567890abcdefghijklmnop`)
- **Bucket Name**: Nome do bucket criado

### **PASSO 6: Configurar Arquivo .env.local**
Edite o arquivo `.env.local` e substitua pelos valores reais:

```bash
# Backblaze B2
BACKBLAZE_B2_ACCOUNT_ID=SEU_ACCOUNT_ID_REAL
BACKBLAZE_B2_APPLICATION_KEY_ID=SUA_KEY_ID_REAL
BACKBLAZE_B2_APPLICATION_KEY=SUA_APPLICATION_KEY_REAL
BACKBLAZE_B2_BUCKET_NAME=SEU_BUCKET_NAME_REAL
```

### **PASSO 7: Testar**
```bash
node verificar-variaveis.mjs
node testar-backblaze.mjs
```

## 💰 **CUSTOS:**
- **Conta gratuita**: 10GB de armazenamento
- **Preço**: $0.005/GB/mês após os 10GB gratuitos
- **Upload**: Gratuito
- **Download**: $0.01/GB

## ⚠️ **IMPORTANTE:**
- **NUNCA** compartilhe suas chaves
- **NUNCA** commite o arquivo .env.local no Git
- Mantenha suas credenciais seguras

## 🆘 **AJUDA:**
Se precisar de ajuda para criar a conta ou configurar, me avise!
