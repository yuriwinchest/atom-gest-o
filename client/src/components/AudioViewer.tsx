import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Music, AlertCircle } from 'lucide-react';

interface AudioViewerProps {
  documentId: number;
  fileName: string;
  onDownload?: () => void;
}

export default function AudioViewer({ documentId, fileName, onDownload }: AudioViewerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAudio();
  }, [documentId]);

  const loadAudio = async () => {
    try {
      console.log('🎵 Iniciando carregamento de áudio - ID:', documentId);
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/documents/${documentId}/view`);
      
      console.log('🎶 Resposta do áudio:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro ao carregar áudio:', errorText);
        throw new Error(`Erro ao carregar áudio: ${response.status} ${response.statusText}`);
      }

      // Converter resposta para blob e criar URL
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      console.log('✅ Áudio carregado com sucesso!');
      setAudioUrl(url);
      
    } catch (error) {
      console.error('❌ Erro ao carregar áudio:', error);
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
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Carregando áudio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-red-50 rounded-lg">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-semibold text-red-700">Erro ao carregar áudio</h3>
        <p className="text-red-600 text-center">{error}</p>
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={loadAudio}
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
      {/* Header com informações do áudio */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-gray-900">{fileName}</span>
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

      {/* Player de áudio */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center space-y-6">
          {/* Ícone musical decorativo */}
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Music className="h-12 w-12 text-white" />
          </div>
          
          {/* Nome do arquivo */}
          <h3 className="text-xl font-semibold text-gray-800">{fileName}</h3>
          
          {/* Player de áudio */}
          {audioUrl && (
            <audio 
              controls 
              className="w-full max-w-md mx-auto"
              style={{ minWidth: '300px' }}
            >
              <source src={audioUrl} type="audio/mpeg" />
              <source src={audioUrl} type="audio/wav" />
              <source src={audioUrl} type="audio/ogg" />
              Seu navegador não suporta a reprodução de áudio.
            </audio>
          )}
          
          {/* Informações adicionais */}
          <p className="text-gray-600">
            Use os controles acima para reproduzir o arquivo de áudio
          </p>
        </div>
      </div>
    </div>
  );
}