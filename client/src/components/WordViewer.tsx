import { useState, useEffect } from 'react';
import * as mammoth from 'mammoth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  FileText, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';

interface WordViewerProps {
  documentId: number;
  fileName: string;
  onDownload?: () => void;
}

export default function WordViewer({ documentId, fileName, onDownload }: WordViewerProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wordInfo, setWordInfo] = useState<{ paragraphs: number; words: number } | null>(null);
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedContent, setPaginatedContent] = useState<string[]>([]);
  const [pageInput, setPageInput] = useState('1');
  const [shouldPaginate, setShouldPaginate] = useState(false);

  useEffect(() => {
    loadWordFile();
  }, [documentId]);

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  // Função para dividir conteúdo HTML em páginas
  const paginateHtmlContent = (htmlContent: string, wordsCount: number) => {
    // Decidir se deve paginar baseado no tamanho do documento
    const shouldPag = wordsCount > 500 || htmlContent.length > 3000;
    setShouldPaginate(shouldPag);

    if (!shouldPag) {
      setPaginatedContent([htmlContent]);
      setTotalPages(1);
      setCurrentPage(1);
      return;
    }

    // Dividir por parágrafos para melhor quebra
    const paragraphs = htmlContent.split(/(<p[^>]*>.*?<\/p>|<h[1-6][^>]*>.*?<\/h[1-6]>|<div[^>]*>.*?<\/div>)/gi)
      .filter(p => p.trim().length > 0);

    const pages: string[] = [];
    let currentPageContent = '';
    let currentWordCount = 0;
    const wordsPerPage = 300; // Palavras por página

    paragraphs.forEach((paragraph) => {
      const paragraphWords = (paragraph.replace(/<[^>]*>/g, '').match(/\w+/g) || []).length;
      
      if (currentWordCount + paragraphWords > wordsPerPage && currentPageContent) {
        pages.push(currentPageContent);
        currentPageContent = paragraph;
        currentWordCount = paragraphWords;
      } else {
        currentPageContent += paragraph;
        currentWordCount += paragraphWords;
      }
    });

    // Adicionar última página se tiver conteúdo
    if (currentPageContent) {
      pages.push(currentPageContent);
    }

    // Garantir pelo menos uma página
    if (pages.length === 0) {
      pages.push(htmlContent);
    }

    setPaginatedContent(pages);
    setTotalPages(pages.length);
    setCurrentPage(1);
  };

  const loadWordFile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar arquivo do servidor
      const response = await fetch(`/api/documents/${documentId}/view`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar arquivo Word');
      }

      const arrayBuffer = await response.arrayBuffer();
      
      // Converter DOCX para HTML usando mammoth
      const result = await mammoth.convertToHtml({ arrayBuffer });
      
      if (result.value) {
        setHtmlContent(result.value);
        
        // Calcular estatísticas básicas
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = result.value;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const paragraphs = result.value.split('<p>').length - 1;
        
        setWordInfo({ paragraphs, words });
        
        // Aplicar paginação se necessário
        paginateHtmlContent(result.value, words);
      } else {
        throw new Error('Não foi possível converter o documento');
      }

      // Log warnings se houver
      if (result.messages && result.messages.length > 0) {
        console.warn('Avisos da conversão:', result.messages);
      }

    } catch (err) {
      console.error('Erro ao carregar Word:', err);
      setError('Erro ao carregar documento Word. Tente baixar o arquivo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Funções de navegação
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
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando documento Word...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] text-center">
        <div className="max-w-md">
          <div className="bg-red-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Erro no Preview</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => window.open(`/api/documents/${documentId}/view`, '_blank')}>
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Abrir Foto
            </Button>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white overflow-hidden flex flex-col">
      {/* Header com controles de paginação (se necessário) */}
      {shouldPaginate && (
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900 truncate max-w-md">
                {fileName}
              </h3>
              <p className="text-sm text-gray-500">
                {wordInfo && `${wordInfo.words} palavras • ${wordInfo.paragraphs} parágrafos • `}
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

            {/* Botão de download */}
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                className="ml-4 text-green-600 hover:text-green-700"
              >
                <Download className="h-4 w-4 mr-1" />
                Baixar
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo do documento */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="p-8 max-w-5xl mx-auto bg-white dark:bg-gray-800 max-h-[450px] overflow-y-auto">
            <div 
              className="prose prose-lg max-w-none
                         prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mb-4
                         prose-p:text-gray-800 prose-p:leading-7 prose-p:mb-4 prose-p:text-base
                         prose-strong:text-gray-900 prose-strong:font-bold
                         prose-em:text-gray-700 prose-em:italic
                         prose-ul:text-gray-800 prose-ol:text-gray-800 prose-ul:mb-4 prose-ol:mb-4
                         prose-li:text-gray-800 prose-li:mb-2 prose-li:leading-6
                         prose-blockquote:text-gray-700 prose-blockquote:border-blue-300 prose-blockquote:bg-blue-50 prose-blockquote:p-4
                         prose-code:text-blue-700 prose-code:bg-blue-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                         prose-pre:bg-gray-100 prose-pre:border prose-pre:border-gray-300 prose-pre:p-4 prose-pre:rounded-lg
                         prose-table:text-base prose-table:border-collapse prose-table:w-full prose-table:mb-6
                         prose-th:bg-gray-100 prose-th:font-bold prose-th:p-3 prose-th:border prose-th:border-gray-300
                         prose-td:border prose-td:border-gray-300 prose-td:p-3
                         prose-img:rounded-lg prose-img:shadow-md prose-img:max-w-full
                         dark:prose-invert dark:prose-headings:text-white
                         dark:prose-p:text-gray-200 dark:prose-strong:text-white
                         dark:prose-code:text-blue-300 dark:prose-code:bg-blue-900/30
                         dark:prose-blockquote:bg-blue-900/20 dark:prose-blockquote:border-blue-600
                         dark:prose-th:bg-gray-700 dark:prose-td:border-gray-600"
              dangerouslySetInnerHTML={{ 
                __html: shouldPaginate ? 
                  (paginatedContent[currentPage - 1] || 'Conteúdo não disponível') : 
                  htmlContent 
              }}
            />
          </div>
        </ScrollArea>
      </div>

      {/* Footer com informações (se paginado) */}
      {shouldPaginate && (
        <div className="p-2 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <span>Documento: {fileName}</span>
            <span>•</span>
            <span>Página {currentPage} de {totalPages}</span>
            {wordInfo && (
              <>
                <span>•</span>
                <span>{wordInfo.words} palavras</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}