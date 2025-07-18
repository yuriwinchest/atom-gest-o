// Custom Hook - Gerenciamento de estado para documentos
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DocumentService, Document } from '@/services/DocumentService';

interface UseDocumentProps {
  documentId: number;
}

interface UseDocumentReturn {
  document: Document | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  fileInfo: {
    fileName: string;
    fileType: string;
    fileSize: number;
    supabaseUrl: string;
  } | null;
}

export function useDocument({ documentId }: UseDocumentProps): UseDocumentReturn {
  const documentService = DocumentService.getInstance();

  const {
    data: document,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [`/api/documents/${documentId}`],
    queryFn: () => documentService.fetchDocument(documentId),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    retry: 2
  });

  const fileInfo = document ? documentService.getFileInfo(document) : null;

  return {
    document: document || null,
    isLoading,
    error: error as Error | null,
    refetch,
    fileInfo
  };
}