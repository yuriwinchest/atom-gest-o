// Service Layer - Responsável APENAS pela lógica de negócio dos documentos
// Dependency Inversion Principle (DIP) - Importa abstrações
import { DocumentViewerFactory } from './DocumentViewerFactory';
import { DocumentTypeDetectorService } from './DocumentTypeDetectorService';

export interface DocumentConfig {
  uri: string;
  fileName: string;
  fileType: string;
}

export interface ViewerConfig {
  header: {
    disableHeader: boolean;
    disableFileName: boolean;
    retainURLParams: boolean;
  };
  csvDelimiter: string;
  pdfZoom: {
    defaultZoom: number;
    zoomJump: number;
  };
  pdfVerticalScrollByDefault: boolean;
  pdfDefaultZoomMode: string;
  loadingRenderer: {
    showLoadingTimeout: boolean;
  };
}

// Single Responsibility Principle (SRP) - Responsável APENAS pela coordenação de visualização
export class DocumentViewerService {
  private static instance: DocumentViewerService;
  private documentsCache = new Map<number, DocumentConfig>();
  private viewerFactory: DocumentViewerFactory;
  private typeDetector: DocumentTypeDetectorService;
  
  private constructor() {
    this.viewerFactory = DocumentViewerFactory.getInstance();
    this.typeDetector = DocumentTypeDetectorService.getInstance();
  }
  
  static getInstance(): DocumentViewerService {
    if (!DocumentViewerService.instance) {
      DocumentViewerService.instance = new DocumentViewerService();
    }
    return DocumentViewerService.instance;
  }

  // Liskov Substitution Principle (LSP) - Método compatível com comportamento esperado
  getFileType(fileName: string): string {
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

  // Open/Closed Principle (OCP) - Método extensível para diferentes tipos de documento
  createDocumentConfig(documentId: number, fileName: string, mimeType?: string): DocumentConfig {
    const docUrl = `/api/documents/${documentId}/view?t=${Date.now()}`;
    const detectedType = this.typeDetector.detectType(fileName, mimeType);
    
    return {
      uri: docUrl,
      fileName: fileName,
      fileType: mimeType || this.typeDetector.getMimeTypeFromExtension(fileName.split('.').pop() || '')
    };
  }

  // Interface Segregation Principle (ISP) - Método específico para verificar se precisa tratamento especial
  requiresSpecialHandling(fileName: string, mimeType?: string): boolean {
    return this.viewerFactory.shouldUseSpecialHandling(fileName, mimeType);
  }

  // Dependency Inversion Principle (DIP) - Delega para factory especializada
  getSpecialViewerConfig(fileName: string, mimeType?: string) {
    return this.viewerFactory.getViewerConfig(fileName, mimeType);
  }

  cacheDocument(documentId: number, config: DocumentConfig): void {
    this.documentsCache.set(documentId, config);
  }

  getCachedDocument(documentId: number): DocumentConfig | undefined {
    return this.documentsCache.get(documentId);
  }

  getDefaultViewerConfig(): ViewerConfig {
    return {
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
    };
  }

  getViewerTheme() {
    return {
      primary: "#3b82f6",
      secondary: "#f8fafc",
      tertiary: "#e2e8f0",
      textPrimary: "#0f172a",
      textSecondary: "#475569", 
      textTertiary: "#64748b",
      disableThemeScrollbar: false
    };
  }
}