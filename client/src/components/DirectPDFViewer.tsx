import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

interface DirectPDFViewerProps {
  documentId: number;
  fileName: string;
  onDownload?: () => void;
}

export default function DirectPDFViewer({ documentId, fileName, onDownload }: DirectPDFViewerProps) {
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPDFData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔥 Buscando dados do PDF via fetch...');
        
        const response = await fetch(`/api/pdf-data/${documentId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('📄 Dados do PDF recebidos:', {
          mimeType: data.mimeType,
          fileName: data.fileName,
          size: data.size,
          base64Length: data.base64?.length || 0
        });
        
        if (data.base64) {
          const pdfBlob = new Blob(
            [Uint8Array.from(atob(data.base64), c => c.charCodeAt(0))],
            { type: data.mimeType || 'application/pdf' }
          );
          const pdfUrl = URL.createObjectURL(pdfBlob);
          setPdfData(pdfUrl);
        } else {
          throw new Error('Dados do PDF não disponíveis');
        }
        
      } catch (err) {
        console.error('Erro ao carregar PDF:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPDFData();
  }, [documentId]);

  const handleDownload = () => {
    if (pdfData) {
      const link = document.createElement('a');
      link.href = pdfData;
      link.download = fileName;
      link.click();
    }
    if (onDownload) {
      onDownload();
    }
  };

  const handleExternalView = () => {
    if (pdfData) {
      window.open(pdfData, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[580px] bg-gray-50 rounded">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Carregando documento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[580px] bg-red-50 rounded border border-red-200">
        <div className="text-center p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar PDF</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()} variant="outline" size="sm">
              Recarregar
            </Button>
            <Button onClick={handleDownload} variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[580px] bg-gray-50 rounded overflow-hidden">
      {pdfData && (
        <>
          <iframe
            src={pdfData}
            className="w-full h-full border-0"
            title={`PDF Viewer - ${fileName}`}
          />
          
          {/* Controles flutuantes */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              onClick={handleExternalView}
              size="sm"
              variant="secondary"
              className="bg-white bg-opacity-90 hover:bg-opacity-100 shadow-md"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir
            </Button>
            <Button
              onClick={handleDownload}
              size="sm"
              variant="secondary"
              className="bg-white bg-opacity-90 hover:bg-opacity-100 shadow-md"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}