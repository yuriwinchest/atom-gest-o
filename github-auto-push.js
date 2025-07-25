#!/usr/bin/env node

/**
 * Sistema de Push Automático para GitHub
 * Executa push com token de autenticação
 */

import { exec } from 'child_process';
import fs from 'fs';

const GITHUB_TOKEN = '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';
const REPO_URL = `https://${GITHUB_TOKEN}@github.com/yuriwinchest/atom-gest-o.git`;

// Função para fazer push automático
function pushToGitHub(commitMessage) {
  return new Promise((resolve, reject) => {
    const commands = [
      'git add -A',
      `git commit -m "${commitMessage}"`,
      `git push ${REPO_URL} main`
    ];
    
    console.log('🚀 Iniciando push automático para GitHub...');
    
    exec(commands.join(' && '), (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erro no push:', error.message);
        reject(error);
      } else {
        console.log('✅ Push para GitHub concluído!');
        console.log(stdout);
        resolve(stdout);
      }
    });
  });
}

// Função para atualizar replit.md e fazer push
function updateAndPush(description) {
  const now = new Date();
  const dateTime = now.toLocaleString('pt-BR');
  
  // Atualiza replit.md
  const newEntry = `- ${dateTime}. **${description}**: Atualização automática sincronizada com GitHub.`;
  const replitMdPath = './replit.md';
  
  let content = fs.readFileSync(replitMdPath, 'utf8');
  content += '\n' + newEntry;
  fs.writeFileSync(replitMdPath, content);
  
  console.log('📝 replit.md atualizado');
  
  // Faz push automático
  return pushToGitHub(`🔄 ${description} - Auto-sync ativado`);
}

module.exports = { pushToGitHub, updateAndPush };

// Teste se executado diretamente
if (require.main === module) {
  const message = process.argv[2] || 'Sistema de push automático configurado';
  updateAndPush(message)
    .then(() => console.log('✅ Sincronização automática funcionando!'))
    .catch(err => console.error('❌ Erro:', err.message));
}