/**
 * ARQUIVO REFATORADO - Agora usa SidebarContainer
 * sidebar.tsx (771→12 linhas) 
 * Refatoração SOLID concluída - apenas wrapper para container
 */

import React from 'react';
import { SidebarContainer } from '@/components/sidebar/SidebarContainer';

export default function Sidebar(props: any) {
  return <SidebarContainer {...props} />;
}