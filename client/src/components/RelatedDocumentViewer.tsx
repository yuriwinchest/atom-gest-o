import React, { useState, useEffect } from 'react';
import UniversalDocumentViewerV2 from './UniversalDocumentViewerV2';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, FileText } from 'lucide-react';

interface RelatedDocumentViewerProps {
  documentId: number;
}

// Helper function to extract file type from document
function getFileTypeFromDocument(document: any): string {
  if (!document) return 'unknown';
  
  try {
    const content = typeof document.content === 'string' ? JSON.parse(document.content) : document.content;
    
    // Try to get from fileInfo first
    if (content?.fileInfo?.mimeType) {
      return content.fileInfo.mimeType;
    }
    
    // Try to get from fileName extension
    if (content?.fileInfo?.originalName) {
      const fileName = content.fileInfo.originalName.toLowerCase();
      if (fileName.includes('.pdf')) return 'application/pdf';
      if (fileName.includes('.xlsx') || fileName.includes('.xls') || fileName.includes('.csv')) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (fileName.includes('.docx') || fileName.includes('.doc')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

export function RelatedDocumentViewer({ documentId }: RelatedDocumentViewerProps) {
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocument() {
      try {
        setLoading(true);
        const response = await fetch(`/api/documents/${documentId}`);
        if (!response.ok) {
          throw new Error('Documento não encontrado');
        }
        const doc = await response.json();
        setDocument(doc);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar documento');
      } finally {
        setLoading(false);
      }
    }

    fetchDocument();
  }, [documentId]);

  const handleDownload = () => {
    window.open(`/api/documents/${documentId}/download`, '_blank');
  };

  const handleOpenNewTab = () => {
    window.open(`/document/${documentId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Carregando preview...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Header sem botões duplicados - design nativo iOS/Android */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600 rounded-t-lg">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
          <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 truncate">
            {document.title}
          </span>
        </div>
      </div>

      {/* Área de preview - responsiva para mobile nativo */}
      <div className="relative rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700" style={{ height: '400px' }}>
        {document && (
          <UniversalDocumentViewerV2 
            documentId={documentId}
            fileName={document.title}
            fileType={getFileTypeFromDocument(document)}
            onDownload={handleDownload}
          />
        )}
      </div>
    </div>
  );
}

export default RelatedDocumentViewer;