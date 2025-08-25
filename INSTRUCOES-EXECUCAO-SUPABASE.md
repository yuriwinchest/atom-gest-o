# 🚀 EXECUTAR NO SUPABASE - INSTRUÇÕES SIMPLES

## 📋 O QUE FAZER

**SIM, você precisa executar esses arquivos no Supabase!**

## 🔗 ACESSAR SUPABASE

1. **URL:** https://xwrnhpqzbhwiqasuywjo.supabase.co
2. **Login:** Suas credenciais
3. **Menu:** SQL Editor (lateral esquerda)
4. **Botão:** "New query"

## 📁 ARQUIVOS PARA EXECUTAR (NA ORDEM)

### 1️⃣ **`1-CORRIGIR-RLS-FILES-CLEAN-FIXED.sql`** ⭐ NOVO ARQUIVO CORRIGIDO

- **O que faz:** Corrige as políticas de segurança RLS (sem erros de duplicação)
- **Como:** Copie todo o conteúdo e cole no SQL Editor
- **Clique:** "Run"
- **✅ Vantagem:** Remove políticas existentes antes de criar novas

### 2️⃣ **`2-ADICIONAR-COLUNAS-FILES-CLEAN.sql`**

- **O que faz:** Adiciona colunas faltantes na tabela
- **Como:** Copie todo o conteúdo e cole no SQL Editor
- **Clique:** "Run"

### 3️⃣ **`3-VERIFICAR-ESTRUTURA-FILES-CLEAN.sql`**

- **O que faz:** Verifica se tudo foi configurado
- **Como:** Copie todo o conteúdo e cole no SQL Editor
- **Clique:** "Run"

## ✅ RESULTADO ESPERADO

Após executar os 3 arquivos:

- **Upload funcionando** sem erro RLS
- **Arquivo catalogo-agricola.pdf** enviado com sucesso
- **Formulário de gestão** operacional

## 🧪 TESTE FINAL

1. **Volte** para a página de gestão de documentos
2. **Tente fazer upload** do arquivo catalogo-agricola.pdf
3. **Verifique** se não há mais erro de RLS

## 🚨 SE DER ERRO

- **Verifique** se copiou todo o conteúdo do arquivo
- **Confirme** se clicou em "Run"
- **Teste** um arquivo por vez
- **Reinicie** o SQL Editor se necessário

## 🔧 ARQUIVO CORRIGIDO

**Use o arquivo `1-CORRIGIR-RLS-FILES-CLEAN-FIXED.sql`** que:

- ✅ Remove políticas existentes antes de criar novas
- ✅ Evita erro "policy already exists"
- ✅ Funciona mesmo se executado várias vezes

---

**🎯 EXECUTE OS 3 ARQUIVOS NA ORDEM E TESTE O UPLOAD!**

**⭐ IMPORTANTE:** Use o arquivo `1-CORRIGIR-RLS-FILES-CLEAN-FIXED.sql` para evitar erros!
