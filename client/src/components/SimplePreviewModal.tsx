import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Download, FileText } from 'lucide-react';

interface SimplePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
  fileName: string;
}

export default function SimplePreviewModal({ 
  isOpen, 
  onClose, 
  documentId, 
  fileName 
}: SimplePreviewModalProps) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fileType, setFileType] = useState<string>('unknown');
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Detectar tipo de arquivo
  const detectFileType = (filename: string): string => {
    const ext = filename.toLowerCase().split('.').pop() || '';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['xls', 'xlsx'].includes(ext)) return 'excel';
    if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
    return 'unknown';
  };

  useEffect(() => {
    if (!isOpen || !documentId) {
      setDocumentUrl(null);
      setIsLoading(true);
      setPreviewError(null);
      return;
    }

    const fileTypeDetected = detectFileType(fileName);
    setFileType(fileTypeDetected);

    const loadDocument = async () => {
      try {
        setIsLoading(true);
        setPreviewError(null);
        
        // Para PDFs, tentar primeiro via view
        if (fileTypeDetected === 'pdf') {
          const viewUrl = `/api/documents/${documentId}/view`;
          setDocumentUrl(viewUrl);
        } else {
          // Para outros tipos, verificar se existe via HEAD request
          const response = await fetch(`/api/documents/${documentId}/view`, { method: 'HEAD' });
          if (response.ok) {
            setDocumentUrl(`/api/documents/${documentId}/view`);
          } else {
            throw new Error('Arquivo não encontrado ou corrompido');
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar documento:', error);
        setPreviewError(error instanceof Error ? error.message : 'Erro desconhecido');
        setDocumentUrl(null);
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [isOpen, documentId, fileName]);

  // Limpar URL quando fechar
  useEffect(() => {
    return () => {
      if (documentUrl && documentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [documentUrl]);

  const handleOpenNewTab = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  };

  const handleDownload = () => {
    const downloadUrl = `/api/documents/${documentId}/download`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Ícones por tipo de arquivo
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'word': return '📝';
      case 'excel': return '📊';
      case 'powerpoint': return '📈';
      default: return '📁';
    }
  };

  // Mensagem para tipos não suportados no preview
  const getPreviewMessage = (type: string) => {
    switch (type) {
      case 'pdf': 
        return 'Preview de PDF disponível';
      case 'word': 
        return 'Documentos Word não podem ser visualizados no browser. Use "Abrir em Nova Aba" ou "Download".';
      case 'excel': 
        return 'Planilhas Excel não podem ser visualizadas no browser. Use "Abrir em Nova Aba" ou "Download".';
      case 'powerpoint': 
        return 'Apresentações PowerPoint não podem ser visualizadas no browser. Use "Abrir em Nova Aba" ou "Download".';
      default: 
        return 'Tipo de arquivo não suportado para preview.';
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {getFileIcon(fileType)} Preview: {fileName}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownload}
                title="Download do arquivo"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleOpenNewTab}
                disabled={!documentUrl}
                title="Abrir em nova aba"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Nova Aba
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando {fileType === 'pdf' ? 'PDF' : 'documento'}...</p>
              </div>
            </div>
          ) : previewError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Erro no Preview</h3>
                <p className="text-red-600 mb-4">{previewError}</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={handleOpenNewTab}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Nova Aba
                  </Button>
                </div>
              </div>
            </div>
          ) : documentUrl && fileType === 'pdf' ? (
            <iframe
              src={documentUrl}
              className="w-full h-full border-0 rounded"
              title={`Preview: ${fileName}`}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">{getFileIcon(fileType)}</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">{fileName}</h3>
                <p className="text-gray-600 mb-6 max-w-md">{getPreviewMessage(fileType)}</p>
                <div className="flex gap-2 justify-center">
                  {documentUrl && (
                    <Button variant="outline" onClick={handleOpenNewTab}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Abrir Foto
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}