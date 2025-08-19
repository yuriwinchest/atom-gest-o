#!/bin/bash
echo "🔧 CORRIGINDO PROBLEMAS NA VPS"
echo "================================"

ssh root@31.97.24.215 << 'CORRIGIR_VPS'

echo "🔍 Verificando status dos serviços..."
systemctl status atom-gestao --no-pager -l
systemctl status nginx --no-pager -l

echo "🌐 Verificando Nginx..."
nginx -t

echo "📁 Verificando estrutura..."
ls -la /var/www/atom-gestao/
ls -la /etc/nginx/sites-enabled/

echo "🔧 Corrigindo Nginx..."
systemctl start nginx
systemctl enable nginx

echo "🔧 Corrigindo aplicação..."
cd /var/www/atom-gestao
systemctl restart atom-gestao

echo "⏳ Aguardando serviços..."
sleep 10

echo "🧪 Testando aplicação..."
curl -v http://127.0.0.1:3001

echo "🧪 Testando Nginx..."
curl -v -H "Host: h3.com.br" http://127.0.0.1

echo "📊 Status final..."
systemctl status atom-gestao --no-pager -l
systemctl status nginx --no-pager -l

echo "✅ Correção concluída!"

CORRIGIR_VPS

echo "🔧 Correção executada na VPS!"
