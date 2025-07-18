// Single Responsibility Principle (SRP) - Responsável APENAS por detectar tipos de documento
import { IDocumentTypeDetector, DocumentViewerType } from '@/interfaces/IDocumentViewer';

export class DocumentTypeDetectorService implements IDocumentTypeDetector {
  private static instance: DocumentTypeDetectorService;
  
  static getInstance(): DocumentTypeDetectorService {
    if (!DocumentTypeDetectorService.instance) {
      DocumentTypeDetectorService.instance = new DocumentTypeDetectorService();
    }
    return DocumentTypeDetectorService.instance;
  }

  detectType(fileName: string, mimeType?: string): DocumentViewerType {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const mime = (mimeType || '').toLowerCase();

    // Detecção específica por MIME type (mais confiável)
    if (mime.includes('application/vnd.ms-excel') || mime.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      return DocumentViewerType.EXCEL;
    }
    
    if (mime.includes('application/pdf')) {
      return DocumentViewerType.PDF;
    }
    
    if (mime.includes('application/msword') || mime.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      return DocumentViewerType.WORD;
    }
    
    if (mime.includes('application/vnd.ms-powerpoint') || mime.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
      return DocumentViewerType.POWERPOINT;
    }
    
    if (mime.includes('text/') || mime.includes('application/json')) {
      return DocumentViewerType.TEXT;
    }
    
    if (mime.includes('image/')) {
      return DocumentViewerType.IMAGE;
    }

    // Fallback para extensão de arquivo
    switch (extension) {
      case 'xls':
      case 'xlsx':
      case 'csv':
        return DocumentViewerType.EXCEL;
      case 'pdf':
        return DocumentViewerType.PDF;
      case 'doc':
      case 'docx':
        return DocumentViewerType.WORD;
      case 'ppt':
      case 'pptx':
        return DocumentViewerType.POWERPOINT;
      case 'txt':
      case 'json':
      case 'xml':
      case 'md':
        return DocumentViewerType.TEXT;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
      case 'svg':
        return DocumentViewerType.IMAGE;
      default:
        return DocumentViewerType.DEFAULT;
    }
  }

  getMimeTypeFromExtension(extension: string): string {
    const mimeMap: Record<string, string> = {
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'csv': 'text/csv',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain',
      'json': 'application/json',
      'xml': 'application/xml',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml'
    };
    
    return mimeMap[extension.toLowerCase()] || 'application/octet-stream';
  }
}