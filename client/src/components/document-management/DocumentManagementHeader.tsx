/**
 * DocumentManagementHeader - Seguindo SRP
 * Responsabilidade única: Header da página de gestão de documentos
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Search, 
  Grid3X3, 
  List, 
  HelpCircle,
  FileText,
  Image,
  Video,
  Music,
  FolderOpen
} from 'lucide-react';

export interface DocumentManagementHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categoryCounts: Record<string, number>;
  onUploadClick: () => void;
  onHelpClick: () => void;
  isAuthenticated: boolean;
}

export const DocumentManagementHeader: React.FC<DocumentManagementHeaderProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  selectedCategory,
  onCategoryChange,
  categoryCounts,
  onUploadClick,
  onHelpClick,
  isAuthenticated
}) => {

  const categories = [
    { id: 'Todos', label: 'Todos', icon: FolderOpen, count: Object.values(categoryCounts).reduce((a, b) => a + b, 0) },
    { id: 'Documentos', label: 'Documentos', icon: FileText, count: categoryCounts.Documentos || 0 },
    { id: 'Imagens', label: 'Imagens', icon: Image, count: categoryCounts.Imagens || 0 },
    { id: 'Vídeos', label: 'Vídeos', icon: Video, count: categoryCounts.Vídeos || 0 },
    { id: 'Áudio', label: 'Áudio', icon: Music, count: categoryCounts.Áudio || 0 },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 space-y-4">
      {/* Barra superior */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Gestão de Documentos
          </h1>
          <Badge variant="secondary" className="text-xs">
            {Object.values(categoryCounts).reduce((a, b) => a + b, 0)} arquivos
          </Badge>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isAuthenticated && (
            <Button 
              onClick={onUploadClick}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white w-full sm:w-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              <span className="sm:inline">Enviar Documentos</span>
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onHelpClick}
            className="flex-shrink-0"
          >
            <HelpCircle className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Ajuda</span>
          </Button>
        </div>
      </div>

      {/* Categorias */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category.id)}
              className="flex items-center gap-1.5 text-xs sm:text-sm"
            >
              <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{category.label}</span>
              <span className="sm:hidden">{category.label.substring(0, 3)}</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {category.count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Busca e controles */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Campo de busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar arquivos, descrições, tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        {/* Controles de visualização */}
        <div className="flex items-center gap-2 justify-center sm:justify-end">
          <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
            Visualizar:
          </span>
          <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-r-none border-r border-gray-200 dark:border-gray-700"
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Lista</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};