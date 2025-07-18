import { useState, useEffect, useRef, memo } from 'react';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { AlertCircle, RefreshCw, Download } from 'lucide-react';

// Importa estilos específicos do react-pdf para eliminar warnings
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import '../styles/react-pdf-override.css';

interface IsolatedDocViewerProps {
  documentId: number;
  fileName: string;
  mimeType?: string;
  onDownload: () => void;
}

// Componente completamente isolado e memo para evitar re-renders
const IsolatedDocViewer = memo(function IsolatedDocViewer({ 
  documentId, 
  fileName, 
  mimeType, 
  onDownload 
}: IsolatedDocViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<any[]>([]);
  const isInitialized = useRef(false);
  const renderCount = useRef(0);

  // LOGS DETALHADOS DE DEBUGGING
  renderCount.current++;
  console.log(`🔍 [IsolatedDocViewer] RENDER #${renderCount.current} - docId: ${documentId}, fileName: ${fileName}`);
  console.log(`🔍 [IsolatedDocViewer] Estado atual: loading=${isLoading}, error=${hasError}, initialized=${isInitialized.current}`);
  console.log(`🔍 [IsolatedDocViewer] Documentos em cache: ${documentRef.current.length}`);

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

  // Inicialização única e permanente
  useEffect(() => {
    console.log(`🔍 [useEffect-INIT] Executando para docId: ${documentId}, isInitialized: ${isInitialized.current}`);
    
    if (isInitialized.current) {
      console.log(`🔍 [useEffect-INIT] Já inicializado, pulando...`);
      return;
    }

    const initializeDocument = async () => {
      try {
        console.log(`🔍 [initializeDocument] Iniciando carregamento do documento ${documentId}`);
        
        // Suprime warnings específicos do react-pdf
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

        console.log(`🔍 [initializeDocument] Documento configurado:`, docs[0]);
        
        documentRef.current = docs;
        setIsLoading(false);
        isInitialized.current = true;
        
        console.log(`🔍 [initializeDocument] Documento carregado com sucesso - cache atualizado`);

        // Restore console.warn
        setTimeout(() => {
          console.warn = originalConsoleWarn;
        }, 2000);

      } catch (error) {
        console.error('❌ [initializeDocument] Erro ao carregar documento:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    initializeDocument();
  }, [documentId]); // Só depende do documentId

  // Proteção contra eventos externos
  useEffect(() => {
    console.log(`🔍 [useEffect-EVENTS] Configurando event listeners`);
    
    const viewer = viewerRef.current;
    if (!viewer) {
      console.log(`🔍 [useEffect-EVENTS] viewerRef não encontrado`);
      return;
    }

    const handleDocumentClick = (e: Event) => {
      console.log(`🔍 [handleDocumentClick] Clique interceptado no viewer`, e.target);
      e.stopPropagation();
    };

    viewer.addEventListener('click', handleDocumentClick, { capture: true });
    console.log(`🔍 [useEffect-EVENTS] Event listeners configurados`);
    
    return () => {
      console.log(`🔍 [useEffect-EVENTS] Removendo event listeners`);
      viewer.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, []);

  // Monitor para mudanças de estado
  useEffect(() => {
    console.log(`🔍 [useEffect-STATE] Estado mudou: loading=${isLoading}, error=${hasError}`);
  }, [isLoading, hasError]);

  // Monitor para mudanças no cache de documentos
  useEffect(() => {
    console.log(`🔍 [useEffect-CACHE] Cache de documentos:`, documentRef.current);
  }, [documentRef.current]);

  if (isLoading) {
    console.log(`🔍 [RENDER] Exibindo tela de loading`);
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
    console.log(`🔍 [RENDER] Exibindo tela de erro`);
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

  console.log(`🔍 [RENDER] Renderizando DocViewer - documentos em cache: ${documentRef.current.length}`);
  
  return (
    <div 
      ref={viewerRef}
      className="isolated-doc-viewer w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
      style={{ 
        minHeight: '90vh',
        position: 'relative',
        zIndex: 1,
        isolation: 'isolate'
      }}
      onClick={(e) => {
        console.log(`🔍 [onClick] Clique no container do viewer`, e.target);
      }}
    >
      {documentRef.current.length > 0 ? (
        <>
          <div style={{ color: '#666', fontSize: '12px', padding: '5px', background: '#f0f0f0' }}>
            DEBUG: Docs: {documentRef.current.length} | Render: #{renderCount.current} | Key: isolated-{documentId}
          </div>
          <DocViewer
            key={`isolated-${documentId}`} // Key único baseado apenas no documentId
            documents={documentRef.current}
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
            className="w-full isolated-viewer"
            theme={{
              primary: "#3b82f6",
              secondary: "#f8fafc",
              tertiary: "#e2e8f0",
              textPrimary: "#0f172a",
              textSecondary: "#475569", 
              textTertiary: "#64748b",
              disableThemeScrollbar: false
            }}
            onError={() => {
              console.log(`❌ [DocViewer] Erro no DocViewer`);
              setHasError(true);
            }}
          />
        </>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          DEBUG: Nenhum documento em cache (documentRef.current vazio)
        </div>
      )}
    </div>
  );
});

export default IsolatedDocViewer;