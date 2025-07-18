import { useState, useEffect, useRef, useCallback } from 'react';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { AlertCircle, RefreshCw, Download } from 'lucide-react';

// Importa estilos específicos do react-pdf para eliminar warnings
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import '../styles/react-pdf-override.css';

// Cache global para manter viewer sempre carregado
const viewerCache = new Map<number, any>();
let globalDocViewer: any = null;

interface PersistentDocViewerProps {
  documentId: number;
  fileName: string;
  mimeType?: string;
  onDownload: () => void;
}

export default function PersistentDocViewer({ 
  documentId, 
  fileName, 
  mimeType, 
  onDownload 
}: PersistentDocViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const currentDocId = useRef(documentId);

  console.log(`🟢 [PersistentDocViewer] Montando para doc ${documentId}`);

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

  // Inicialização única que NUNCA muda
  const initializeViewer = useCallback(async () => {
    if (isInitialized.current && currentDocId.current === documentId) {
      console.log(`🟢 [PersistentDocViewer] Já inicializado para doc ${documentId}`);
      return;
    }

    try {
      console.log(`🟢 [PersistentDocViewer] Inicializando viewer para doc ${documentId}`);
      
      // Suprime warnings
      const originalConsoleWarn = console.warn;
      console.warn = (...args: any[]) => {
        const message = args.join(' ');
        if (message.includes('TextLayer styles not found') || 
            message.includes('AnnotationLayer styles not found')) {
          return;
        }
        originalConsoleWarn.apply(console, args);
      };

      const docUrl = `/api/documents/${documentId}/view?t=${Date.now()}`;
      const docs = [{
        uri: docUrl,
        fileName: fileName,
        fileType: mimeType || getFileType(fileName)
      }];

      // Cache persistente
      viewerCache.set(documentId, docs);
      currentDocId.current = documentId;
      isInitialized.current = true;
      setIsLoading(false);
      
      console.log(`✅ [PersistentDocViewer] Viewer inicializado com sucesso`);

      // Restore console.warn
      setTimeout(() => {
        console.warn = originalConsoleWarn;
      }, 2000);

    } catch (error) {
      console.error('❌ [PersistentDocViewer] Erro:', error);
      setHasError(true);
      setIsLoading(false);
    }
  }, [documentId, fileName, mimeType]); // Dependencies fixas

  // Efeito que executa apenas uma vez
  useEffect(() => {
    initializeViewer();
  }, [initializeViewer]);

  // Bloqueia QUALQUER evento que possa interferir
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const blockEvent = (e: Event) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    // Bloqueia todos os eventos que podem causar re-render
    const events = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend'];
    events.forEach(eventType => {
      container.addEventListener(eventType, blockEvent, { capture: true });
    });

    return () => {
      events.forEach(eventType => {
        container.removeEventListener(eventType, blockEvent, { capture: true });
      });
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

  const documents = viewerCache.get(documentId) || [];
  
  console.log(`🟢 [PersistentDocViewer] Renderizando com ${documents.length} documentos`);

  return (
    <div 
      ref={containerRef}
      className="persistent-doc-viewer w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
      style={{ 
        minHeight: '90vh',
        position: 'relative',
        zIndex: 1,
        isolation: 'isolate',
        contain: 'layout style paint size'
      }}
    >
      <div style={{ 
        color: '#666', 
        fontSize: '12px', 
        padding: '5px', 
        background: '#f0f0f0',
        borderBottom: '1px solid #ddd'
      }}>
        🟢 PERSISTENT VIEWER | Docs: {documents.length} | ID: {documentId} | Status: ATIVO
      </div>
      
      {documents.length > 0 && (
        <div
          ref={viewerRef}
          style={{
            height: '85vh',
            width: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <DocViewer
            key={`persistent-${documentId}-${Date.now()}`} // Key único com timestamp
            documents={documents}
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
              minHeight: '85vh',
              width: '100%',
              height: '85vh',
              maxHeight: '85vh',
              overflowY: 'auto',
              overflowX: 'hidden',
              position: 'relative',
              zIndex: 1
            }}
            className="w-full persistent-viewer"
            theme={{
              primary: "#3b82f6",
              secondary: "#f8fafc",
              tertiary: "#e2e8f0",
              textPrimary: "#0f172a",
              textSecondary: "#475569", 
              textTertiary: "#64748b",
              disableThemeScrollbar: false
            }}
            onError={(error) => {
              console.error(`❌ [PersistentDocViewer] DocViewer error:`, error);
              setHasError(true);
            }}
          />
        </div>
      )}
    </div>
  );
}