// Renderer Component - Responsável APENAS pela renderização do DocViewer
// Open/Closed Principle (OCP) - Extensível para diferentes tipos de renderer
import { memo } from 'react';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { DocumentConfig, ViewerConfig, DocumentViewerService } from '@/services/DocumentViewerService';
import { DocumentViewerFactory } from '@/services/DocumentViewerFactory';
import { DocumentViewerType } from '@/interfaces/IDocumentViewer';
import { ExcelViewer } from './ExcelViewer';
import { FallbackExcelViewer } from './FallbackExcelViewer';
import { WordViewer } from './WordViewer';
import { PDFViewer } from './PDFViewer';
import { UniversalPDFViewer } from './UniversalPDFViewer';
import { SimplePDFViewer } from './SimplePDFViewer';
import { MobilePDFViewer } from './MobilePDFViewer';


// Importa estilos específicos do react-pdf
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

interface DocumentViewerRendererProps {
  documentConfig: DocumentConfig;
  viewerConfig: ViewerConfig;
  theme: any;
  onError: (error: any) => void;
}

// Dependency Inversion Principle (DIP) - Component depende de abstrações
export const DocumentViewerRenderer = memo(function DocumentViewerRenderer({
  documentConfig,
  viewerConfig,
  theme,
  onError
}: DocumentViewerRendererProps) {
  console.log('🎯 [DocumentViewerRenderer] Renderizando:', documentConfig.fileName);
  
  const viewerService = DocumentViewerService.getInstance();
  const viewerFactory = DocumentViewerFactory.getInstance();
  
  // Single Responsibility Principle (SRP) - Delega detecção para service especializado
  const requiresSpecialHandling = viewerService.requiresSpecialHandling(
    documentConfig.fileName, 
    documentConfig.fileType
  );

  // Interface Segregation Principle (ISP) - Renderização específica para cada tipo
  const fallbackStrategy = viewerFactory.getFallbackStrategy(
    documentConfig.fileName, 
    documentConfig.fileType
  );
  
  // Liskov Substitution Principle (LSP) - Viewers específicos podem substituir DocViewer
  const isExcelFile = documentConfig.fileName.toLowerCase().includes('.xls') || 
                      documentConfig.fileType.includes('excel') ||
                      documentConfig.fileType.includes('spreadsheet');
  
  const isWordFile = documentConfig.fileName.toLowerCase().includes('.doc') || 
                     documentConfig.fileType.includes('wordprocessingml') ||
                     documentConfig.fileType.includes('msword');
  
  const isPdfFile = documentConfig.fileName.toLowerCase().includes('.pdf') || 
                    documentConfig.fileType.includes('pdf');
  
  // Detectar se é dispositivo móvel para usar viewer específico
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isPdfFile) {
    console.log('🎯 [DocumentViewerRenderer] PDF detectado, usando viewer especializado para:', isMobile ? 'Mobile' : 'Desktop');
    
    if (isMobile) {
      return (
        <MobilePDFViewer
          documentUrl={documentConfig.uri}
          fileName={documentConfig.fileName}
        />
      );
    }
    
    return (
      <SimplePDFViewer
        documentUrl={documentConfig.uri}
        fileName={documentConfig.fileName}
        onError={onError}
      />
    );
  }
  
  if (requiresSpecialHandling) {
    
    if (fallbackStrategy && isExcelFile) {
      console.log('🎯 [DocumentViewerRenderer] Usando ExcelViewer com biblioteca XLSX para:', documentConfig.fileName);
      return (
        <ExcelViewer
          documentUrl={documentConfig.uri}
          fileName={documentConfig.fileName}
          onError={onError}
        />
      );
    }
    
    if (fallbackStrategy && isWordFile) {
      console.log('🎯 [DocumentViewerRenderer] Usando WordViewer especializado para:', documentConfig.fileName);
      return (
        <WordViewer
          documentUrl={documentConfig.uri}
          fileName={documentConfig.fileName}
          onError={onError}
        />
      );
    }

    
    // Para outros tipos de arquivo, usar fallback com botões
    if (fallbackStrategy) {
      console.log('🎯 [DocumentViewerRenderer] Usando fallback para:', documentConfig.fileName);
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-gray-600">
              <p>Arquivo não pode ser visualizado diretamente no navegador</p>
              <p className="text-sm">Tipo: {documentConfig.fileType}</p>
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => window.open(documentConfig.uri, '_blank')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Abrir em Nova Aba
              </button>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = documentConfig.uri;
                  link.download = documentConfig.fileName;
                  link.click();
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Baixar Arquivo
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Renderização padrão com DocViewer
  return (
    <DocViewer
      key={`doc-${documentConfig.uri}`}
      documents={[documentConfig]}
      pluginRenderers={DocViewerRenderers}
      config={viewerConfig}
      style={{
        minHeight: '100%',
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        zIndex: 1
      }}
      className="w-full document-viewer-renderer"
      theme={theme}
      onError={onError}
    />
  );
});

export default DocumentViewerRenderer;