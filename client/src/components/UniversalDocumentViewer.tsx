import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Loader2, AlertCircle, FileText, Table, Presentation } from 'lucide-react';

interface UniversalDocumentViewerProps {
  documentId: number;
  fileName: string;
  fileType: string;
  onDownload?: () => void;
}

export default function UniversalDocumentViewer({ 
  documentId, 
  fileName, 
  fileType,
  onDownload 
}: UniversalDocumentViewerProps) {
  const [documentData, setDocumentData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detectar tipo de arquivo
  const getFileType = (filename: string, type: string) => {
    const ext = filename.toLowerCase().split('.').pop() || type.toLowerCase();
    
    if (ext.includes('pdf') || type.includes('pdf')) return 'pdf';
    if (ext.includes('doc') || type.includes('word') || ext === 'docx') return 'word';
    if (ext.includes('xls') || type.includes('excel') || ext === 'xlsx') return 'excel';
    if (ext.includes('ppt') || type.includes('powerpoint') || ext === 'pptx') return 'powerpoint';
    
    return 'unknown';
  };

  const detectedType = getFileType(fileName, fileType);

  useEffect(() => {
    const fetchDocumentData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`🔥 Carregando ${detectedType.toUpperCase()}: ${fileName}`);
        
        // PRIMEIRO: Usar rota API que já funciona para documentos reais
        let response = await fetch(`/api/pdf-data/${documentId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        let data = await response.json();
        
        console.log(`📄 Dados do ${detectedType} recebidos:`, {
          mimeType: data.mimeType,
          fileName: data.fileName,
          size: data.size,
          base64Length: data.base64?.length || 0,
          corrected: data.corrected || false
        });
        
        if (data.corrected) {
          console.log('✅ Sistema corrigiu automaticamente dados corrompidos');
          setError('Sistema detectou e corrigiu dados corrompidos automaticamente');
        }
        
        if (data.base64) {
          // Criar blob com tipo MIME apropriado
          const mimeType = data.mimeType || getMimeType(detectedType);
          
          // Verificar se o base64 começa com assinatura PDF válida
          const pdfHeader = data.base64.substring(0, 12); // "JVBERi0x" = "%PDF-1."
          console.log('🔍 PREVIEW - Header base64:', pdfHeader);
          console.log('🔍 PREVIEW - MIME type:', mimeType);
          
          const docBlob = new Blob(
            [Uint8Array.from(atob(data.base64), c => c.charCodeAt(0))],
            { type: mimeType }
          );
          
          const docUrl = URL.createObjectURL(docBlob);
          console.log('✅ PREVIEW - Blob URL criada:', docUrl);
          console.log('✅ PREVIEW - Tamanho do blob:', docBlob.size, 'bytes');
          
          setDocumentData(docUrl);
        } else {
          throw new Error('Dados do documento não disponíveis');
        }
        
      } catch (err) {
        console.error(`Erro ao carregar ${detectedType}:`, err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentData();
  }, [documentId, detectedType]);

  // Cleanup para evitar memory leaks (como recomendado no documento de referência)
  useEffect(() => {
    return () => {
      if (documentData) {
        URL.revokeObjectURL(documentData);
        console.log('🧹 Cleanup: URL.revokeObjectURL() executado');
      }
    };
  }, [documentData]);

  const getMimeType = (type: string) => {
    switch (type) {
      case 'pdf': return 'application/pdf';
      case 'word': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'excel': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'powerpoint': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      default: return 'application/octet-stream';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-8 w-8 text-red-600" />;
      case 'word': return <FileText className="h-8 w-8 text-blue-600" />;
      case 'excel': return <Table className="h-8 w-8 text-green-600" />;
      case 'powerpoint': return <Presentation className="h-8 w-8 text-orange-600" />;
      default: return <FileText className="h-8 w-8 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'bg-red-50 border-red-200';
      case 'word': return 'bg-blue-50 border-blue-200';
      case 'excel': return 'bg-green-50 border-green-200';
      case 'powerpoint': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const handleExternalView = () => {
    if (documentData) {
      window.open(documentData, '_blank');
    }
  };

  const handleDownload = () => {
    if (documentData) {
      const link = window.document.createElement('a');
      link.href = documentData;
      link.download = fileName;
      link.click();
    }
    if (onDownload) {
      onDownload();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[580px] bg-gray-50 rounded">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Carregando {detectedType.toUpperCase()}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-[580px] rounded border ${getTypeColor(detectedType)}`}>
        <div className="text-center p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar documento</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()} variant="outline" size="sm">
              Recarregar
            </Button>
            <Button onClick={handleDownload} variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Renderização UNIVERSAL com recursos nativos do navegador
  if (documentData) {
    return (
      <div className="relative h-[580px] bg-gray-50 rounded overflow-hidden">
        {/* Indicador de sucesso */}
        <div className="absolute top-2 right-2 z-10 bg-green-100 border border-green-300 text-green-800 px-2 py-1 rounded text-xs">
          ✅ Preview funcionando: {fileName}
        </div>
        
        {/* Teste visual adicional */}
        <div className="absolute top-2 left-2 z-10 bg-blue-100 border border-blue-300 text-blue-800 px-2 py-1 rounded text-xs">
          PDF {detectedType.toUpperCase()} • Blob URL ativa
        </div>
        
        {/* VIEWER UNIVERSAL - usa object para PDF e iframe para outros */}
        {detectedType === 'pdf' ? (
          <object
            data={documentData}
            type="application/pdf"
            className="w-full h-full"
            style={{ backgroundColor: 'white' }}
          >
            {/* Fallback para caso o object não funcione */}
            <iframe
              src={documentData}
              className="w-full h-full border-0"
              title={`PDF - ${fileName}`}
              style={{ backgroundColor: 'white' }}
              onLoad={(e) => {
                console.log('✅ IFRAME FALLBACK CARREGADO:', fileName);
                const iframe = e.target as HTMLIFrameElement;
                console.log('📋 Iframe src:', iframe.src);
              }}
            />
          </object>
        ) : (
          <iframe
            src={documentData}
            className="w-full h-full border-0"
            title={`Visualizador - ${fileName}`}
            style={{ backgroundColor: 'white' }}
            onLoad={(e) => {
              console.log('✅ IFRAME CARREGADO:', fileName);
              console.log('✅ URL:', documentData);
            }}
          />
        )}
        
        {/* CONTROLES ADICIONAIS: Sempre visíveis para garantir acesso */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-600 mb-2 text-center">
            Preview não funcionando? Use:
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={handleExternalView}
              size="sm"
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Nova Aba
            </Button>
            <Button 
              onClick={handleDownload}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Baixar
            </Button>
          </div>
        </div>
        
        {/* Controles flutuantes */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button
            onClick={handleExternalView}
            size="sm"
            variant="secondary"
            className="bg-white bg-opacity-95 hover:bg-opacity-100 shadow-lg"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Abrir Foto
          </Button>
          <Button
            onClick={handleDownload}
            size="sm"
            variant="secondary"
            className="bg-white bg-opacity-95 hover:bg-opacity-100 shadow-lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar
          </Button>
        </div>

        {/* Indicador do tipo de arquivo */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getTypeColor(detectedType)} border shadow-lg`}>
            {getIcon(detectedType)}
            <span className="text-sm font-medium text-gray-700">
              {detectedType.toUpperCase()} - {fileName}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback se não conseguir carregar
  return (
    <div className={`h-[580px] rounded border-2 ${getTypeColor(detectedType)} flex flex-col`}>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mb-6">
            {getIcon(detectedType)}
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            Documento {detectedType.toUpperCase()} 
          </h3>
          <p className="text-gray-600 mb-6">
            {fileName}
          </p>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleExternalView}
              className="w-full"
              size="lg"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Visualizar em Nova Aba
            </Button>
            
            <Button 
              onClick={handleDownload}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Baixar Documento
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Use os recursos nativos do navegador para visualizar este documento
          </p>
        </div>
      </div>
    </div>
  );
}