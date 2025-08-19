#!/bin/bash
echo "🧪 TESTANDO APLICAÇÃO COMPLETA"
echo "==============================="

ssh root@31.97.24.215 << 'TESTAR_APP'

echo "🔍 Status dos serviços..."
systemctl status atom-gestao --no-pager -l
systemctl status nginx --no-pager -l

echo "🌐 Testando aplicação diretamente..."
curl -s http://127.0.0.1:3001 | head -5

echo "🌐 Testando via Nginx..."
curl -s -H "Host: h3.com.br" http://127.0.0.1 | head -5

echo "🌐 Testando via IP externo..."
curl -s -H "Host: h3.com.br" http://31.97.24.215 | head -5

echo "📊 Logs da aplicação..."
journalctl -u atom-gestao -n 10 --no-pager

echo "📊 Logs do Nginx..."
tail -5 /var/log/nginx/access.log
tail -5 /var/log/nginx/error.log

echo "✅ Testes concluídos!"

TESTAR_APP

echo "🧪 Testes executados na VPS!"
