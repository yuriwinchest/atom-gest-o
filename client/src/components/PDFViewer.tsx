import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download, RefreshCw, Eye } from 'lucide-react';

interface PDFViewerProps {
  documentId: number;
  fileName: string;
  onDownload?: () => void;
}

export default function PDFViewer({ documentId, fileName, onDownload }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const pdfUrl = `/api/pdf-stream/${documentId}`;

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    // Tempo limite mais curto para melhor experiência
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [documentId]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    setIframeKey(prev => prev + 1);
  };

  const openInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
      {/* Barra de Controles */}
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
            PDF
          </div>
          <div>
            <h4 className="font-medium text-gray-800 text-sm">{fileName}</h4>
            <p className="text-xs text-gray-600">
              {isLoading ? 'Carregando documento...' : 'Visualizador de PDF'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRefresh} 
            size="sm" 
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button onClick={openInNewTab} size="sm" variant="outline">
            <ExternalLink className="h-4 w-4" />
            Nova Aba
          </Button>
          
          {onDownload && (
            <Button onClick={onDownload} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-1" />
              Baixar
            </Button>
          )}
        </div>
      </div>

      {/* Área de Visualização */}
      <div className="relative bg-gray-100" style={{ height: '500px' }}>
        {/* Estado de Carregamento */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando documento PDF...</p>
            </div>
          </div>
        )}

        {/* Estado de Erro */}
        {hasError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
            <div className="text-center">
              <div className="text-red-600 text-4xl mb-4">⚠️</div>
              <h4 className="font-medium text-red-800 mb-2">Erro ao Carregar PDF</h4>
              <p className="text-red-600 mb-4">Não foi possível exibir o documento</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  Tentar Novamente
                </Button>
                <Button onClick={openInNewTab} variant="outline" size="sm">
                  Abrir em Nova Aba
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* iframe para PDF com fallback */}
        <iframe
          key={iframeKey}
          src={pdfUrl}
          className="w-full h-full border-0"
          title={`PDF Viewer - ${fileName}`}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{ 
            minHeight: '500px',
            background: '#f8f9fa'
          }}
        />
        
        {/* Fallback quando iframe não funciona */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 z-0">
          <div className="text-center max-w-md p-6">
            <div className="w-20 h-24 bg-white rounded-lg shadow-lg mx-auto mb-4 flex items-center justify-center">
              <div className="text-red-600 text-2xl font-bold">PDF</div>
            </div>
            <h5 className="font-medium text-gray-800 mb-2">Documento PDF Disponível</h5>
            <p className="text-sm text-gray-600 mb-4">
              {fileName}
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={openInNewTab}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visualizar Documento
              </Button>
              {onDownload && (
                <Button 
                  onClick={onDownload}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Arquivo
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Informações do Arquivo */}
      <div className="p-3 border-t bg-gray-50 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">📄 {fileName}</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Eye className="h-3 w-3" />
          <span>Preview Integrado</span>
        </div>
      </div>
    </div>
  );
}