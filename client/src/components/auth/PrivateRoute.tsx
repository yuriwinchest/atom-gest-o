/**
 * Componente de Rota Privada - Controle de Acesso
 * PrivateRoute.tsx - Proteção contra acesso não autorizado
 * Redireciona usuários não autenticados para página inicial
 */

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function PrivateRoute({ children, requireAdmin = false }: PrivateRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirecionar se não estiver autenticado
    if (!isAuthenticated) {
      console.log('🔒 Acesso negado - usuário não autenticado, redirecionando para página inicial');
      setLocation('/');
      return;
    }

    // Redirecionar se requer admin mas usuário não é admin
    if (requireAdmin && user?.role !== 'admin') {
      console.log('🔒 Acesso negado - requer permissões de administrador');
      setLocation('/');
      return;
    }
  }, [isAuthenticated, user, requireAdmin, setLocation]);

  // Não renderizar nada se não estiver autenticado
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Não renderizar nada se requer admin mas usuário não é admin
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}