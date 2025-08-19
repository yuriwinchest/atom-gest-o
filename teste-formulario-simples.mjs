console.log('🧪 Testando formulário simples...\n');

// Simular dados do formulário
const formData = {
  title: 'Teste de Documento',
  description: 'Descrição de teste',
  documentType: 'Relatório',
  publicOrgan: 'Secretaria Municipal',
  responsible: 'João Silva',
  mainSubject: 'Administração',
  tags: ['teste', 'documento', 'sistema']
};

console.log('📝 Dados do formulário:', formData);

// Simular validação
const requiredFields = [
  { field: 'title', label: 'Título' },
  { field: 'documentType', label: 'Tipo do Documento' },
  { field: 'publicOrgan', label: 'Órgão Público' },
  { field: 'responsible', label: 'Responsável' },
  { field: 'mainSubject', label: 'Assunto Principal' },
  { field: 'description', label: 'Descrição' }
];

const missingFields = requiredFields.filter(({ field }) => {
  const value = formData[field];
  return !value || value.toString().trim() === '';
});

if (missingFields.length > 0) {
  console.log('❌ Campos obrigatórios faltando:', missingFields.map(f => f.label).join(', '));
} else {
  console.log('✅ Todos os campos obrigatórios preenchidos!');
}

// Simular separação de palavras-chave
const keywordsText = 'TESTE, TESTE1, TESTE3';
console.log('\n🔑 Texto original:', keywordsText);

const keywords = keywordsText
  .split(',')
  .map(k => k.trim())
  .filter(k => k.length > 0);

console.log('🏷️ Palavras separadas:', keywords);
console.log('📊 Total de palavras:', keywords.length);

console.log('\n🎉 Teste concluído!');
