/**
 * SidebarNavigation - Seguindo SRP
 * Responsabilidade única: Navegação principal da sidebar
 */

import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  Home, 
  FileText, 
  Settings, 
  Users, 
  BarChart3, 
  Shield,
  FolderOpen,
  Database,
  Archive,
  Layers
} from 'lucide-react';

export interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  description?: string;
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  {
    href: '/',
    label: 'Início',
    icon: Home,
    description: 'Página inicial do sistema'
  },
  {
    href: '/gestao-documentos',
    label: 'Gestão de Documentos',
    icon: FileText,
    description: 'Gerenciar documentos'
  },
  {
    href: '/documentos-publicos',
    label: 'Documentos Públicos',
    icon: FolderOpen,
    description: 'Acesso público aos documentos'
  },
  {
    href: '/gestao-arquivos',
    label: 'Gestão de Arquivos',
    icon: Archive,
    description: 'Gerenciar arquivos do sistema'
  },
  {
    href: '/storage-monitor',
    label: 'Monitor de Armazenamento',
    icon: Database,
    description: 'Monitorar uso de armazenamento'
  },
  {
    href: '/admin',
    label: 'Painel Admin',
    icon: Shield,
    description: 'Área administrativa'
  },
  {
    href: '/gerenciar-usuarios',
    label: 'Gerenciar Usuários',
    icon: Users,
    description: 'Administrar usuários'
  },
  {
    href: '/gerenciamento-conteudo',
    label: 'Gerenciar Conteúdo',
    icon: Layers,
    description: 'Gerenciar conteúdo do site'
  },
  {
    href: '/validacao-formulario',
    label: 'Validação',
    icon: BarChart3,
    description: 'Validar formulários'
  },
  {
    href: '/profile-management',
    label: 'Configurações',
    icon: Settings,
    description: 'Configurações do perfil'
  }
];

export const SidebarNavigation: React.FC = () => {
  const [location] = useLocation();

  const isActivePath = (href: string) => {
    if (href === '/') {
      return location === '/';
    }
    return location.startsWith(href);
  };

  return (
    <nav className="p-4 space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Navegação
      </h3>
      
      {navigationItems.map((item) => {
        const isActive = isActivePath(item.href);
        const Icon = item.icon;
        
        return (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                isActive
                  ? "bg-blue-100 text-blue-900 border border-blue-200"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
              title={item.description}
            >
              <Icon className={cn(
                "h-4 w-4 flex-shrink-0",
                isActive ? "text-blue-700" : "text-gray-500"
              )} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.description && !isActive && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
            </a>
          </Link>
        );
      })}
    </nav>
  );
};