/**
 * DocumentGrid - Componente seguindo SRP
 * Responsabilidade única: Renderizar lista de documentos em grid/lista
 */

import React from 'react';
import { DocumentCard } from './DocumentCard';
import { Folder } from 'lucide-react';
import type { Document } from '@shared/schema';

export interface DocumentGridProps {
  documents: Document[];
  viewMode: 'grid' | 'list';
  isLoading?: boolean;
  searchQuery?: string;
  onView?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onAttach?: (document: Document) => void;
  isAuthenticated?: boolean;
}

export const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents,
  viewMode,
  isLoading = false,
  searchQuery = '',
  onView,
  onDownload,
  onEdit,
  onDelete,
  onAttach,
  isAuthenticated = false
}) => {

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">Carregando arquivos...</div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? 'Nenhum arquivo encontrado' : 'Nenhum arquivo disponível'}
          </p>
          {searchQuery && (
            <p className="text-sm text-gray-400 mt-2">
              Tente pesquisar com termos diferentes
            </p>
          )}
        </div>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {documents.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            viewMode="grid"
            onView={onView}
            onDownload={onDownload}
            onEdit={onEdit}
            onDelete={onDelete}
            onAttach={onAttach}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          viewMode="list"
          onView={onView}
          onDownload={onDownload}
          onEdit={onEdit}
          onDelete={onDelete}
          onAttach={onAttach}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
};