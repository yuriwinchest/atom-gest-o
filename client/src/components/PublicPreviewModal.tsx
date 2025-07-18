import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, X, FileText, Download } from 'lucide-react';
import type { Document } from '@shared/schema';

// Importar os viewers existentes
import PDFViewer from './PDFViewer';
import WordViewer from './WordViewer';
import ExcelViewer from './ExcelViewer';
import ImageViewer from './ImageViewer';
import VideoViewer from './VideoViewer';
import AudioViewer from './AudioViewer';
import TextViewer from './TextViewer';

interface PublicPreviewModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PublicPreviewModal({ document, isOpen, onClose }: PublicPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!document) return null;

  // Extrair informações do documento
  const getDocumentInfo = () => {
    try {
      const documentDetails = JSON.parse(document.content || '{}');
      return {
        fileType: documentDetails?.fileType || '',
        fileName: documentDetails?.fileInfo?.originalName || document.title,
        supabaseUrl: documentDetails?.supabaseUrl || '',
        ...documentDetails
      };
    } catch (error) {
      return {
        fileType: '',
        fileName: document.title,
        supabaseUrl: ''
      };
    }
  };

  const docInfo = getDocumentInfo();

  // Determinar o viewer apropriado baseado no tipo de arquivo
  const renderViewer = () => {
    const fileType = docInfo.fileType.toLowerCase();
    
    if (fileType.includes('pdf')) {
      return <PDFViewer documentId={document.id} fileName={docInfo.fileName} />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <WordViewer documentId={document.id} fileName={docInfo.fileName} />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <ExcelViewer documentId={document.id} fileName={docInfo.fileName} />;
    } else if (fileType.includes('image')) {
      return <ImageViewer documentId={document.id} fileName={docInfo.fileName} />;
    } else if (fileType.includes('video')) {
      return <VideoViewer documentId={document.id} fileName={docInfo.fileName} />;
    } else if (fileType.includes('audio')) {
      return <AudioViewer documentId={document.id} fileName={docInfo.fileName} />;
    } else if (fileType.includes('text')) {
      return <TextViewer documentId={document.id} fileName={docInfo.fileName} />;
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-48 sm:h-96 bg-gray-50 rounded-lg p-4">
          <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 text-center">Preview não disponível</h3>
          <p className="text-gray-600 text-center text-sm sm:text-base max-w-sm sm:max-w-md leading-relaxed">
            Este tipo de arquivo não pode ser visualizado diretamente no navegador. Use os botões no cabeçalho para baixar ou ver em uma nova aba.
          </p>
        </div>
      );
    }
  };

  const handleDownload = () => {
    window.open(`/api/documents/${document.id}/download`, '_blank');
  };

  const handleOpenInNewTab = () => {
    window.open(`/api/documents/${document.id}/view`, '_blank');
  };

  const handleViewDetails = () => {
    onClose();
    window.open(`/document/${document.id}?public=true`, '_self');
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-[95vw] sm:max-w-7xl h-[95vh] p-0 [&>button]:hidden overflow-hidden">
        {/* Header do modal */}
        <DialogHeader className="px-3 sm:px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Título e ícone */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg shrink-0">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                  {document.title}
                </DialogTitle>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Preview público do documento
                </p>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="text-green-600 border-green-600 hover:bg-green-50 text-xs sm:text-sm px-2 sm:px-3"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Baixar</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewDetails}
                className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs sm:text-sm px-2 sm:px-3"
              >
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Ver Detalhes</span>
                <span className="sm:hidden">Detalhes</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 hover:border-red-400 transition-all duration-200 hover:shadow-md text-xs sm:text-sm px-2 sm:px-3"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">Fechar</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Área de visualização */}
        <div className="flex-1 p-2 sm:p-6 overflow-auto min-h-0">
          {renderViewer()}
        </div>
      </DialogContent>
    </Dialog>
  );
}