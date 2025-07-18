// Custom Hook - Gerenciamento de estado para metadados
import { useState, useMemo } from 'react';
import { MetadataService, MetadataSection } from '@/services/MetadataService';
import { DocumentService, DocumentMetadata } from '@/services/DocumentService';

interface UseMetadataProps {
  documentContent: string;
}

interface UseMetadataReturn {
  metadata: DocumentMetadata | null;
  sections: MetadataSection[];
  isExpanded: boolean;
  toggleExpanded: () => void;
  hasMetadata: boolean;
}

export function useMetadata({ documentContent }: UseMetadataProps): UseMetadataReturn {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const documentService = DocumentService.getInstance();
  const metadataService = MetadataService.getInstance();

  const metadata = useMemo(() => {
    return documentService.parseMetadata(documentContent);
  }, [documentContent, documentService]);

  const sections = useMemo(() => {
    if (!metadata) return [];
    return metadataService.organizeSections(metadata);
  }, [metadata, metadataService]);

  const toggleExpanded = () => {
    console.log(`🎯 [useMetadata] ${isExpanded ? 'Fechando' : 'Abrindo'} metadados`);
    setIsExpanded(!isExpanded);
  };

  return {
    metadata,
    sections,
    isExpanded,
    toggleExpanded,
    hasMetadata: !!metadata
  };
}