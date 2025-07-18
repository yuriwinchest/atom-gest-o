/**
 * DocumentCard - Componente seguindo SRP
 * Responsabilidade única: Exibir informações de um documento em formato card
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Image,
  BookOpen,
  FileSpreadsheet,
  Video,
  Music,
  File,
  Link2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { Document } from '@shared/schema';

export interface DocumentCardProps {
  document: Document;
  viewMode: 'grid' | 'list';
  onView?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onAttach?: (document: Document) => void;
  isAuthenticated?: boolean;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  viewMode,
  onView,
  onDownload,
  onEdit,
  onDelete,
  onAttach,
  isAuthenticated = false
}) => {
  const [expandedTags, setExpandedTags] = useState(false);
  
  const getFileIconWithColor = (doc: Document) => {
    const extension = doc.title.split('.').pop()?.toLowerCase() || '';
    const category = doc.category?.toLowerCase() || '';
    
    if (['pdf'].includes(extension) || category.includes('pdf')) {
      return {
        icon: FileText,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        type: 'PDF',
        accent: 'from-red-500 to-red-600'
      };
    }
    
    if (['doc', 'docx'].includes(extension) || category.includes('word')) {
      return {
        icon: BookOpen,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        type: 'Word',
        accent: 'from-blue-500 to-blue-600'
      };
    }
    
    if (['xls', 'xlsx'].includes(extension) || category.includes('excel')) {
      return {
        icon: FileSpreadsheet,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        type: 'Excel',
        accent: 'from-green-500 to-green-600'
      };
    }
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension) || category.includes('imagem')) {
      return {
        icon: Image,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        type: 'Imagem',
        accent: 'from-purple-500 to-purple-600'
      };
    }
    
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension) || category.includes('video')) {
      return {
        icon: Video,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        type: 'Vídeo',
        accent: 'from-orange-500 to-orange-600'
      };
    }
    
    if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(extension) || category.includes('audio')) {
      return {
        icon: Music,
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
        borderColor: 'border-pink-200',
        type: 'Áudio',
        accent: 'from-pink-500 to-pink-600'
      };
    }
    
    return {
      icon: File,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      type: 'Arquivo',
      accent: 'from-gray-500 to-gray-600'
    };
  };

  const { icon: Icon, color, bgColor, borderColor, type, accent } = getFileIconWithColor(document);

  // Extrair metadados do JSON
  const metadata = document.content ? JSON.parse(document.content) : {};
  const description = metadata.description || document.description || '';
  const subject = metadata.mainSubject || '';
  const tags = metadata.tags || document.tags || [];

  if (viewMode === 'grid') {
    return (
      <div className={cn(
        "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group",
        borderColor
      )}>
        {/* Header do card */}
        <div className={cn("p-3 sm:p-4 rounded-t-2xl", bgColor)}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className={cn(
                "p-2 rounded-xl shadow-sm flex-shrink-0",
                `bg-gradient-to-r ${accent} text-white`
              )}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                  {document.title}
                </h3>
                <Badge className={cn("text-xs mt-1", color)}>
                  {type}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo do card */}
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          {description && (
            <div className="bg-blue-50 border-l-3 border-blue-400 p-2 sm:p-3 rounded-r-lg">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="font-bold text-blue-800 text-xs uppercase tracking-wide">DESCRIÇÃO</span>
              </div>
              <p className="text-gray-700 text-xs sm:text-sm leading-relaxed break-words">
                {description}
              </p>
            </div>
          )}

          {subject && (
            <div className="bg-green-50 border-l-3 border-green-400 p-2 sm:p-3 rounded-r-lg">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="font-bold text-green-800 text-xs uppercase tracking-wide">ASSUNTO</span>
              </div>
              <p className="text-gray-700 text-xs sm:text-sm leading-relaxed break-words">
                {subject}
              </p>
            </div>
          )}

          {tags.length > 0 && (
            <div className="bg-purple-50 border-l-3 border-purple-400 p-2 sm:p-3 rounded-r-lg">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></div>
                <span className="font-bold text-purple-800 text-xs uppercase tracking-wide">TAGS</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {(expandedTags ? tags : tags.slice(0, 3)).map((tag: string, index: number) => (
                  <Badge key={index} className="bg-purple-100 text-purple-800 border-purple-200 text-xs px-1.5 py-0.5">
                    {tag}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <Button
                    onClick={() => setExpandedTags(!expandedTags)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 h-auto font-medium rounded-full border border-gray-200"
                    variant="ghost"
                    size="sm"
                  >
                    {expandedTags ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-0.5" />
                        Ver menos
                      </>
                    ) : (
                      <>
                        +{tags.length - 3}
                        <ChevronDown className="h-3 w-3 ml-0.5" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer com ações */}
        <div className="p-3 sm:p-4 pt-0">
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => onView?.(document)}
              className="text-xs sm:text-sm h-8 sm:h-9 w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 flex-shrink-0" />
              <span className="truncate">Detalhes</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDownload?.(document)}
              className="text-xs sm:text-sm h-8 sm:h-9 w-full text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 flex-shrink-0" />
              <span className="truncate">Baixar</span>
            </Button>
            
            {isAuthenticated && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAttach?.(document)}
                  className="text-xs sm:text-sm h-8 sm:h-9 w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-300"
                >
                  <Link2 className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 flex-shrink-0" />
                  <span className="truncate">Anexar</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete?.(document)}
                  className="text-xs sm:text-sm h-8 sm:h-9 w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 flex-shrink-0" />
                  <span className="truncate">Excluir</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Visualização em lista
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className={cn(
            "p-2 rounded-lg flex-shrink-0",
            `bg-gradient-to-r ${accent} text-white`
          )}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
              {document.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={cn("text-xs", color)}>
                {type}
              </Badge>
              {description && (
                <span className="text-xs text-gray-500 truncate max-w-xs">
                  {description}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onView?.(document)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDownload?.(document)}
            className="h-8 w-8 p-0"
          >
            <Download className="h-4 w-4" />
          </Button>
          
          {isAuthenticated && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit?.(document)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onAttach?.(document)}
                className="h-8 w-8 p-0"
              >
                <Link2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};