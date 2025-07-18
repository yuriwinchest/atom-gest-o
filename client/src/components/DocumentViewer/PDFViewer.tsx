import React, { useState, useEffect } from 'react';
import { Download, ExternalLink } from 'lucide-react';

interface PDFViewerProps {
  documentUrl: string;
  fileName: string;
  onError?: (error: any) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ 
  documentUrl, 
  fileName, 
  onError 
}) => {
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        console.log('🎯 [PDFViewer] Carregando PDF:', fileName);
        
        // Buscar o PDF como blob para contornar problemas de CORS/CSP
        const response = await fetch(documentUrl, {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            'Accept': 'application/pdf,*/*'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        console.log('✅ [PDFViewer] PDF carregado como blob, tamanho:', blob.size);
        
        // Criar URL temporária do blob
        const tempUrl = URL.createObjectURL(blob);
        setBlobUrl(tempUrl);
        
      } catch (err) {
        console.error('❌ [PDFViewer] Erro ao carregar PDF:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar PDF');
        onError?.(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();

    // Cleanup: revogar URL do blob quando componente for desmontado
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [documentUrl, fileName]);

  // Cleanup adicional quando blobUrl muda
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600">Carregando PDF...</p>
        </div>
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 p-6">
          <div className="text-red-500 text-lg">⚠️ Erro ao carregar PDF</div>
          {error && <p className="text-sm text-gray-600">{error}</p>}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.open(documentUrl, '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir em Nova Aba
            </button>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = documentUrl;
                link.download = fileName;
                link.click();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download className="h-4 w-4" />
              Baixar PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <iframe
        src={blobUrl}
        className="w-full h-full border-0 rounded-lg"
        style={{ minHeight: '90vh' }}
        title={`PDF: ${fileName}`}
        allow="fullscreen"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
};