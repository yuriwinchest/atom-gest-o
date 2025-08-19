# 🚀 INSTRUÇÕES COMPLETAS PARA DEPLOY NA VPS

## 📋 PRÉ-REQUISITOS
- VPS com Ubuntu/Debian
- Node.js 18+ instalado
- Nginx instalado
- Acesso SSH como root

## 🔧 CONFIGURAÇÃO INICIAL

### 1. Conectar na VPS
```bash
ssh root@31.97.24.215
```

### 2. Atualizar sistema
```bash
apt update && apt upgrade -y
```

### 3. Instalar dependências
```bash
apt install -y curl wget git nginx
```

### 4. Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
```

## 🚀 EXECUTAR DEPLOY

### Opção 1: Deploy Automático (Recomendado)
```bash
# No seu computador local
chmod +x deploy-vps-limpeza-completa.sh
./deploy-vps-limpeza-completa.sh
```

### Opção 2: Deploy Manual
```bash
# Conectar na VPS
ssh root@31.97.24.215

# Executar comandos manualmente
cd /var/www
rm -rf atom-gestao
mkdir atom-gestao
cd atom-gestao

# Criar arquivos (copiar do script)
# ... seguir o script passo a passo
```

## 📝 CONFIGURAÇÕES NECESSÁRIAS

### 1. Variáveis de Ambiente (.env)
```bash
NODE_ENV=production
PORT=3001
SUPABASE_URL=sua_url_real_aqui
SUPABASE_ANON_KEY=sua_chave_real_aqui
BACKBLAZE_B2_APPLICATION_KEY_ID=sua_key_id_real
BACKBLAZE_B2_APPLICATION_KEY=sua_application_key_real
BACKBLAZE_B2_BUCKET_NAME=seu_bucket_real
```

### 2. Configurar Supabase
- Acessar: https://supabase.com
- Criar projeto ou usar existente
- Copiar URL e chaves para .env

### 3. Configurar Backblaze B2
- Acessar: https://www.backblaze.com/b2/
- Criar bucket para documentos
- Gerar Application Keys
- Copiar credenciais para .env

## 🧪 TESTES PÓS-DEPLOY

### 1. Verificar Servidor
```bash
curl http://127.0.0.1:3001/api/status
```

### 2. Verificar Nginx
```bash
curl -H "Host: h3.com.br" http://127.0.0.1
```

### 3. Verificar Logs
```bash
journalctl -u atom-gestao -f
tail -f /var/log/nginx/access.log
```

## 🔍 SOLUÇÃO DE PROBLEMAS

### Servidor não inicia
```bash
systemctl status atom-gestao
journalctl -u atom-gestao -n 50
```

### Nginx não funciona
```bash
nginx -t
systemctl status nginx
```

### Porta bloqueada
```bash
ufw status
ufw allow 80
ufw allow 443
```

## 📊 MONITORAMENTO

### Status dos Serviços
```bash
systemctl status atom-gestao
systemctl status nginx
```

### Logs em Tempo Real
```bash
journalctl -u atom-gestao -f
tail -f /var/log/nginx/error.log
```

### Uso de Recursos
```bash
htop
df -h
free -h
```

## 🎯 RESULTADO ESPERADO

Após o deploy bem-sucedido:
- ✅ Site acessível em http://h3.com.br
- ✅ API funcionando em /api/status
- ✅ Servidor rodando na porta 3001
- ✅ Nginx configurado e funcionando
- ✅ Serviço systemd ativo e automático

## 🆘 SUPORTE

Se algo não funcionar:
1. Verificar logs: `journalctl -u atom-gestao -f`
2. Verificar status: `systemctl status atom-gestao`
3. Verificar nginx: `nginx -t && systemctl status nginx`
4. Verificar conectividade: `curl -v http://127.0.0.1:3001`

---
**Data de Criação:** 18/08/2025
**Versão:** 1.0.0
**Status:** ✅ Pronto para Deploy
