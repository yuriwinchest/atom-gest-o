// Main Component - Responsável APENAS pela orquestração
import { DocumentViewerService } from '@/services/DocumentViewerService';
import { useDocumentViewer } from '@/hooks/useDocumentViewer';
import { DocumentViewerContainer } from './DocumentViewerContainer';
import { DocumentViewerRenderer } from './DocumentViewerRenderer';
import { LoadingState, ErrorState } from './DocumentViewerStates';

interface DocumentViewerProps {
  documentId: number;
  fileName: string;
  mimeType?: string;
  onDownload: () => void;
}

export function DocumentViewer({ 
  documentId, 
  fileName, 
  mimeType, 
  onDownload 
}: DocumentViewerProps) {
  const service = DocumentViewerService.getInstance();
  const { 
    isLoading, 
    hasError, 
    documentConfig, 
    error, 
    retry 
  } = useDocumentViewer({ documentId, fileName, mimeType });

  console.log('🎯 [DocumentViewer] Estado:', { isLoading, hasError, documentId });

  const handleError = (viewerError: any) => {
    console.error('🎯 [DocumentViewer] Erro no viewer:', viewerError);
  };

  return (
    <DocumentViewerContainer subtitle={undefined}>
      {isLoading && (
        <LoadingState fileName={fileName} />
      )}

      {hasError && (
        <ErrorState 
          error={error || 'Erro desconhecido'}
          fileName={fileName}
          onRetry={retry}
          onDownload={onDownload}
        />
      )}

      {!isLoading && !hasError && documentConfig && (
        <DocumentViewerRenderer
          documentConfig={documentConfig}
          viewerConfig={service.getDefaultViewerConfig()}
          theme={service.getViewerTheme()}
          onError={handleError}
        />
      )}
    </DocumentViewerContainer>
  );
}

export default DocumentViewer;