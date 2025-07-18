import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Play, AlertCircle } from 'lucide-react';

interface VideoViewerProps {
  documentId: number;
  fileName: string;
  onDownload?: () => void;
}

export default function VideoViewer({ documentId, fileName, onDownload }: VideoViewerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVideo();
  }, [documentId]);

  const loadVideo = async () => {
    try {
      console.log('🎥 Iniciando carregamento de vídeo - ID:', documentId);
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/documents/${documentId}/view`);
      
      console.log('📹 Resposta do vídeo:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro ao carregar vídeo:', errorText);
        throw new Error(`Erro ao carregar vídeo: ${response.status} ${response.statusText}`);
      }

      // Converter resposta para blob e criar URL
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      console.log('✅ Vídeo carregado com sucesso!');
      setVideoUrl(url);
      
    } catch (error) {
      console.error('❌ Erro ao carregar vídeo:', error);
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
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Carregando vídeo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-red-50 rounded-lg">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-semibold text-red-700">Erro ao carregar vídeo</h3>
        <p className="text-red-600 text-center">{error}</p>
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={loadVideo}
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
      {/* Header com informações do vídeo */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <Play className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-gray-900">{fileName}</span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleOpenInNewTab}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir em Nova Aba
          </Button>
          <Button 
            size="sm"
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Player de vídeo */}
      <div className="flex-1 flex items-center justify-center p-4 bg-black">
        {videoUrl && (
          <video 
            controls 
            className="max-w-full max-h-full"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          >
            <source src={videoUrl} type="video/mp4" />
            <source src={videoUrl} type="video/webm" />
            <source src={videoUrl} type="video/ogg" />
            Seu navegador não suporta a reprodução de vídeo.
          </video>
        )}
      </div>
    </div>
  );
}