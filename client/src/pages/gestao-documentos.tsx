/**
 * Página de Gestão de Documentos - Seguindo SOLID
 * Refatorada de 1494 linhas para wrapper de 12 linhas
 * Responsabilidade delegada ao DocumentManagementContainer
 */

import React from 'react';
import { AuthProtection } from '@/components/AuthProtection';
import { DocumentManagementContainer } from '@/components/document-management/DocumentManagementContainer';

export default function GestaoDocumentos() {
  return (
    <AuthProtection>
      <DocumentManagementContainer />
    </AuthProtection>
  );
}