#!/bin/bash
echo "🔧 CORRIGINDO NODE.JS NA VPS"
echo "============================="

ssh root@31.97.24.215 << 'CORRIGIR_NODE'

echo "🔍 Verificando Node.js..."
which node
node --version
which nodejs
nodejs --version

echo "📦 Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

echo "🔍 Verificando instalação..."
which node
node --version
which nodejs
nodejs --version

echo "🔧 Corrigindo serviço..."
cd /var/www/atom-gestao
cat > /etc/systemd/system/atom-gestao.service << 'EOF'
[Unit]
Description=Atom Gestao
After=network.target
[Service]
Type=simple
User=root
WorkingDirectory=/var/www/atom-gestao
ExecStart=/usr/bin/nodejs index.js
Restart=always
RestartSec=10
[Install]
WantedBy=multi-user.target
EOF

echo "🔄 Recarregando serviços..."
systemctl daemon-reload
systemctl restart atom-gestao

echo "⏳ Aguardando..."
sleep 10

echo "🧪 Testando aplicação..."
curl -v http://127.0.0.1:3001

echo "📊 Status final..."
systemctl status atom-gestao --no-pager -l

echo "✅ Correção do Node.js concluída!"

CORRIGIR_NODE

echo "🔧 Node.js corrigido na VPS!"
