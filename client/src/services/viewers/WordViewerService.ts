// Single Responsibility Principle (SRP) - Responsável APENAS por configuração do Word Viewer
import { IDocumentViewer, ViewerConfig } from '@/interfaces/IDocumentViewer';

export class WordViewerService implements IDocumentViewer {
  private static instance: WordViewerService;

  static getInstance(): WordViewerService {
    if (!WordViewerService.instance) {
      WordViewerService.instance = new WordViewerService();
    }
    return WordViewerService.instance;
  }

  canHandle(fileName: string, mimeType?: string): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const mime = (mimeType || '').toLowerCase();
    
    return (
      extension === 'doc' || 
      extension === 'docx' ||
      mime.includes('application/msword') ||
      mime.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    );
  }

  getViewerConfig(): ViewerConfig {
    return {
      requiresSpecialHandling: true,
      fallbackStrategy: 'word-viewer',
      viewerType: 'word',
      config: {
        header: {
          disableHeader: false,
          disableFileName: false,
          retainURLParams: false
        },
        loadingRenderer: {
          showLoadingTimeout: false
        }
      }
    };
  }
}