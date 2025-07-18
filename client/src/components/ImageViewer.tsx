import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageViewerProps {
  documentId: number;
  fileName: string;
  onDownload?: () => void;
}

export default function ImageViewer({ documentId, fileName, onDownload }: ImageViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImage();
  }, [documentId]);

  const loadImage = async () => {
    try {
      console.log('🖼️ Iniciando carregamento de imagem - ID:', documentId);
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/documents/${documentId}/view`);
      
      console.log('📷 Resposta da imagem:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro ao carregar imagem:', errorText);
        throw new Error(`Erro ao carregar imagem: ${response.status} ${response.statusText}`);
      }

      // Converter resposta para blob e criar URL
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      console.log('✅ Imagem carregada com sucesso!');
      setImageUrl(url);
      
    } catch (error) {
      console.error('❌ Erro ao carregar imagem:', error);
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

  // Cleanup URL quando componente for desmontado
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Carregando imagem...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-red-50 rounded-lg">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-semibold text-red-700">Erro ao carregar imagem</h3>
        <p className="text-red-600 text-center">{error}</p>
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={loadImage}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            Tentar Novamente
          </Button>
          <Button 
            variant="outline" 
            onClick={handleOpenInNewTab}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Abrir Foto
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header com informações da imagem */}
      <div className="flex items-center justify-center p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-gray-900">{fileName}</span>
        </div>
      </div>

      {/* Visualizador da imagem */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="flex items-center justify-center p-4 bg-gray-100 min-h-[450px]">
            {imageUrl && (
              <div className="max-w-full max-h-full overflow-auto">
                <img 
                  src={imageUrl} 
                  alt={fileName}
                  className="max-w-full h-auto object-contain shadow-lg rounded-lg border border-gray-200"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}