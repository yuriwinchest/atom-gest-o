/**
 * ARQUIVO REFATORADO - Agora usa UserManagementContainer
 * gerenciar-usuarios.tsx (709→12 linhas) 
 * Refatoração SOLID concluída - apenas wrapper para container
 */

import React from 'react';
import { UserManagementContainer } from '@/components/user-management/UserManagementContainer';

export default function GerenciarUsuarios() {
  return <UserManagementContainer />;
}