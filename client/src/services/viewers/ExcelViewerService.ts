// Single Responsibility Principle (SRP) - Responsável APENAS pela lógica de visualização de Excel
import { IDocumentViewer, ViewerConfiguration, FallbackStrategy, DocumentViewerType } from '@/interfaces/IDocumentViewer';

export class ExcelViewerService implements IDocumentViewer {
  private static instance: ExcelViewerService;
  
  static getInstance(): ExcelViewerService {
    if (!ExcelViewerService.instance) {
      ExcelViewerService.instance = new ExcelViewerService();
    }
    return ExcelViewerService.instance;
  }

  canHandle(fileType: string, mimeType?: string): boolean {
    const type = fileType.toLowerCase();
    const mime = (mimeType || '').toLowerCase();
    
    return (
      type.includes('excel') ||
      type.includes('spreadsheet') ||
      type.includes('xls') ||
      type.includes('csv') ||
      mime.includes('application/vnd.ms-excel') ||
      mime.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
      mime.includes('text/csv')
    );
  }

  getViewerType(): DocumentViewerType {
    return DocumentViewerType.EXCEL;
  }

  getViewerConfig(): ViewerConfiguration {
    return {
      supportsMimeType: [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ],
      supportsExtensions: ['xls', 'xlsx', 'csv'],
      requiresSpecialHandling: true,
      fallbackStrategy: this.getFallbackStrategy()
    };
  }

  private getFallbackStrategy(): FallbackStrategy {
    return {
      primary: 'docviewer',
      secondary: 'iframe',
      errorMessage: 'Erro ao processar arquivo Excel. O arquivo pode estar corrompido ou em formato não suportado.'
    };
  }

  // Open/Closed Principle (OCP) - Método extensível para configurações específicas
  getSpecialViewerConfig() {
    return {
      header: {
        disableHeader: false,
        disableFileName: false,
        retainURLParams: true
      },
      csvDelimiter: ",",
      loadingRenderer: {
        showLoadingTimeout: true
      },
      // Configurações específicas para Excel
      excelConfig: {
        allowDownload: true,
        showWorksheetTabs: true,
        enableSearch: false,
        readOnly: true
      }
    };
  }

  // Liskov Substitution Principle (LSP) - Método compatível com interface base
  shouldUseIframeFallback(fileName: string): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    // Usar preview real com XLSX por padrão, fallback apenas em caso de erro
    return false; // Sempre tentar o preview real primeiro
  }
}