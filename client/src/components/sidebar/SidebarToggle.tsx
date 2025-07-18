/**
 * SidebarToggle - Seguindo SRP
 * Responsabilidade única: Botão de toggle da sidebar
 */

import React from 'react';
import { X, Menu } from 'lucide-react';

export interface SidebarToggleProps {
  onToggle: () => void;
  isOpen?: boolean;
  className?: string;
}

export const SidebarToggle: React.FC<SidebarToggleProps> = ({
  onToggle,
  isOpen = true,
  className = ""
}) => {
  
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors lg:hidden ${className}`}
      aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
    >
      {isOpen ? (
        <X className="h-5 w-5" />
      ) : (
        <Menu className="h-5 w-5" />
      )}
    </button>
  );
};