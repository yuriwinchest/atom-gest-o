/**
 * ARQUIVO REFATORADO - Agora usa ContentManagementContainer
 * Página gerenciar-conteudo.tsx (920→12 linhas) 
 * Refatoração SOLID concluída - apenas wrapper para container
 */

import React from 'react';
import { ContentManagementContainer } from '@/components/content-management/ContentManagementContainer';

export default function GerenciarConteudo() {
  return <ContentManagementContainer />;
}