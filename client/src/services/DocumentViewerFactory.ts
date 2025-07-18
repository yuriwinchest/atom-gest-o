// Open/Closed Principle (OCP) e Dependency Inversion Principle (DIP)
// Factory extensível que depende de abstrações
import { IDocumentViewer, DocumentViewerType } from '@/interfaces/IDocumentViewer';
import { ExcelViewerService } from './viewers/ExcelViewerService';
import { WordViewerService } from './viewers/WordViewerService';
import { DocumentTypeDetectorService } from './DocumentTypeDetectorService';

export class DocumentViewerFactory {
  private static instance: DocumentViewerFactory;
  private viewers: Map<DocumentViewerType, IDocumentViewer> = new Map();
  private typeDetector: DocumentTypeDetectorService;
  
  private constructor() {
    this.typeDetector = DocumentTypeDetectorService.getInstance();
    this.registerViewers();
  }
  
  static getInstance(): DocumentViewerFactory {
    if (!DocumentViewerFactory.instance) {
      DocumentViewerFactory.instance = new DocumentViewerFactory();
    }
    return DocumentViewerFactory.instance;
  }

  // Open/Closed Principle (OCP) - Permite adicionar novos viewers sem modificar código existente
  private registerViewers(): void {
    this.viewers.set(DocumentViewerType.EXCEL, ExcelViewerService.getInstance());
    this.viewers.set(DocumentViewerType.WORD, WordViewerService.getInstance());
    // Futuro: Adicionar outros viewers aqui sem modificar código existente
    // this.viewers.set(DocumentViewerType.PDF, PDFViewerService.getInstance());
  }

  // Single Responsibility Principle (SRP) - Responsável APENAS por criar o viewer apropriado
  createViewer(fileName: string, mimeType?: string): IDocumentViewer | null {
    const documentType = this.typeDetector.detectType(fileName, mimeType);
    const viewer = this.viewers.get(documentType);
    
    if (viewer && viewer.canHandle(fileName, mimeType)) {
      return viewer;
    }
    
    return null; // Retorna null para usar viewer padrão
  }

  // Interface Segregation Principle (ISP) - Método específico para obter configuração
  getViewerConfig(fileName: string, mimeType?: string) {
    const viewer = this.createViewer(fileName, mimeType);
    return viewer?.getViewerConfig() || null;
  }

  // Dependency Inversion Principle (DIP) - Método que trabalha com abstrações
  shouldUseSpecialHandling(fileName: string, mimeType?: string): boolean {
    const viewer = this.createViewer(fileName, mimeType);
    return viewer?.getViewerConfig().requiresSpecialHandling || false;
  }

  // Método para obter estratégia de fallback
  getFallbackStrategy(fileName: string, mimeType?: string) {
    const viewer = this.createViewer(fileName, mimeType);
    return viewer?.getViewerConfig().fallbackStrategy || null;
  }
}