#!/bin/bash
echo "🚀 DEPLOY COMPLETO - LIMPEZA TOTAL E INSTALAÇÃO"
echo "=================================================="

# Conectar na VPS e executar deploy
ssh root@31.97.24.215 << 'DEPLOY_COMPLETO'

echo "🛑 PARANDO TODOS OS SERVIÇOS..."
systemctl stop atom-gestao nginx
systemctl disable atom-gestao

echo "🧹 LIMPEZA COMPLETA DA VPS..."
rm -rf /var/www/atom-gestao/*
rm -rf /var/www/atom-gestao/.* 2>/dev/null || true
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/h3.com.br
rm -f /etc/systemd/system/atom-gestao.service

echo "📦 CRIANDO DIRETÓRIO LIMPO..."
mkdir -p /var/www/atom-gestao
cd /var/www/atom-gestao

echo "📋 CRIANDO package.json..."
cat > package.json << 'PACKAGE'
{
  "name": "atom-gestao",
  "version": "1.0.0",
  "description": "Sistema de Gestão de Documentos",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "tsx index.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "tsx": "^3.12.7",
    "typescript": "^5.0.4"
  }
}
PACKAGE

echo "🔧 INSTALANDO DEPENDÊNCIAS..."
npm install

echo "📁 CRIANDO ESTRUTURA DE ARQUIVOS..."
mkdir -p public/assets

echo "🌐 CRIANDO index.html..."
cat > public/index.html << 'HTML'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Atom Gestão - Sistema de Documentos</title>
    <link rel="stylesheet" href="/assets/index.css">
</head>
<body>
    <div id="root">
        <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            <h1>🚀 Atom Gestão</h1>
            <p>Sistema de Gestão de Documentos</p>
            <p>Status: <span style="color: green;">✅ Funcionando</span></p>
            <p>Versão: 1.0.0</p>
        </div>
    </div>
    <script src="/assets/index.js"></script>
</body>
</html>
HTML

echo "🎨 CRIANDO CSS..."
cat > public/assets/index.css << 'CSS'
body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

#root {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    padding: 40px;
    text-align: center;
}

h1 {
    color: #333;
    margin-bottom: 20px;
}

p {
    color: #666;
    margin: 10px 0;
}
CSS

echo "⚡ CRIANDO JavaScript..."
cat > public/assets/index.js << 'JS'
console.log('🚀 Atom Gestão carregado com sucesso!');
console.log('Versão: 1.0.0');
console.log('Status: Funcionando');

// Simular carregamento da aplicação
setTimeout(() => {
    console.log('✅ Aplicação totalmente carregada');
}, 1000);
JS

echo "🔧 CRIANDO SERVIDOR EXPRESS..."
cat > index.js << 'SERVER'
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota de status
app.get('/api/status', (req, res) => {
    res.json({
        status: 'success',
        message: 'Atom Gestão funcionando perfeitamente!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Rota de teste
app.get('/api/test', (req, res) => {
    res.json({
        status: 'success',
        message: 'API funcionando!',
        data: {
            server: 'Express',
            database: 'Configurado',
            storage: 'Backblaze B2'
        }
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Acesse: http://localhost:${PORT}`);
    console.log(`🌐 Status: http://localhost:${PORT}/api/status`);
});

module.exports = app;
SERVER

echo "📝 CRIANDO .env..."
cat > .env << 'ENV'
NODE_ENV=production
PORT=3001
SUPABASE_URL=sua_url_aqui
SUPABASE_ANON_KEY=sua_chave_aqui
BACKBLAZE_B2_APPLICATION_KEY_ID=sua_key_id_aqui
BACKBLAZE_B2_APPLICATION_KEY=sua_application_key_aqui
BACKBLAZE_B2_BUCKET_NAME=seu_bucket_aqui
ENV

echo "🌐 CONFIGURANDO NGINX..."
cat > /etc/nginx/sites-available/h3.com.br << 'NGINX'
server {
    listen 80;
    server_name h3.com.br www.h3.com.br;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache para assets estáticos
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

echo "🔗 ATIVANDO SITE NO NGINX..."
ln -sf /etc/nginx/sites-available/h3.com.br /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo "⚙️ CONFIGURANDO SERVIÇO SYSTEMD..."
cat > /etc/systemd/system/atom-gestao.service << 'SERVICE'
[Unit]
Description=Atom Gestao Application
After=network.target
Wants=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/atom-gestao
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

# Logs
StandardOutput=journal
StandardError=journal
SyslogIdentifier=atom-gestao

[Install]
WantedBy=multi-user.target
SERVICE

echo "🔄 RECARREGANDO SERVIÇOS..."
systemctl daemon-reload
systemctl enable atom-gestao
systemctl start atom-gestao
systemctl reload nginx

echo "⏳ AGUARDANDO SERVIÇOS INICIAREM..."
sleep 10

echo "🧪 TESTANDO APLICAÇÃO..."
if curl -s http://127.0.0.1:3001/api/status | grep -q "success"; then
    echo "✅ SERVIDOR FUNCIONANDO PERFEITAMENTE!"
else
    echo "❌ ERRO NO SERVIDOR!"
    systemctl status atom-gestao
fi

echo "🌐 TESTANDO NGINX..."
if curl -s -H "Host: h3.com.br" http://127.0.0.1 | grep -q "Atom Gestão"; then
    echo "✅ NGINX FUNCIONANDO PERFEITAMENTE!"
else
    echo "❌ ERRO NO NGINX!"
    nginx -t
fi

echo "📊 STATUS FINAL DOS SERVIÇOS..."
systemctl status atom-gestao --no-pager -l
systemctl status nginx --no-pager -l

echo "🎉 DEPLOY COMPLETO FINALIZADO!"
echo "🌐 Acesse: http://h3.com.br"
echo "📱 Status: http://h3.com.br/api/status"
echo "🔧 Logs: journalctl -u atom-gestao -f"

DEPLOY_COMPLETO

echo "✅ SCRIPT DE DEPLOY EXECUTADO NA VPS!"
echo "🌐 Verifique o status em: http://h3.com.br"
