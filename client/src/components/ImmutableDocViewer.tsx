import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { AlertCircle, RefreshCw, Download } from 'lucide-react';

// Importa estilos específicos do react-pdf para eliminar warnings
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import '../styles/react-pdf-override.css';

// Singleton global para o DocViewer - NUNCA será recriado
class DocViewerSingleton {
  private static instance: DocViewerSingleton;
  private container: HTMLDivElement | null = null;
  private currentDocId: number | null = null;
  private isInitialized = false;

  static getInstance(): DocViewerSingleton {
    if (!DocViewerSingleton.instance) {
      DocViewerSingleton.instance = new DocViewerSingleton();
    }
    return DocViewerSingleton.instance;
  }

  getContainer(): HTMLDivElement {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'immutable-doc-viewer-portal';
      this.container.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        background: white;
      `;
      console.log('🔵 [Singleton] Container criado');
    }
    return this.container;
  }

  isCurrentDoc(docId: number): boolean {
    return this.currentDocId === docId && this.isInitialized;
  }

  setCurrentDoc(docId: number): void {
    this.currentDocId = docId;
    this.isInitialized = true;
    console.log(`🔵 [Singleton] Doc atual definido: ${docId}`);
  }

  reset(): void {
    this.currentDocId = null;
    this.isInitialized = false;
    console.log('🔵 [Singleton] Reset executado');
  }
}

interface ImmutableDocViewerProps {
  documentId: number;
  fileName: string;
  mimeType?: string;
  onDownload: () => void;
}

export default function ImmutableDocViewer({ 
  documentId, 
  fileName, 
  mimeType, 
  onDownload 
}: ImmutableDocViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isViewerReady, setIsViewerReady] = useState(false);
  const mountPointRef = useRef<HTMLDivElement>(null);
  const singleton = DocViewerSingleton.getInstance();

  console.log(`🔵 [ImmutableDocViewer] Render para doc ${documentId}`);

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

  // Inicialização do viewer
  useEffect(() => {
    console.log(`🔵 [useEffect] Iniciando para doc ${documentId}`);
    
    if (singleton.isCurrentDoc(documentId)) {
      console.log(`🔵 [useEffect] Doc ${documentId} já está carregado no singleton`);
      setIsLoading(false);
      setIsViewerReady(true);
      return;
    }

    const initViewer = async () => {
      try {
        console.log(`🔵 [initViewer] Carregando doc ${documentId}`);
        
        // Suprime warnings do react-pdf
        const originalWarn = console.warn;
        console.warn = (...args: any[]) => {
          const msg = args.join(' ');
          if (msg.includes('TextLayer') || msg.includes('AnnotationLayer')) return;
          originalWarn.apply(console, args);
        };

        const docUrl = `/api/documents/${documentId}/view?t=${Date.now()}`;
        const docs = [{
          uri: docUrl,
          fileName: fileName,
          fileType: mimeType || getFileType(fileName)
        }];

        // Marca como carregado no singleton
        singleton.setCurrentDoc(documentId);
        setIsLoading(false);
        setIsViewerReady(true);

        console.log(`✅ [initViewer] Doc ${documentId} carregado com sucesso`);

        // Restaura console.warn após 2s
        setTimeout(() => {
          console.warn = originalWarn;
        }, 2000);

      } catch (error) {
        console.error(`❌ [initViewer] Erro ao carregar doc ${documentId}:`, error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    initViewer();
  }, [documentId, fileName, mimeType]);

  // Monta o container no DOM
  useEffect(() => {
    const mountPoint = mountPointRef.current;
    if (!mountPoint || !isViewerReady) return;

    const container = singleton.getContainer();
    
    // Limpa container anterior
    container.innerHTML = '';
    
    // Monta no mount point
    mountPoint.appendChild(container);
    console.log(`🔵 [useEffect-MOUNT] Container montado para doc ${documentId}`);

    return () => {
      console.log(`🔵 [useEffect-MOUNT] Cleanup para doc ${documentId}`);
      // NÃO remove o container - ele fica permanente
    };
  }, [isViewerReady, documentId]);

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

  const docUrl = `/api/documents/${documentId}/view?t=${Date.now()}`;
  const docs = [{
    uri: docUrl,
    fileName: fileName,
    fileType: mimeType || getFileType(fileName)
  }];

  console.log(`🔵 [RENDER] Renderizando viewer imutável para doc ${documentId}`);

  return (
    <div 
      className="immutable-doc-viewer w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
      style={{ 
        minHeight: '90vh',
        position: 'relative',
        isolation: 'isolate',
        contain: 'strict'
      }}
    >
      <div style={{ 
        color: '#0066cc', 
        fontSize: '12px', 
        padding: '5px', 
        background: '#e6f3ff',
        borderBottom: '1px solid #cce6ff',
        fontWeight: 'bold'
      }}>
        🔵 IMMUTABLE VIEWER | Doc: {documentId} | Status: FIXO | Singleton: ATIVO
      </div>
      
      <div
        ref={mountPointRef}
        style={{
          height: '85vh',
          width: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {isViewerReady && createPortal(
          <DocViewer
            key={`immutable-${documentId}-singleton`}
            documents={docs}
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
            className="w-full immutable-viewer"
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
              console.error(`❌ [ImmutableDocViewer] DocViewer error:`, error);
              setHasError(true);
            }}
          />,
          singleton.getContainer()
        )}
      </div>
    </div>
  );
}