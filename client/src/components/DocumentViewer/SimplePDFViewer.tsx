import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface SimplePDFViewerProps {
  documentUrl: string;
  fileName: string;
  onError?: (error: any) => void;
}

export const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ 
  documentUrl, 
  fileName, 
  onError 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(Date.now());

  const loadPDF = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // ADICIONAR TIMESTAMP ÚNICO PARA FORÇAR RELOAD APÓS EDIÇÃO
      const separator = documentUrl.includes('?') ? '&' : '?';
      const urlWithTimestamp = `${documentUrl}${separator}t=${refreshKey}&refresh=${Date.now()}`;
      console.log('🔍 [SimplePDFViewer] Carregando PDF com anti-cache:', urlWithTimestamp);
      
      const response = await fetch(urlWithTimestamp, {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-cache', // Forçar reload sem cache
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        console.log('🚨 [SimplePDFViewer] Resposta da API:', response.status, response.statusText);
        
        // Tentar obter detalhes do erro da resposta JSON
        try {
          const errorData = await response.json();
          console.log('📋 [SimplePDFViewer] Detalhes do erro:', errorData);
          
          if (errorData.code === 'DOCUMENTO_SEM_ARQUIVO' || response.status === 404) {
            console.log('📄 [SimplePDFViewer] Documento sem arquivo físico detectado');
            throw new Error('DOCUMENTO_SEM_ARQUIVO');
          }
          
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        } catch (jsonError) {
          // Se não conseguir parsear JSON, usar erro HTTP padrão
          if (response.status === 404) {
            console.log('📄 [SimplePDFViewer] Documento não encontrado');
            throw new Error('DOCUMENTO_SEM_ARQUIVO');
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
      
      const blob = await response.blob();
      console.log('📁 [SimplePDFViewer] Blob criado:', blob.size, 'bytes');
      
      // Verificar se é PDF válido
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const header = String.fromCharCode(...bytes.slice(0, 8));
      
      if (!header.startsWith('%PDF')) {
        throw new Error(`Arquivo não é PDF válido. Header: ${header}`);
      }
      
      // Criar URL do blob para visualização
      const blobUrl = URL.createObjectURL(blob);
      setPdfBlobUrl(blobUrl);
      console.log('✅ [SimplePDFViewer] PDF pronto para visualização');
      
    } catch (err) {
      console.error('❌ [SimplePDFViewer] Erro ao carregar PDF:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar PDF';
      
      console.log('🔍 [SimplePDFViewer] Analisando erro:', errorMessage);
      
      // Detectar erro 404 (documento sem arquivo físico)
      if (errorMessage === 'DOCUMENTO_SEM_ARQUIVO' || 
          errorMessage.includes('404') || 
          errorMessage.includes('Not Found') ||
          errorMessage.includes('Arquivo físico não encontrado') ||
          errorMessage.includes('Documento não encontrado')) {
        console.log('✅ [SimplePDFViewer] Configurando interface para documento sem arquivo');
        setError('DOCUMENTO_SEM_ARQUIVO');
      } else {
        setError(errorMessage);
      }
      
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  // RECARREGAR PDF AUTOMATICAMENTE QUANDO URL OU REFRESH KEY MUDAR
  useEffect(() => {
    loadPDF();
    
    // Cleanup: remover URL do blob
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [documentUrl, refreshKey]);

  // FUNCTION PARA FORÇAR REFRESH MANUAL
  const forceRefresh = () => {
    console.log('🔄 [SimplePDFViewer] Forçando refresh do PDF...');
    setRefreshKey(Date.now());
  };

  const handleRetry = () => {
    console.log('🔄 [Retry] Tentando carregar PDF novamente');
    setPdfBlobUrl('');
    loadPDF();
  };

  if (error) {
    // Tratar erro específico de documento sem arquivo
    if (error === 'DOCUMENTO_SEM_ARQUIVO') {
      return (
        <div className="w-full h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-blue-200">
          <div className="text-center space-y-4 p-8 max-w-lg">
            <div className="text-blue-600 text-6xl mb-4">📄</div>
            <div className="text-blue-800 text-xl font-semibold">Documento apenas com metadados</div>
            <p className="text-blue-700 text-sm leading-relaxed">
              Este documento contém apenas informações de cadastro (título, descrição, tags) mas não possui arquivo físico anexado.
              <br/><br/>
              <strong>Identificação Digital:</strong> Gerado automaticamente<br/>
              <strong>Hash de Verificação:</strong> Gerado automaticamente
            </p>
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-xs text-blue-800">
              💡 Para anexar um arquivo a este documento, use o botão "Anexar" na página de detalhes
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-50 rounded-lg border">
        <div className="text-center space-y-4 p-6 max-w-md">
          <div className="text-red-500 text-lg">⚠️ Erro ao carregar PDF</div>
          <p className="text-sm text-gray-600">{error}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-50 rounded-lg border">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600">Carregando PDF...</p>
          <p className="text-sm text-gray-500">{fileName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg overflow-hidden border">
      {/* Visualizador PDF com altura otimizada para folha completa */}
      <div className="w-full relative h-[600px]">
        {pdfBlobUrl ? (
          <>
            <iframe
              src={pdfBlobUrl}
              className="w-full h-full border-0"
              title={fileName}
              style={{ 
                minHeight: '600px',
                height: '600px',
                width: '100%'
              }}
              onLoad={() => console.log('✅ [Iframe] PDF carregado no iframe')}
              onError={(e) => {
                console.error('❌ [Iframe] Erro ao carregar PDF no iframe:', e);
              }}
            >
              {/* Fallback: object tag */}
              <object
                data={pdfBlobUrl}
                type="application/pdf"
                className="w-full h-full"
                style={{ 
                  minHeight: '600px',
                  height: '600px',
                  width: '100%'
                }}
              >
                {/* Fallback: embed tag */}
                <embed
                  src={pdfBlobUrl}
                  type="application/pdf"
                  className="w-full h-full"
                  style={{ 
                    minHeight: '600px',
                    height: '600px',
                    width: '100%'
                  }}
                />
                
                {/* Fallback final: mensagem simples */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <div className="text-center space-y-4 p-6 max-w-md">
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">PDF não suportado</h3>
                    <p className="text-sm text-gray-600">
                      Este navegador não consegue exibir PDFs diretamente. 
                      Use os botões da barra lateral para baixar ou abrir em nova aba.
                    </p>
                  </div>
                </div>
              </object>
            </iframe>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-gray-500">Preparando visualização...</div>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};