/**
 * SidebarProvider - Seguindo SRP
 * Responsabilidade única: Gerenciar estado global da sidebar
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
  defaultOpen = false
}) => {
  
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Controlar sidebar com base no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true); // Sempre aberta em desktop
      } else {
        setIsOpen(false); // Fechada por padrão em mobile
      }
    };

    // Configurar estado inicial
    handleResize();

    // Escutar mudanças de tamanho
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fechar sidebar ao clicar em links (mobile)
  useEffect(() => {
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && window.innerWidth < 1024) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleLinkClick);
    
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  const toggle = () => setIsOpen(prev => !prev);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const value: SidebarContextType = {
    isOpen,
    toggle,
    open,
    close
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar deve ser usado dentro de um SidebarProvider');
  }
  return context;
};