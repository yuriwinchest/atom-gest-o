// Interface Segregation Principle (ISP) - Interface específica para viewers
export interface IDocumentViewer {
  canHandle(fileType: string, mimeType?: string): boolean;
  getViewerType(): DocumentViewerType;
  getViewerConfig(): ViewerConfiguration;
}

// Dependency Inversion Principle (DIP) - Abstrações para configuração
export interface ViewerConfiguration {
  supportsMimeType: string[];
  supportsExtensions: string[];
  requiresSpecialHandling: boolean;
  fallbackStrategy: FallbackStrategy;
}

export interface FallbackStrategy {
  primary: 'docviewer' | 'iframe' | 'download';
  secondary: 'iframe' | 'download' | 'message';
  errorMessage: string;
}

export enum DocumentViewerType {
  PDF = 'pdf',
  EXCEL = 'excel', 
  WORD = 'word',
  POWERPOINT = 'powerpoint',
  TEXT = 'text',
  IMAGE = 'image',
  DEFAULT = 'default'
}

// Single Responsibility Principle (SRP) - Interface apenas para renderização
export interface IDocumentRenderer {
  render(documentUrl: string, fileName: string): JSX.Element;
}

// Interface para detecção de tipos
export interface IDocumentTypeDetector {
  detectType(fileName: string, mimeType?: string): DocumentViewerType;
  getMimeTypeFromExtension(extension: string): string;
}