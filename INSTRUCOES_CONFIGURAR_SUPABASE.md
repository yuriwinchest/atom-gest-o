# 🔧 Configuração do Supabase para Resolver Erro RLS

## ❌ Problema Identificado
O erro `"new row violates row-level security policy"` indica que as políticas de segurança do Supabase estão impedindo a inserção de dados na tabela `homepage_content`.

## 🎯 Solução
Configurar as políticas RLS (Row Level Security) no Supabase para permitir operações de CRUD.

## 📋 Passos para Configuração

### 1. Acessar o Painel do Supabase
- Vá para [https://supabase.com](https://supabase.com)
- Faça login na sua conta
- Acesse o projeto: `xwrnhpqzbhwiqasuywjo`

### 2. Obter a Service Key (Chave de Serviço)
- No painel, vá para **Settings** → **API**
- Copie a **service_role key** (chave de serviço)
- **IMPORTANTE**: Esta chave tem permissões administrativas completas

### 3. Atualizar o Arquivo de Configuração
- Abra o arquivo `config-supabase.env`
- Substitua a linha `SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` pela chave real
- Salve o arquivo

### 4. Executar SQL para Configurar RLS
- No painel do Supabase, vá para **SQL Editor**
- Copie e cole o conteúdo do arquivo `configurar-rls-supabase.sql`
- Execute o SQL

### 5. Verificar Configuração
- Execute as consultas de verificação no final do SQL
- Confirme que as políticas foram criadas

## 🔐 Políticas RLS Configuradas

1. **Leitura Pública**: Qualquer pessoa pode ver o conteúdo
2. **Inserção Autenticada**: Usuários logados podem criar conteúdo
3. **Atualização Autenticada**: Usuários logados podem editar conteúdo
4. **Exclusão Autenticada**: Usuários logados podem deletar conteúdo
5. **Bypass Completo**: Service role pode fazer qualquer operação

## 🚀 Testando a Solução

### 1. Reiniciar o Servidor
```bash
# Parar o servidor atual (Ctrl+C)
# Reiniciar
npm run dev
```

### 2. Testar Criação de Card
- Acesse a página de gerenciamento de conteúdo
- Tente criar um novo card
- Verifique se não há mais erro de RLS

### 3. Verificar no Banco
- No Supabase, vá para **Table Editor**
- Verifique se os dados estão sendo inseridos na tabela `homepage_content`

## 🆘 Soluções Alternativas

### Opção 1: Desabilitar RLS Temporariamente
```sql
ALTER TABLE homepage_content DISABLE ROW LEVEL SECURITY;
```
**⚠️ ATENÇÃO**: Use apenas para testes, não em produção!

### Opção 2: Política Mais Permissiva
```sql
CREATE POLICY "Permitir todas as operações" ON homepage_content
FOR ALL USING (true);
```

## 📁 Arquivos Modificados

1. `config-supabase.env` - Configuração de credenciais
2. `server/supabase.ts` - Cliente administrativo
3. `server/storage.ts` - Funções de CRUD atualizadas
4. `configurar-rls-supabase.sql` - Políticas RLS

## 🔍 Verificação de Funcionamento

### Logs do Servidor
- Verifique se não há mais erros de RLS
- Confirme que as operações estão sendo executadas

### Banco de Dados
- Dados sendo inseridos corretamente
- Imagens sendo salvas no storage
- Cards aparecendo na página inicial

## 📞 Suporte

Se o problema persistir:
1. Verifique os logs do servidor
2. Confirme que a service key está correta
3. Execute as consultas de verificação no Supabase
4. Verifique se as políticas RLS foram aplicadas

## 🎉 Resultado Esperado

Após a configuração:
- ✅ Cards podem ser criados sem erro de RLS
- ✅ Imagens são salvas no Supabase Storage
- ✅ Conteúdo aparece na página inicial
- ✅ Sistema funcionando completamente
