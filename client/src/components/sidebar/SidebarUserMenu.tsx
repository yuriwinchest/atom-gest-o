/**
 * SidebarUserMenu - Seguindo SRP
 * Responsabilidade única: Menu e informações do usuário na sidebar
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import {
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
  Shield,
  UserCog,
  BarChart3,
  Database,
  Monitor,
  FolderOpen
} from 'lucide-react';

export const SidebarUserMenu: React.FC = () => {
  const [location, navigate] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Query para dados do usuário
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
    staleTime: 5 * 60 * 1000,
  });

  const isAuthenticated = user?.success && user?.user;
  const isAdmin = user?.user?.role === 'admin';

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Usuário Público</p>
            <p className="text-xs text-gray-500">Acesso limitado</p>
          </div>
        </div>
      </div>
    );
  }

  const userMenuItems = [
    {
      href: '/meu-perfil',
      label: 'Meu Perfil',
      icon: User,
      description: 'Visualizar perfil pessoal'
    },

  ];

  const adminMenuItems = isAdmin ? [
    {
      href: '/admin',
      label: 'Painel Admin',
      icon: Shield,
      description: 'Painel administrativo'
    },
    {
      href: '/gerenciar-usuarios',
      label: 'Gerenciar Usuários',
      icon: UserCog,
      description: 'Administrar usuários'
    },
    {
      href: '/storage-monitor',
      label: 'Monitor Sistema',
      icon: Monitor,
      description: 'Monitorar sistema'
    },
    {
      href: '/gestao-documentos',
      label: 'Gestão de Documentos',
      icon: FolderOpen,
      description: 'Gerenciar documentos do sistema'
    }
  ] : [];

  const allMenuItems = [...userMenuItems, ...adminMenuItems];

  return (
    <div className="border-t border-gray-200">
      {/* Header do usuário */}
      <div className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-blue-900">
              {user?.user?.name || user?.user?.email || 'Usuário'}
            </p>
            <p className="text-xs text-blue-600">
              {isAdmin ? 'Administrador' : 'Usuário'}
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-blue-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-blue-600" />
          )}
        </button>
      </div>

      {/* Menu expandido */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-1">
          {allMenuItems.map((item) => {
            const isActive = location.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  title={item.description}
                >
                  <Icon className={cn(
                    "h-4 w-4",
                    isActive ? "text-blue-700" : "text-gray-500"
                  )} />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}

          {/* Botão de logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
        </div>
      )}

      {/* Informações do sistema */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">
            Sistema AtoM
          </h4>
          <div className="space-y-1 text-xs text-gray-600">
            <p>IMPL - ALMT</p>
            <p>Versão 2.0</p>
            <p className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              PostgreSQL + Supabase
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};