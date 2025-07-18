import React, { useState, useEffect } from 'react';
import { Download, ExternalLink } from 'lucide-react';

interface MobilePDFViewerProps {
  documentUrl: string;
  fileName: string;
}

export const MobilePDFViewer: React.FC<MobilePDFViewerProps> = ({ 
  documentUrl, 
  fileName 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [canDisplayPDF, setCanDisplayPDF] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');

  useEffect(() => {
    testPDFCompatibility();
  }, [documentUrl]);

  const testPDFCompatibility = async () => {
    try {
      setIsLoading(true);
      console.log('🧪 [MobilePDFViewer] Testando compatibilidade PDF:', fileName);
      
      // Baixar PDF como blob
      const response = await fetch(documentUrl, {
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const blob = await response.blob();
      setPdfBlob(blob);
      
      // Verificar se é PDF válido
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const header = String.fromCharCode(...bytes.slice(0, 8));
      
      if (!header.startsWith('%PDF')) {
        throw new Error('Não é um PDF válido');
      }
      
      // Criar URL temporária
      const blobUrl = URL.createObjectURL(blob);
      setPdfUrl(blobUrl);
      
      // Testar se o navegador suporta visualização de PDF
      setCanDisplayPDF(true);
      console.log('✅ [MobilePDFViewer] PDF compatível:', blob.size, 'bytes');
      
    } catch (error) {
      console.error('❌ [MobilePDFViewer] Erro ao testar PDF:', error);
      setCanDisplayPDF(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  const handleOpenNewTab = () => {
    const baseUrl = documentUrl.split('?')[0];
    const urlWithTimestamp = `${baseUrl}?t=${Date.now()}`;
    window.open(urlWithTimestamp, '_blank');
  };

  if (isLoading) {
    return (
      <div className="w-full h-[70vh] flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p>Preparando visualização...</p>
        </div>
      </div>
    );
  }

  if (!canDisplayPDF || !pdfUrl) {
    return (
      <div className="w-full h-[70vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
        <div className="text-center space-y-6 p-6 max-w-md">
          <div className="text-6xl">📄</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">PDF Disponível</h3>
            <p className="text-sm text-gray-600 mb-4">
              Este PDF está pronto para visualização. Use os botões abaixo para acessar o documento.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleOpenNewTab}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir em Nova Aba
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg"
            >
              <Download className="h-4 w-4" />
              Baixar Documento
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            📁 {fileName}
          </p>
        </div>
      </div>
    );
  }

  // Tentar múltiplas abordagens de visualização
  return (
    <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-white border-b">
        <span className="text-sm font-medium text-gray-700 truncate">{fileName}</span>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
          >
            Baixar
          </button>
          <button
            onClick={handleOpenNewTab}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Nova Aba
          </button>
        </div>
      </div>

      {/* Área de visualização com múltiplas tentativas */}
      <div className="h-[70vh] p-4 bg-gray-200">
        <div className="w-full h-full bg-white rounded shadow relative">
          
          {/* Primeira tentativa: object tag (melhor suporte mobile) */}
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-full"
            style={{ minHeight: '400px' }}
          >
            
            {/* Segunda tentativa: embed tag */}
            <embed
              src={pdfUrl}
              type="application/pdf"
              className="w-full h-full"
              style={{ minHeight: '400px' }}
            />
            
            {/* Fallback final: interface com botões */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center space-y-4 p-6">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-lg font-semibold mb-2">PDF Pronto para Visualização</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Seu navegador móvel não consegue exibir o PDF diretamente. 
                  Use os botões para acessar o documento.
                </p>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleOpenNewTab}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir em Nova Aba
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <Download className="h-4 w-4" />
                    Baixar
                  </button>
                </div>
              </div>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
};