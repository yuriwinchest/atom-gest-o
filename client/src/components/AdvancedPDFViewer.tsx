import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, ExternalLink, RefreshCw } from 'lucide-react';

interface AdvancedPDFViewerProps {
  documentId: number;
  fileName: string;
  onDownload?: () => void;
}

export default function AdvancedPDFViewer({ documentId, fileName, onDownload }: AdvancedPDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string>('');

  useEffect(() => {
    loadPdfFile();
    
    // Cleanup: revogar URL quando componente desmontar
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [documentId]);

  const loadPdfFile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Iniciando carregamento PDF - ID:', documentId);

      // Revogar URL anterior se existir
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }

      // Buscar arquivo do servidor
      const response = await fetch(`/api/documents/${documentId}/view`);
      
      console.log('📄 Resposta PDF:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro PDF Response:', errorText);
        
        // Tentar parsear resposta de erro do servidor
        let errorDetails = null;
        try {
          errorDetails = JSON.parse(errorText);
        } catch {
          // Se não conseguir parsear, usar resposta original
        }
        
        if (response.status === 404 && errorDetails?.details) {
          throw new Error(`Arquivo não encontrado: ${errorDetails.details}`);
        } else {
          throw new Error(`Erro ao carregar arquivo PDF: ${response.status} ${response.statusText}`);
        }
      }

      const blob = await response.blob();
      console.log('📄 Blob recebido:', blob.size, 'bytes, tipo:', blob.type);
      
      // Verificar se é realmente um PDF
      if (!blob.type.includes('pdf') && !fileName.toLowerCase().includes('.pdf')) {
        console.warn('⚠️ Tipo de arquivo pode não ser PDF:', blob.type);
      }

      // Criar URL temporária usando createObjectURL
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      
      // Calcular tamanho do arquivo
      const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
      setFileSize(`${sizeMB} MB`);

      console.log('✅ PDF carregado com sucesso! URL:', url);

    } catch (err) {
      console.error('❌ Erro ao carregar PDF:', err);
      setError(`Erro ao carregar PDF: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadPdfFile();
  };

  const handleOpenNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      window.open(`/api/documents/${documentId}/view`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando PDF...</p>
        </div>
      </div>
    );
  }

  if (error || !pdfUrl) {
    const isFileNotFound = error?.includes('Arquivo não encontrado');
    
    return (
      <div className="flex items-center justify-center h-[400px] text-center">
        <div className="max-w-md">
          <div className="bg-red-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <FileText className="w-12 h-12 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            {isFileNotFound ? 'Arquivo Não Encontrado' : 'Erro no Preview'}
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          
          {isFileNotFound && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
              <p className="text-sm text-blue-800">
                <strong>💡 Solução:</strong> Este documento foi cadastrado mas o arquivo PDF não foi enviado para o armazenamento. Use o botão "Anexar Documento" para fazer upload do arquivo.
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button onClick={handleOpenNewTab} variant="outline">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Abrir Foto
            </Button>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[400px] flex flex-col">
      {/* Header com controles */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-gray-800">Documento PDF</h3>
            <Badge variant="outline">{fileName}</Badge>
            {fileSize && <Badge variant="secondary">{fileSize}</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
            {onDownload && (
              <Button onClick={onDownload} size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Visualizador PDF */}
      <div className="flex-1 bg-gray-100">
        <iframe
          src={pdfUrl}
          className="w-full h-full border-0"
          title={`PDF Viewer - ${fileName}`}
          style={{ 
            minHeight: '300px',
            backgroundColor: '#f8f9fa'
          }}
        />
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t text-xs text-gray-600">
        <div className="flex justify-between items-center">
          <span>Visualizador PDF nativo do navegador</span>
          <span>Use Ctrl+Scroll para zoom • Ctrl+F para buscar</span>
        </div>
      </div>
    </div>
  );
}