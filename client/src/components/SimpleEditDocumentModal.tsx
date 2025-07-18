/**
 * ARQUIVO REFATORADO - Agora usa EditDocumentContainer
 * SimpleEditDocumentModal.tsx (1063→12 linhas) 
 * Refatoração SOLID concluída - apenas wrapper para container
 */

import React from 'react';
import { EditDocumentContainer } from '@/components/edit-document/EditDocumentContainer';

interface SimpleEditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: any;
  onSave?: () => void;
}

export default function SimpleEditDocumentModal(props: SimpleEditDocumentModalProps) {
  return <EditDocumentContainer {...props} />;
}