import { useState, useEffect } from 'react';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { FileText, Download, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import './CustomDocViewerStyles.css';

interface UniversalDocViewerProps {
  documentId: number;
  fileName: string;
  mimeType?: string;
  onDownload: () => void;
}

export function UniversalDocViewer({ documentId, fileName, mimeType, onDownload }: UniversalDocViewerProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [docError, setDocError] = useState(false);

  // Carrega documento uma única vez
  useEffect(() => {
    const loadDocument = async () => {
      try {
        setIsLoading(true);
        setDocError(false);
        
        const docUrl = `/api/documents/${documentId}/view?t=${Date.now()}`;
        const docs = [{
          uri: docUrl,
          fileName: fileName,
          fileType: mimeType || getFileTypeFromName(fileName)
        }];

        setDocuments(docs);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Erro ao carregar documento:', error);
        setDocError(true);
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [documentId, fileName, mimeType]);

  function getFileTypeFromName(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const typeMap: Record<string, string> = {
      'pdf': 'pdf',
      'doc': 'docx',
      'docx': 'docx',
      'xls': 'xlsx',
      'xlsx': 'xlsx',
      'ppt': 'pptx',
      'pptx': 'pptx',
      'txt': 'txt',
      'csv': 'csv',
      'png': 'png',
      'jpg': 'jpg',
      'jpeg': 'jpg',
      'gif': 'gif',
      'bmp': 'bmp',
      'tiff': 'tiff'
    };
    return typeMap[ext || ''] || 'pdf';
  }

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

  if (docError) {
    return (
      <div className="flex items-center justify-center w-full bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300" style={{ minHeight: '90vh' }}>
        <div className="text-center space-y-4 p-8">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Erro ao carregar documento
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-md">
            Não foi possível carregar o documento. Verifique se o arquivo existe e tente novamente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </button>
            <button
              onClick={onDownload}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Arquivo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden" style={{ minHeight: '90vh' }}>
      {documents.length > 0 && (
        <DocViewer
          key={`doc-${documentId}-${documents[0]?.uri}`}
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
            minHeight: '90vh',
            width: '100%',
            height: '90vh',
            maxHeight: '90vh',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
          className="w-full"
          theme={{
            primary: "#3b82f6",
            secondary: "#f8fafc",
            tertiary: "#e2e8f0",
            textPrimary: "#0f172a",
            textSecondary: "#475569", 
            textTertiary: "#64748b",
            disableThemeScrollbar: false
          }}
        />
      )}
    </div>
  );
}