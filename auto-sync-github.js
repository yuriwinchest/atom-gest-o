#!/usr/bin/env node

/**
 * Sistema de Sincronização Automática GitHub
 * Monitora mudanças e faz push automático
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_URL = 'https://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@github.com/yuriwinchest/atom-gest-o.git';

// Função para fazer commit e push automático
async function autoSync(message) {
  return new Promise((resolve, reject) => {
    const commands = [
      'git add -A',
      `git commit -m "${message}"`,
      'git push origin main'
    ];
    
    exec(commands.join(' && '), (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erro no auto-sync:', error);
        reject(error);
      } else {
        console.log('✅ Auto-sync GitHub concluído:', stdout);
        resolve(stdout);
      }
    });
  });
}

// Função para atualizar replit.md com nova entrada
function updateReplitMd(updateDescription) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR');
  
  const newEntry = `- ${dateStr} ${timeStr}. **${updateDescription}**: Atualização automática do sistema sincronizada com GitHub.`;
  
  const replitMdPath = path.join(__dirname, 'replit.md');
  let content = fs.readFileSync(replitMdPath, 'utf8');
  
  // Adiciona nova entrada no final
  content += '\n' + newEntry;
  
  fs.writeFileSync(replitMdPath, content);
  console.log('📝 replit.md atualizado:', newEntry);
}

// Exporta funções para uso em outros arquivos
module.exports = {
  autoSync,
  updateReplitMd,
  REPO_URL
};

// Se executado diretamente
if (require.main === module) {
  const message = process.argv[2] || 'Atualização automática do sistema';
  updateReplitMd(message);
  autoSync(`🔄 ${message} - Auto-sync ativado`)
    .then(() => console.log('✅ Sincronização GitHub completa'))
    .catch(err => console.error('❌ Falha na sincronização:', err));
}