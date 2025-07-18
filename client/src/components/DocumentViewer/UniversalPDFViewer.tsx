import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, ExternalLink, RotateCw } from 'lucide-react';

// Configurar worker do PDF.js de forma local para evitar problemas de CORS
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// Importar estilos necessários
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface UniversalPDFViewerProps {
  documentUrl: string;
  fileName: string;
  onError?: (error: any) => void;
}

export const UniversalPDFViewer: React.FC<UniversalPDFViewerProps> = ({ 
  documentUrl, 
  fileName, 
  onError 
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log('✅ [UniversalPDFViewer] PDF carregado com sucesso:', fileName, 'Páginas:', numPages);
    setNumPages(numPages);
    setPageNumber(1);
    setIsLoading(false);
    setError('');
  }, [fileName]);

  const onDocumentLoadError = useCallback((error: any) => {
    console.error('❌ [UniversalPDFViewer] Erro ao carregar PDF:', error);
    setError(error.message || 'Erro ao carregar PDF');
    setIsLoading(false);
    onError?.(error);
  }, [onError]);

  const goToPrevPage = () => {
    setPageNumber(page => Math.max(1, page - 1));
  };

  const goToNextPage = () => {
    setPageNumber(page => Math.min(numPages, page + 1));
  };

  const zoomIn = () => {
    setScale(scale => Math.min(3.0, scale + 0.2));
  };

  const zoomOut = () => {
    setScale(scale => Math.max(0.5, scale - 0.2));
  };

  const rotate = () => {
    setRotation(rotation => (rotation + 90) % 360);
  };

  const handleDownload = async () => {
    try {
      console.log('🔽 [Download] Iniciando download:', fileName);
      
      // Baixar arquivo como blob para garantir que funcione
      const response = await fetch(documentUrl, {
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/pdf,*/*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('✅ [Download] Arquivo baixado, tamanho:', blob.size);
      
      // Criar URL temporária e baixar
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpar URL temporária
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      
      console.log('✅ [Download] Download iniciado com sucesso');
    } catch (error) {
      console.error('❌ [Download] Erro ao baixar:', error);
      // Fallback para download direto
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = fileName;
      link.click();
    }
  };

  const handleOpenNewTab = () => {
    console.log('🔗 [Nova Aba] Abrindo em nova aba:', fileName);
    
    // Adicionar timestamp para evitar cache
    const urlWithTimestamp = `${documentUrl}?t=${Date.now()}`;
    window.open(urlWithTimestamp, '_blank', 'noopener,noreferrer');
    
    console.log('✅ [Nova Aba] Aberto em:', urlWithTimestamp);
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 p-6">
          <div className="text-red-500 text-lg">⚠️ Erro ao carregar PDF</div>
          <p className="text-sm text-gray-600">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleOpenNewTab}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir em Nova Aba
            </button>
            <button
              onClick={handleDownload}
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
    <div className="w-full h-full flex flex-col bg-gray-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-white border-b shadow-sm">
        <div className="flex items-center gap-2">
          {/* Navegação de páginas */}
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="text-sm text-gray-600 min-w-0 flex-shrink-0">
            {isLoading ? 'Carregando...' : `${pageNumber} / ${numPages}`}
          </span>
          
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Controles de zoom */}
          <button
            onClick={zoomOut}
            className="p-2 rounded hover:bg-gray-100"
            title="Diminuir zoom"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          
          <span className="text-sm text-gray-600 min-w-0 flex-shrink-0">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            className="p-2 rounded hover:bg-gray-100"
            title="Aumentar zoom"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          {/* Rotação */}
          <button
            onClick={rotate}
            className="p-2 rounded hover:bg-gray-100"
            title="Rotacionar"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          {/* Ações */}
          <div className="flex items-center gap-1 ml-2 border-l pl-2">
            <button
              onClick={handleDownload}
              className="p-2 rounded hover:bg-gray-100"
              title="Baixar PDF"
            >
              <Download className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleOpenNewTab}
              className="p-2 rounded hover:bg-gray-100"
              title="Abrir em nova aba"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visualizador de PDF */}
      <div className="flex-1 overflow-auto bg-gray-200 p-4">
        <div className="flex justify-center">
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Carregando PDF...</span>
            </div>
          )}

          <Document
            file={documentUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Carregando documento...</span>
              </div>
            }
            className="max-w-full"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              className="shadow-lg mx-auto"
              loading={
                <div className="flex items-center justify-center p-8 bg-white border border-gray-300">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600">Carregando página...</span>
                </div>
              }
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>
      </div>
    </div>
  );
};