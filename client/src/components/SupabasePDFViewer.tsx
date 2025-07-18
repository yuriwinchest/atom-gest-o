import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Document } from '@shared/schema';

interface SupabasePDFViewerProps {
  documentId: number;
  fileName: string;
  onDownload?: () => void;
}

export default function SupabasePDFViewer({ documentId, fileName, onDownload }: SupabasePDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Obter dados do documento
  const { data: document, isLoading, error } = useQuery<Document>({
    queryKey: [`/api/documents/${documentId}`],
    enabled: !!documentId,
  });

  useEffect(() => {
    if (!document || !document.content) return;

    const loadPdfFromSupabase = async () => {
      try {
        console.log('📄 Carregando PDF do Supabase...');
        
        // Parse do JSON do documento
        let documentDetails;
        try {
          if (typeof document.content === 'string' && document.content.startsWith('{')) {
            documentDetails = JSON.parse(document.content);
          } else {
            console.error('Conteúdo do documento não é um JSON válido:', document.content);
            return;
          }
        } catch (parseError) {
          console.error('Erro ao parsear JSON do documento:', parseError);
          return;
        }

        const supabaseUrl = documentDetails?.supabaseUrl;
        const fileInfo = documentDetails?.fileInfo;
        
        console.log('🔗 Supabase URL:', supabaseUrl);
        console.log('📋 File Info:', fileInfo);
        
        if (!supabaseUrl) {
          console.error('URL do Supabase não encontrada');
          return;
        }

        // Criar uma URL pública diretamente para o Supabase
        const publicUrl = `https://nqcmgcfwbklvllbrpswy.supabase.co/storage/v1/object/public/documents/${supabaseUrl}`;
        
        console.log('🌐 URL pública do Supabase:', publicUrl);
        
        // Testar se a URL funciona
        const response = await fetch(publicUrl);
        if (response.ok) {
          console.log('✅ URL pública funciona!');
          setPdfUrl(publicUrl);
        } else {
          console.error('❌ URL pública não funciona:', response.status);
          
          // Fallback: tentar baixar via API do Supabase
          try {
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            setPdfUrl(objectUrl);
            console.log('✅ Usando blob URL como fallback');
          } catch (blobError) {
            console.error('❌ Erro ao criar blob URL:', blobError);
          }
        }
        
      } catch (error) {
        console.error('Erro ao carregar PDF do Supabase:', error);
      }
    };

    loadPdfFromSupabase();
  }, [document]);

  const handleDownload = () => {
    if (pdfUrl) {
      const link = window.document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      link.click();
    }
    if (onDownload) {
      onDownload();
    }
  };

  const handleExternalView = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[580px] bg-gray-50 rounded">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Carregando documento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[580px] bg-red-50 rounded border border-red-200">
        <div className="text-center p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar PDF</h3>
          <p className="text-red-600 mb-4">{error.message}</p>
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

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-[580px] bg-yellow-50 rounded border border-yellow-200">
        <div className="text-center p-6">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Processando PDF...</h3>
          <p className="text-yellow-600 mb-4">Aguarde enquanto o documento é carregado do Supabase</p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[580px] bg-gray-50 rounded overflow-hidden">
      <iframe
        src={pdfUrl}
        className="w-full h-full border-0"
        title={`PDF Viewer - ${fileName}`}
        onLoad={() => console.log('✅ PDF carregado com sucesso!')}
        onError={() => console.error('❌ Erro ao carregar PDF no iframe')}
      />
      
      {/* Controles flutuantes */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          onClick={handleExternalView}
          size="sm"
          variant="secondary"
          className="bg-white bg-opacity-90 hover:bg-opacity-100 shadow-md"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Abrir
        </Button>
        <Button
          onClick={handleDownload}
          size="sm"
          variant="secondary"
          className="bg-white bg-opacity-90 hover:bg-opacity-100 shadow-md"
        >
          <Download className="h-4 w-4 mr-2" />
          Baixar
        </Button>
      </div>
    </div>
  );
}