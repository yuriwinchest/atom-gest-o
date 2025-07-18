import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, FileText, AlertCircle } from 'lucide-react';

interface TextViewerProps {
  documentId: number;
  fileName: string;
  onDownload?: () => void;
}

export default function TextViewer({ documentId, fileName, onDownload }: TextViewerProps) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadText();
  }, [documentId]);

  const loadText = async () => {
    try {
      console.log('📄 Iniciando carregamento de texto - ID:', documentId);
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/documents/${documentId}/view`);
      
      console.log('📝 Resposta do texto:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro ao carregar texto:', errorText);
        throw new Error(`Erro ao carregar texto: ${response.status} ${response.statusText}`);
      }

      // Ler conteúdo como texto
      const textData = await response.text();
      
      console.log('✅ Texto carregado com sucesso!', textData.length, 'caracteres');
      setTextContent(textData);
      
    } catch (error) {
      console.error('❌ Erro ao carregar texto:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInNewTab = () => {
    const url = `/api/documents/${documentId}/view?t=${Date.now()}`;
    window.open(url, '_blank');
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      const link = document.createElement('a');
      link.href = `/api/documents/${documentId}/view`;
      link.download = fileName;
      link.click();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Carregando arquivo de texto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-red-50 rounded-lg">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-semibold text-red-700">Erro ao carregar arquivo</h3>
        <p className="text-red-600 text-center">{error}</p>
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={loadText}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            Tentar Novamente
          </Button>
          <Button 
            variant="outline" 
            onClick={handleOpenInNewTab}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir em Nova Aba
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header com informações do arquivo */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-gray-900">{fileName}</span>
          {textContent && (
            <span className="text-sm text-gray-500">
              ({textContent.length.toLocaleString()} caracteres)
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleOpenInNewTab}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Abrir Foto
          </Button>

        </div>
      </div>

      {/* Visualizador de texto */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="p-4 bg-white">
            {textContent && (
              <div className="max-h-[450px] overflow-auto">
                <pre 
                  className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                  }}
                >
                  {textContent}
                </pre>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}