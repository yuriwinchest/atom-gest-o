#!/bin/bash
echo "🚀 DEPLOY SIMPLES - ATOM GESTÃO"
echo "================================="

# Conectar na VPS e executar deploy
ssh root@31.97.24.215 << 'DEPLOY_SIMPLES'

echo "🛑 Parando serviços..."
systemctl stop atom-gestao nginx 2>/dev/null || true

echo "🧹 Limpeza completa..."
rm -rf /var/www/atom-gestao
mkdir -p /var/www/atom-gestao
cd /var/www/atom-gestao

echo "📦 Criando aplicação..."
cat > package.json << 'EOF'
{
  "name": "atom-gestao",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {"start": "node index.js"},
  "dependencies": {"express": "^4.18.2", "cors": "^2.8.5"}
}
EOF

echo "🔧 Instalando dependências..."
npm install

echo "🌐 Criando servidor..."
cat > index.js << 'EOF'
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Atom Gestão</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>🚀 Atom Gestão</h1>
            <p>Sistema funcionando perfeitamente!</p>
            <p>Status: ✅ Online</p>
            <p>Versão: 1.0.0</p>
        </body>
        </html>
    `);
});

app.get('/api/status', (req, res) => {
    res.json({status: 'success', message: 'Atom Gestão funcionando!'});
});

app.listen(PORT, () => {
    console.log('🚀 Servidor rodando na porta', PORT);
});
EOF

echo "🌐 Configurando Nginx..."
cat > /etc/nginx/sites-available/h3.com.br << 'EOF'
server {
    listen 80;
    server_name h3.com.br www.h3.com.br;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

echo "🔗 Ativando site..."
ln -sf /etc/nginx/sites-available/h3.com.br /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo "⚙️ Configurando serviço..."
cat > /etc/systemd/system/atom-gestao.service << 'EOF'
[Unit]
Description=Atom Gestao
After=network.target
[Service]
Type=simple
User=root
WorkingDirectory=/var/www/atom-gestao
ExecStart=/usr/bin/node index.js
Restart=always
[Install]
WantedBy=multi-user.target
EOF

echo "🔄 Iniciando serviços..."
systemctl daemon-reload
systemctl enable atom-gestao
systemctl start atom-gestao
systemctl reload nginx

echo "⏳ Aguardando..."
sleep 5

echo "🧪 Testando..."
if curl -s http://127.0.0.1:3001 | grep -q "Atom Gestão"; then
    echo "✅ SUCESSO! Aplicação funcionando!"
else
    echo "❌ ERRO! Verificar logs..."
fi

echo "🎉 Deploy concluído!"
echo "🌐 Acesse: http://h3.com.br"

DEPLOY_SIMPLES

echo "✅ Deploy executado na VPS!"
echo "🌐 Verifique: http://h3.com.br"
