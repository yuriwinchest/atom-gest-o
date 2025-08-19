console.log('🧪 Testando mapeamento completo de campos...\n');

// Simular dados do formulário completo
const formData = {
  title: 'Teste de Documento Completo',
  description: 'Descrição completa do documento',
  documentType: 'Relatório',
  publicOrgan: 'Secretaria Municipal',
  responsible: 'João Silva',
  mainSubject: 'Administração',
  provenience: 'Assembleia Legislativa',
  authorities: 'Deputado João Silva, Senador Maria Santos',
  keywords: 'TESTE, TESTE1, TESTE3, administração, legislação',
  annotations: 'Anotações importantes sobre o documento',
  digitalizationDate: '2025-01-20',
  insertionDate: '2025-01-20',
  digitalId: 'DOC-1234567890-abc123'
};

console.log('📝 Dados do formulário:', formData);

// Simular o mapeamento para o banco
const documentData = {
  title: formData.title,
  description: formData.description,
  content: JSON.stringify({
    description: formData.description,
    documentType: formData.documentType,
    publicOrgan: formData.publicOrgan,
    responsible: formData.responsible,
    mainSubject: formData.mainSubject,
    provenience: formData.provenience,
    authorities: formData.authorities,
    keywords: formData.keywords,
    annotations: formData.annotations,
    digitalizationDate: formData.digitalizationDate,
    insertionDate: formData.insertionDate,
    digitalId: formData.digitalId
  }),
  tags: formData.keywords ? formData.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0) : []
};

console.log('\n📦 Dados para o banco:');
console.log('Title:', documentData.title);
console.log('Description:', documentData.description);
console.log('Tags:', documentData.tags);
console.log('Content JSON:', documentData.content);

// Verificar se todos os campos obrigatórios estão preenchidos
const requiredFields = [
  'title', 'documentType', 'publicOrgan', 'responsible', 'mainSubject', 'description'
];

const missingFields = requiredFields.filter(field => {
  const value = formData[field];
  return !value || value.toString().trim() === '';
});

if (missingFields.length > 0) {
  console.log('\n❌ Campos obrigatórios faltando:', missingFields);
} else {
  console.log('\n✅ Todos os campos obrigatórios preenchidos!');
}

// Verificar se as palavras-chave foram separadas corretamente
console.log('\n🔑 Palavras-chave separadas:', documentData.tags);
console.log('📊 Total de tags:', documentData.tags.length);

console.log('\n🎉 Teste concluído!');
