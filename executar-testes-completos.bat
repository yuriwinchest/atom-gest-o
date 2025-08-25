@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    TESTE COMPLETO BACKBLAZE B2
echo    Sistema ATOM Gestão de Documentos
echo ========================================
echo.

echo 🚀 Iniciando testes completos do Backblaze B2...
echo.

echo 📋 1. Testando credenciais básicas...
node teste-backblaze-simples.mjs
echo.

echo 📋 2. Testando codificação das credenciais...
node teste-codificacao.mjs
echo.

echo 📋 3. Testando credenciais alternativas...
node teste-credenciais-alternativas.mjs
echo.

echo 📋 4. Testando funcionalidades completas...
node teste-backblaze-completo.mjs
echo.

echo 📋 5. Testando simulação da página de gestão...
node teste-pagina-gestao.mjs
echo.

echo.
echo ========================================
echo    RELATÓRIO GERADO
echo ========================================
echo.
echo 📄 Relatório completo salvo em: RELATORIO_TESTE_BACKBLAZE.md
echo.
echo 🔧 PRÓXIMOS PASSOS:
echo    1. Verificar credenciais no painel do Backblaze B2
echo    2. Criar nova chave de aplicação se necessário
echo    3. Atualizar arquivo backblaze-credentials.env
echo    4. Executar testes novamente para validação
echo.
echo ⚠️  STATUS ATUAL: REQUER CORREÇÃO IMEDIATA
echo.
pause
