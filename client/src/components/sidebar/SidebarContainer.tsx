/**
 * SidebarContainer - Seguindo SRP
 * Responsabilidade única: Orquestrar componentes da sidebar
 * REFATORAÇÃO: sidebar.tsx (771 linhas) dividido em módulos
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { SidebarNavigation } from './SidebarNavigation';
import { SidebarUserMenu } from './SidebarUserMenu';
import { SidebarToggle } from './SidebarToggle';

export interface SidebarContainerProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const SidebarContainer: React.FC<SidebarContainerProps> = ({
  isOpen,
  onToggle,
  className,
  children
}) => {
  
  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:relative lg:shadow-none lg:z-auto",
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header da sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
            <SidebarToggle onToggle={onToggle} />
          </div>

          {/* Conteúdo da sidebar */}
          <div className="flex-1 overflow-y-auto">
            {children || (
              <>
                <SidebarNavigation />
                <SidebarUserMenu />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};