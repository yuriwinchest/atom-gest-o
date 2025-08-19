@echo off
echo 🔧 CONFIGURANDO AMBIENTE LOCAL - WINDOWS
echo =========================================

echo 📝 Copiando configurações...
copy config-local.env .env

echo 🔑 IMPORTANTE: Configure a senha do Supabase no arquivo .env
echo    Substitua [SUA_SENHA] pela senha real do banco
echo.

echo 🚀 Testando sistema...
npm run dev

echo ✅ Configuração concluída!
pause
