// Custom Hook - Responsável APENAS pelo estado e lifecycle
import { useState, useEffect, useRef } from 'react';
import { DocumentViewerService, DocumentConfig } from '@/services/DocumentViewerService';

interface UseDocumentViewerProps {
  documentId: number;
  fileName: string;
  mimeType?: string;
}

interface UseDocumentViewerReturn {
  isLoading: boolean;
  hasError: boolean;
  documentConfig: DocumentConfig | null;
  error: string | null;
  retry: () => void;
}

export function useDocumentViewer({ 
  documentId, 
  fileName, 
  mimeType 
}: UseDocumentViewerProps): UseDocumentViewerReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentConfig, setDocumentConfig] = useState<DocumentConfig | null>(null);
  
  const service = DocumentViewerService.getInstance();
  const isInitialized = useRef(false);

  const loadDocument = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      setError(null);

      // Verifica cache primeiro
      const cached = service.getCachedDocument(documentId);
      if (cached) {
        setDocumentConfig(cached);
        setIsLoading(false);
        return;
      }

      // Cria nova configuração
      const config = service.createDocumentConfig(documentId, fileName, mimeType);
      
      // Salva no cache
      service.cacheDocument(documentId, config);
      
      setDocumentConfig(config);
      setIsLoading(false);
      isInitialized.current = true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setHasError(true);
      setIsLoading(false);
    }
  };

  const retry = () => {
    isInitialized.current = false;
    loadDocument();
  };

  useEffect(() => {
    if (!isInitialized.current) {
      loadDocument();
    }
  }, [documentId]); // Apenas documentId como dependência

  return {
    isLoading,
    hasError,
    documentConfig,
    error,
    retry
  };
}