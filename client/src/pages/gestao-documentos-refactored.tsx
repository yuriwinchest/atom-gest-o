/**
 * Gestão de Documentos - Página Refatorada (SOLID)
 * Responsabilidade única: Orquestrar componentes da gestão de documentos
 * ANTES: 1494 linhas | DEPOIS: <200 linhas
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DocumentManagementHeader } from '@/components/document-management/DocumentManagementHeader';
import { DocumentManagementContainer } from '@/components/document-management/DocumentManagementContainer';
import { HelpModal } from '@/components/document-management/HelpModal';
import { useOptimizedUser } from '@/hooks/useOptimizedUser';

const GestaoDocumentosRefactored: React.FC = () => {
  const { user, isAuthenticated } = useOptimizedUser();
  
  // Estados da UI
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isDocumentFormOpen, setIsDocumentFormOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Dados de contagem de categorias
  const { data: categoryCounts = {} } = useQuery({
    queryKey: ['/api/documents/category-counts'],
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <DocumentManagementHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categoryCounts={categoryCounts}
        onUploadClick={() => setIsDocumentFormOpen(true)}
        onHelpClick={() => setIsHelpModalOpen(true)}
        isAuthenticated={isAuthenticated}
      />

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-hidden">
        <DocumentManagementContainer />
      </div>

      {/* Modals */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};

export default GestaoDocumentosRefactored;