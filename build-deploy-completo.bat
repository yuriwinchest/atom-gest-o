@echo off
echo 🚀 BUILD COMPLETO E PREPARAÇÃO PARA DEPLOY
echo ===========================================

echo 🧹 Limpando builds anteriores...
if exist dist rmdir /s /q dist
if exist .next rmdir /s /q .next

echo 📦 Instalando dependências...
npm install

echo 🔨 Fazendo build completo...
npm run build

echo 📁 Verificando build...
if exist dist (
    echo ✅ Build criado com sucesso!
    dir dist
) else (
    echo ❌ Erro no build!
    pause
    exit /b 1
)

echo 🌐 Preparando para deploy na VPS...
echo.
echo 📋 PRÓXIMOS PASSOS:
echo 1. Configure a senha do Supabase no arquivo .env
echo 2. Execute: bash deploy-simples.sh
echo 3. Ou execute: bash corrigir-vps.sh (se houver problemas)
echo.
echo 🌐 A VPS já está configurada e funcionando!
echo 📱 Acesse: http://h3.com.br
echo.

echo ✅ Build e preparação concluídos!
pause
