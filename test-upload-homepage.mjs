import fs from 'fs';
import path from 'path';

console.log('🧪 TESTE DE UPLOAD PARA HOMEPAGE');
console.log('=================================');

// Criar um arquivo de teste simples
const testFileName = 'test-image.txt';
const testContent = 'Este é um arquivo de teste para simular upload de imagem';

try {
  // Criar arquivo de teste
  fs.writeFileSync(testFileName, testContent);
  console.log('✅ Arquivo de teste criado:', testFileName);

  // Simular FormData
  const formData = new FormData();

  // Criar um Blob para simular arquivo
  const blob = new Blob([testContent], { type: 'text/plain' });
  const file = new File([blob], testFileName, { type: 'text/plain' });

  formData.append('file', file);
  formData.append('bucket', 'images');

  console.log('✅ FormData preparado');
  console.log('📁 Bucket:', 'images');
  console.log('📄 Arquivo:', testFileName);

  // Testar upload via API
  console.log('\n🚀 Testando upload via API...');

  const response = await fetch('http://localhost:3000/api/supabase-storage/upload-file', {
    method: 'POST',
    body: formData
  });

  console.log('📡 Status da resposta:', response.status, response.statusText);

  if (response.ok) {
    const result = await response.json();
    console.log('✅ Upload bem-sucedido!');
    console.log('📝 Resultado:', result);
  } else {
    const error = await response.text();
    console.error('❌ Erro no upload:', error);
  }

} catch (error) {
  console.error('💥 Erro no teste:', error);
} finally {
  // Limpar arquivo de teste
  if (fs.existsSync(testFileName)) {
    fs.unlinkSync(testFileName);
    console.log('🧹 Arquivo de teste removido');
  }
}
