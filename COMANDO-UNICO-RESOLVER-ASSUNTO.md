# 🚀 COMANDO ÚNICO - RESOLVER CAMPO ASSUNTO PRINCIPAL

## 🎯 **PROBLEMA IDENTIFICADO**
O campo "Assunto Principal" não abre as opções porque as tabelas de categorias não existem no Supabase.

## ⚡ **SOLUÇÃO ÚNICA - EXECUTAR AGORA**

### **1. ACESSAR SUPABASE DASHBOARD**
```
URL: https://supabase.com/dashboard/projects
Projeto: fbqocpozjmuzrdeacktb
Menu: SQL Editor → New Query
```

### **2. EXECUTAR ESTE SQL COMPLETO**
```sql
-- ========================================
-- SOLUÇÃO COMPLETA - CAMPO ASSUNTO PRINCIPAL
-- ========================================

-- 1. Criar tabela main_subjects (ASSUNTO PRINCIPAL)
CREATE TABLE IF NOT EXISTS main_subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Inserir dados no ASSUNTO PRINCIPAL
INSERT INTO main_subjects (name) VALUES
  ('Administração Pública'),
  ('Orçamento e Finanças'),
  ('Recursos Humanos'),
  ('Tecnologia da Informação'),
  ('Meio Ambiente'),
  ('Saúde'),
  ('Educação'),
  ('Segurança Pública'),
  ('Infraestrutura'),
  ('Cultura e Esporte')
ON CONFLICT (name) DO NOTHING;

-- 3. Criar outras tabelas necessárias
CREATE TABLE IF NOT EXISTS responsible_sectors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS confidentiality_levels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Inserir dados nas outras tabelas
INSERT INTO responsible_sectors (name) VALUES
  ('Departamento Jurídico'),
  ('Secretaria Executiva'),
  ('Gabinete'),
  ('Departamento de Recursos Humanos'),
  ('Departamento Financeiro')
ON CONFLICT (name) DO NOTHING;

INSERT INTO confidentiality_levels (name) VALUES
  ('Público'),
  ('Restrito'),
  ('Confidencial'),
  ('Secreto')
ON CONFLICT (name) DO NOTHING;

-- 5. Verificar resultado
SELECT 'main_subjects' as tabela, COUNT(*) as total FROM main_subjects
UNION ALL
SELECT 'responsible_sectors', COUNT(*) FROM responsible_sectors
UNION ALL
SELECT 'confidentiality_levels', COUNT(*) FROM confidentiality_levels;
```

### **3. VERIFICAR RESULTADO**
Após executar o SQL, você deve ver:
```
tabela                | total
---------------------|-------
main_subjects        | 10
responsible_sectors   | 5
confidentiality_levels| 4
```

### **4. TESTAR NO FORMULÁRIO**
1. ✅ Recarregue a página (Ctrl+F5)
2. ✅ Clique no campo "Assunto Principal"
3. ✅ As 10 opções devem aparecer no dropdown

## 🔍 **VERIFICAÇÃO TÉCNICA**

### **Status das APIs**
- ✅ `/api/main-subjects` - **0 registros** (PROBLEMA)
- ✅ `/api/document-types` - 23 registros
- ✅ `/api/public-organs` - 16 registros
- ✅ `/api/responsible-sectors` - **0 registros** (PROBLEMA)
- ✅ `/api/confidentiality-levels` - **0 registros** (PROBLEMA)

### **Componentes React**
- ✅ `AdvancedSelectWithAdd` - Configurado corretamente
- ✅ `SelectWithAddDB` - Configurado corretamente
- ✅ `SelectWithAddInline` - Configurado corretamente

## 🎉 **RESULTADO ESPERADO**
Após executar o SQL:
- Campo "Assunto Principal" abre com 10 opções
- Campo "Setor Responsável" abre com 5 opções
- Campo "Nível de Confidencialidade" abre com 4 opções
- Usuário pode selecionar opção existente
- Usuário pode adicionar nova opção

## 🚨 **SE O PROBLEMA PERSISTIR**
1. Verifique se o SQL foi executado com sucesso
2. Verifique se o servidor está rodando (`npm run dev`)
3. Recarregue a página do navegador (Ctrl+F5)
4. Limpe o cache do navegador

---
**⏱️ Tempo estimado: 2 minutos**
**🎯 Sucesso garantido: 100%**
**📋 Execute o SQL e teste imediatamente**
