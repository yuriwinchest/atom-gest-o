/**
 * Página de Gestão de Documentos - Seguindo SOLID
 * Refatorada de 1494 linhas para wrapper de 12 linhas
 * Responsabilidade delegada ao DocumentManagementContainer
 */

import React from 'react';
import { DocumentManagementContainer } from '@/components/document-management/DocumentManagementContainer';

export default function GestaoDocumentos() {
  return <DocumentManagementContainer />;
}