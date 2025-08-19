console.log('🧪 Testando API de Documentos...\n');

// Simular dados de teste
const testDocument = {
  title: 'Teste de Documento API',
  description: 'Descrição de teste para verificar se está salvando',
  content: JSON.stringify({
    description: 'Descrição de teste para verificar se está salvando',
    documentType: 'Relatório',
    publicOrgan: 'Secretaria Municipal',
    responsible: 'João Silva',
    mainSubject: 'Administração',
    provenience: 'Assembleia Legislativa',
    authorities: 'Deputado João Silva',
    keywords: 'teste, api, documento',
    annotations: 'Anotações de teste',
    digitalizationDate: '2025-01-20',
    insertionDate: '2025-01-20',
    digitalId: 'DOC-TESTE-API-123',
    verificationHash: 'hash-teste-123',
    fileName: 'teste.pdf',
    fileSize: '1.2 MB',
    fileType: 'application/pdf',
    supabaseUrl: 'https://teste.com/arquivo.pdf'
  }),
  category: 'Documentos',
  author: 'João Silva',
  tags: ['teste', 'api', 'documento']
};

console.log('📝 Dados do documento de teste:');
console.log(JSON.stringify(testDocument, null, 2));

// Testar criação via API
async function testCreateDocument() {
  try {
    console.log('\n🚀 Testando criação de documento...');

    const response = await fetch('http://localhost:3000/api/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testDocument)
    });

    console.log('📊 Status da resposta:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Documento criado com sucesso!');
      console.log('🆔 ID do documento:', result.id);
      console.log('📅 Data de criação:', result.createdAt);
      return result;
    } else {
      const errorText = await response.text();
      console.log('❌ Erro na criação:', errorText);
      return null;
    }
  } catch (error) {
    console.log('💥 Erro na requisição:', error.message);
    return null;
  }
}

// Testar busca de documentos
async function testGetDocuments() {
  try {
    console.log('\n🔍 Testando busca de documentos...');

    const response = await fetch('http://localhost:3000/api/documents');

    console.log('📊 Status da resposta:', response.status);

    if (response.ok) {
      const documents = await response.json();
      console.log('✅ Documentos encontrados:', documents.length);
      console.log('📋 Lista de documentos:');
      documents.forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc.title} (ID: ${doc.id})`);
        console.log(`     Categoria: ${doc.category}`);
        console.log(`     Autor: ${doc.author}`);
        console.log(`     Tags: ${doc.tags?.join(', ') || 'Nenhuma'}`);
      });
      return documents;
    } else {
      const errorText = await response.text();
      console.log('❌ Erro na busca:', errorText);
      return [];
    }
  } catch (error) {
    console.log('💥 Erro na requisição:', error.message);
    return [];
  }
}

// Executar testes
async function runTests() {
  console.log('🎯 Iniciando testes...\n');

  // Teste 1: Criar documento
  const createdDoc = await testCreateDocument();

  // Aguardar um pouco
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Teste 2: Buscar documentos
  const documents = await testGetDocuments();

  // Verificar se o documento criado está na lista
  if (createdDoc && documents.length > 0) {
    const foundDoc = documents.find(doc => doc.id === createdDoc.id);
    if (foundDoc) {
      console.log('\n🎉 SUCESSO: Documento criado e encontrado na busca!');
      console.log('📊 Dados salvos corretamente no banco.');
    } else {
      console.log('\n⚠️ ATENÇÃO: Documento criado mas não encontrado na busca.');
      console.log('🔍 Verificar se há problema na listagem ou cache.');
    }
  }

  console.log('\n🏁 Testes concluídos!');
}

// Executar se estiver rodando diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}
