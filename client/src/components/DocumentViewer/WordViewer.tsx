import { memo, useState, useEffect, useRef } from 'react';
import mammoth from 'mammoth';
import { FileText, Download, ExternalLink, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WordViewerProps {
  documentUrl: string;
  fileName: string;
  onError?: (error: any) => void;
}

export const WordViewer = memo(function WordViewer({
  documentUrl,
  fileName,
  onError
}: WordViewerProps) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [stats, setStats] = useState({ paragraphs: 0, words: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const loadWordDocument = async () => {
    try {
      console.log('🎯 [WordViewer] Baixando documento Word:', documentUrl);
      setLoading(true);
      setHasError(false);
      
      const response = await fetch(documentUrl);
      if (!response.ok) {
        throw new Error(`Erro ao baixar documento: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log('🎯 [WordViewer] Convertendo Word para HTML com mammoth.js');
      
      const result = await mammoth.convertToHtml({ arrayBuffer });
      
      if (result.value) {
        setHtmlContent(result.value);
        
        // Calcular estatísticas
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = result.value;
        const text = tempDiv.textContent || '';
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const paragraphs = result.value.split('</p>').length - 1;
        
        setStats({ paragraphs: Math.max(paragraphs, 1), words });
        setLoading(false);
        console.log('🎯 [WordViewer] Documento convertido com sucesso');
      } else {
        throw new Error('Não foi possível converter o documento');
      }
      
      if (result.messages && result.messages.length > 0) {
        console.warn('🎯 [WordViewer] Avisos da conversão:', result.messages);
      }
      
    } catch (error) {
      console.error('🎯 [WordViewer] Erro ao carregar documento:', error);
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido');
      setLoading(false);
      onError?.(error);
    }
  };

  const resetState = () => {
    setLoading(true);
    setHasError(false);
    setErrorMessage('');
    setHtmlContent('');
    setStats({ paragraphs: 0, words: 0 });
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    console.log('🎯 [WordViewer] Iniciando carregamento do documento:', fileName);
    resetState();
    loadWordDocument();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fileName, retryCount]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Erro ao carregar documento
        </h3>
        <p className="text-gray-600 text-center mb-6 max-w-md">
          {errorMessage || 'Não foi possível processar o documento Word.'}
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Button
            onClick={() => {
              setRetryCount(prev => prev + 1);
            }}
            variant="outline"
            className="flex items-center gap-2"
            disabled={retryCount >= 3}
          >
            <RefreshCw className="h-4 w-4" />
            {retryCount >= 3 ? 'Limite de tentativas' : `Tentar novamente (${retryCount}/3)`}
          </Button>
          <Button
            onClick={() => {
              const downloadLink = document.createElement('a');
              downloadLink.href = documentUrl;
              downloadLink.download = fileName;
              downloadLink.click();
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Baixar Documento
          </Button>
          <Button
            onClick={() => window.open(documentUrl, '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir em Nova Aba
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg min-h-[600px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-center">Processando documento Word...</p>
          <p className="text-gray-500 text-sm mt-1">Convertendo para visualização</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Header com estatísticas */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-4 mb-4 rounded-t-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">{fileName}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-blue-700">
            <span>{stats.paragraphs} parágrafo{stats.paragraphs !== 1 ? 's' : ''}</span>
            <span>{stats.words} palavra{stats.words !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Conteúdo do documento */}
      <div className="bg-white rounded-b-lg border border-gray-200" style={{ height: '85vh', maxHeight: '900px' }}>
        <div className="h-full overflow-y-auto p-6">
          <div 
            className="prose prose-blue max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            style={{
              fontSize: '16px',
              lineHeight: '1.7',
              fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
              minHeight: 'fit-content'
            }}
          />
        </div>
      </div>
    </div>
  );
});

export default WordViewer;