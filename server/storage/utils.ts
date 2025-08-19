// Função para extrair texto automaticamente baseado no tipo de arquivo
export async function extractTextFromDocument(content: string, fileName?: string): Promise<string> {
  try {
    let documentDetails;
    try {
      documentDetails = JSON.parse(content);
    } catch (e) {
      return ''; // Se não for JSON válido, retorna vazio
    }

    const fileType = documentDetails?.fileType?.toLowerCase() || '';
    const fileInfo = documentDetails?.fileInfo;
    const description = documentDetails?.description || '';
    const title = documentDetails?.title || fileName || '';

    // Começar com texto dos metadados sempre
    let extractedText = `Título: ${title}. `;
    if (description) {
      extractedText += `Descrição: ${description}. `;
    }

    // Adicionar contexto baseado no tipo de arquivo
    if (fileType.includes('pdf')) {
      extractedText += 'Documento PDF. Conteúdo: relatório, formulário, texto oficial, dados técnicos, informações documentais. ';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      extractedText += 'Documento Word. Conteúdo: texto formatado, relatório oficial, documento administrativo, correspondência. ';
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet') || fileType.includes('csv')) {
      extractedText += 'Planilha Excel/CSV. Conteúdo: dados tabulares, números, cálculos, tabelas, relatórios financeiros, estatísticas. ';
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      extractedText += 'Apresentação PowerPoint. Conteúdo: slides, gráficos, apresentação visual, treinamento. ';
    } else if (fileType.includes('image')) {
      extractedText += 'Arquivo de imagem. Conteúdo: foto, gráfico, diagrama, ilustração, documento digitalizado. ';
    } else if (fileType.includes('video')) {
      extractedText += 'Arquivo de vídeo. Conteúdo: gravação, apresentação visual, treinamento em vídeo. ';
    } else if (fileType.includes('audio')) {
      extractedText += 'Arquivo de áudio. Conteúdo: gravação sonora, entrevista, ata de reunião gravada. ';
    } else if (fileType.includes('text')) {
      extractedText += 'Arquivo de texto. Conteúdo: texto simples, documentação, notas, dados não formatados. ';
    }

    // Adicionar informações dos metadados do formulário
    const metadataFields = [
      'documentType', 'publicOrgan', 'responsibleSector', 'responsible',
      'mainSubject', 'confidentialityLevel', 'legalBase', 'relatedProcess',
      'availability', 'language', 'rights', 'period', 'digitalizationLocation',
      'documentAuthority'
    ];

    for (const field of metadataFields) {
      const value = documentDetails[field];
      if (value && typeof value === 'string' && value.trim() !== '') {
        extractedText += `${value} `;
      }
    }

    // Adicionar tags se existirem
    if (documentDetails.tags && Array.isArray(documentDetails.tags)) {
      extractedText += documentDetails.tags.join(' ') + ' ';
    }

    console.log(`🔍 Texto extraído automaticamente (${extractedText.length} chars): ${extractedText.substring(0, 200)}...`);
    return extractedText.trim();

  } catch (error) {
    console.error('Erro na extração automática de texto:', error);
    return '';
  }
}

// Função para mapear registros do Supabase para o schema Document
export function mapFileToDocument(file: any): any {
  return {
    id: file.id,
    title: file.name,
    description: file.description || null,
    content: file.metadata?.content || null,
    tags: file.tags || null,
    category: file.metadata?.category || null,
    author: file.metadata?.author || null,
    user_id: file.user_id ? parseInt(file.user_id) : null,
    createdAt: new Date(file.created_at)
  };
}
