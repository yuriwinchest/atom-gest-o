import { useState, useEffect, useMemo } from 'react';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { AlertCircle, RefreshCw, Download } from 'lucide-react';

// Importa estilos específicos do react-pdf para eliminar warnings
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import '../styles/react-pdf-override.css';

interface StableDocViewerProps {
  documentId: number;
  fileName: string;
  mimeType?: string;
  onDownload: () => void;
}

export function StableDocViewer({ documentId, fileName, mimeType, onDownload }: StableDocViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Documento estável que nunca muda após carregamento inicial
  const stableDocument = useMemo(() => {
    const docUrl = `/api/documents/${documentId}/view?t=${Date.now()}`;
    
    return [{
      uri: docUrl,
      fileName: fileName,
      fileType: mimeType || getFileType(fileName)
    }];
  }, [documentId]); // IMPORTANTE: só depende do documentId, não de outras props

  function getFileType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const typeMap: Record<string, string> = {
      'pdf': 'pdf',
      'docx': 'docx',
      'doc': 'docx',
      'xlsx': 'xlsx',
      'xls': 'xlsx',
      'pptx': 'pptx',
      'ppt': 'pptx',
      'txt': 'txt',
      'csv': 'csv'
    };
    return typeMap[ext || ''] || 'pdf';
  }

  // Carregamento inicial simples e supressão de warnings
  useEffect(() => {
    // Suprime warnings específicos do react-pdf
    const originalConsoleWarn = console.warn;
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      if (message.includes('TextLayer styles not found') || 
          message.includes('AnnotationLayer styles not found')) {
        return; // Suprime estes warnings específicos
      }
      originalConsoleWarn.apply(console, args);
    };

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
      console.warn = originalConsoleWarn;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full bg-white dark:bg-gray-800 rounded-lg" style={{ minHeight: '90vh' }}>
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="text-gray-600 dark:text-gray-300">Carregando documento...</p>
          <p className="text-sm text-gray-500">{fileName}</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center w-full bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300" style={{ minHeight: '90vh' }}>
        <div className="text-center space-y-4 p-8">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Erro ao carregar documento
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-md">
            Não foi possível carregar o documento. Tente recarregar a página.
          </p>
          <button
            onClick={onDownload}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar Arquivo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden stable-doc-viewer"
      style={{ minHeight: '90vh' }}
    >
      <DocViewer
        documents={stableDocument}
        pluginRenderers={DocViewerRenderers}
        config={{
          header: {
            disableHeader: false,
            disableFileName: false,
            retainURLParams: false
          },
          csvDelimiter: ",",
          pdfZoom: {
            defaultZoom: 1.0,
            zoomJump: 0.2
          },
          pdfVerticalScrollByDefault: true,
          pdfDefaultZoomMode: "fitToPage",
          loadingRenderer: {
            showLoadingTimeout: false
          }
        }}
        style={{
          minHeight: '90vh',
          width: '100%',
          height: '90vh',
          maxHeight: '90vh',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
        className="w-full stable-viewer"
        theme={{
          primary: "#3b82f6",
          secondary: "#f8fafc",
          tertiary: "#e2e8f0",
          textPrimary: "#0f172a",
          textSecondary: "#475569", 
          textTertiary: "#64748b",
          disableThemeScrollbar: false
        }}
        onError={() => setHasError(true)}
      />
    </div>
  );
}