import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  FileText,
  Download,
  ExternalLink
} from 'lucide-react';

interface PaginatedDocumentViewerProps {
  documentId: number;
  fileName: string;
  fileType: string;
  onDownload?: () => void;
}

export default function PaginatedDocumentViewer({
  documentId,
  fileName,
  fileType,
  onDownload
}: PaginatedDocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [isLoading, setIsLoading] = useState(true);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [paginatedContent, setPaginatedContent] = useState<string[]>([]);
  const [detectedType, setDetectedType] = useState<string>('unknown');

  useEffect(() => {
    detectFileType();
    loadDocumentContent();
  }, [documentId, fileName, fileType]);

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const detectFileType = () => {
    const name = fileName.toLowerCase();
    const type = fileType.toLowerCase();

    if (type.includes('pdf') || name.includes('.pdf')) {
      setDetectedType('pdf');
    } else if (type.includes('word') || type.includes('document') || name.includes('.docx') || name.includes('.doc')) {
      setDetectedType('word');
    } else if (type.includes('excel') || type.includes('spreadsheet') || name.includes('.xlsx') || name.includes('.xls')) {
      setDetectedType('excel');
    } else if (type.includes('powerpoint') || name.includes('.pptx') || name.includes('.ppt')) {
      setDetectedType('powerpoint');
    } else if (type.includes('text') || name.includes('.txt')) {
      setDetectedType('text');
    } else {
      setDetectedType('other');
    }
  };

  const loadDocumentContent = async () => {
    try {
      setIsLoading(true);
      
      // Para PDFs, usamos iframe paginado
      if (detectedType === 'pdf') {
        setTotalPages(1); // PDF será controlado pelo navegador
        setIsLoading(false);
        return;
      }

      // Para outros tipos, carregamos conteúdo
      const response = await fetch(`/api/documents/${documentId}/content`);
      if (response.ok) {
        const content = await response.text();
        setDocumentContent(content);
        paginateContent(content);
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const paginateContent = (content: string) => {
    // Configurações de paginação baseadas no tipo
    let itemsPerPage = 1000; // caracteres por página para texto
    let separator = '\n\n'; // separador padrão

    if (detectedType === 'word') {
      itemsPerPage = 800; // menos caracteres para Word formatado
      separator = '\n\n\n'; // parágrafos maiores
    } else if (detectedType === 'excel') {
      itemsPerPage = 500; // menos para planilhas
      separator = '\n';
    } else if (detectedType === 'text') {
      itemsPerPage = 1500; // mais para texto simples
      separator = '\n\n';
    }

    // Dividir conteúdo em páginas
    const chunks = [];
    const paragraphs = content.split(separator);
    let currentChunk = '';

    paragraphs.forEach((paragraph, index) => {
      if (currentChunk.length + paragraph.length > itemsPerPage && currentChunk) {
        chunks.push(currentChunk);
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? separator : '') + paragraph;
      }

      // Última iteração
      if (index === paragraphs.length - 1 && currentChunk) {
        chunks.push(currentChunk);
      }
    });

    // Garantir pelo menos uma página
    if (chunks.length === 0) {
      chunks.push(content || 'Conteúdo vazio');
    }

    setPaginatedContent(chunks);
    setTotalPages(chunks.length);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = () => {
    const page = parseInt(pageInput);
    if (!isNaN(page)) {
      handlePageChange(page);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePageInputSubmit();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Carregando documento...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header com controles de navegação */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <FileText className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-gray-900 truncate max-w-md">
              {fileName}
            </h3>
            <p className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Navegação de páginas */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="p-2"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={pageInput}
              onChange={handlePageInputChange}
              onKeyPress={handleKeyPress}
              onBlur={handlePageInputSubmit}
              className="w-16 text-center h-8"
              placeholder="1"
            />
            <span className="text-sm text-gray-500">de {totalPages}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>

          {/* Botões de ação */}
          <div className="ml-4 flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/api/documents/${documentId}/view`, '_blank')}
              className="text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Nova Aba
            </Button>
            
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                className="text-green-600 hover:text-green-700"
              >
                <Download className="h-4 w-4 mr-1" />
                Baixar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo do documento */}
      <div className="flex-1 overflow-auto">
        {detectedType === 'pdf' ? (
          <div className="h-full">
            <iframe
              src={`/api/documents/${documentId}/view#page=${currentPage}&toolbar=0&navpanes=0`}
              className="w-full h-full border-0"
              title={`${fileName} - Página ${currentPage}`}
            />
          </div>
        ) : (
          <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {detectedType === 'word' ? (
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: paginatedContent[currentPage - 1] || 'Conteúdo não disponível' 
                  }}
                />
              ) : (
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                  {paginatedContent[currentPage - 1] || 'Conteúdo não disponível'}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer com informações da página */}
      <div className="p-2 bg-gray-50 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <span>Arquivo: {fileName}</span>
          <span>•</span>
          <span>Tipo: {detectedType.toUpperCase()}</span>
          <span>•</span>
          <span>Página {currentPage} de {totalPages}</span>
        </div>
      </div>
    </div>
  );
}