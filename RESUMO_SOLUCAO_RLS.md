# 🚀 SOLUÇÃO RÁPIDA - Erro RLS Supabase

## ❌ PROBLEMA
```
"new row violates row-level security policy"
```
Este erro impede a criação de cards na página de gerenciamento de conteúdo.

## ✅ SOLUÇÃO EM 3 PASSOS

### 1️⃣ Configurar Service Key
- Acesse: [https://supabase.com](https://supabase.com)
- Projeto: `xwrnhpqzbhwiqasuywjo`
- **Settings** → **API** → Copie a **service_role key**
- Cole no arquivo `config-supabase.env`

### 2️⃣ Executar SQL no Supabase
- **SQL Editor** no painel do Supabase
- Execute o arquivo `configurar-rls-supabase.sql`

### 3️⃣ Testar
```bash
node testar-supabase-rls.mjs
```

## 🔑 ARQUIVOS IMPORTANTES

- `config-supabase.env` - Suas credenciais
- `configurar-rls-supabase.sql` - Políticas de segurança
- `testar-supabase-rls.mjs` - Script de teste

## 🎯 RESULTADO

Após a configuração:
- ✅ Cards podem ser criados
- ✅ Imagens são salvas
- ✅ Conteúdo aparece na página inicial
- ✅ Sistema funcionando 100%

## 📞 AJUDA

Se ainda houver problemas:
1. Verifique se a service key está correta
2. Execute o script de teste
3. Confirme que o SQL foi executado
4. Reinicie o servidor

---
**Tempo estimado: 5 minutos**
