/**
 * DocumentManagementContainer - Seguindo SRP
 * Responsabilidade única: Orquestrar a página de gestão de documentos
 */

import React, { useState } from 'react';
import { DocumentGrid } from './DocumentGrid';
import DocumentFormInline from '../DocumentFormInline';
import SimpleEditDocumentModal from '../SimpleEditDocumentModal';
import { useDocumentOperations } from '@/hooks/useDocumentOperations';
import { useOptimizedUser } from '@/hooks/useOptimizedUser';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Folder, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  Upload,
  Search,
  Grid3X3,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UploadProgressModal } from './UploadProgressModal';
import type { Document } from '@shared/schema';

const ITEMS_PER_PAGE = 4;

interface DocumentManagementContainerProps {
  viewMode?: 'grid' | 'list';
  searchQuery?: string;
  selectedCategory?: string;
  isDocumentFormOpen?: boolean;
  setIsDocumentFormOpen?: (open: boolean) => void;
}

export const DocumentManagementContainer: React.FC<DocumentManagementContainerProps> = ({}) => {
  const { user, isAuthenticated } = useOptimizedUser();
  
  // Estados da UI
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isDocumentFormOpen, setIsDocumentFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileCategory, setSelectedFileCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Configuração das categorias
  const categories = [
    { type: 'Todos', name: 'Todos os Arquivos', icon: Folder },
    { type: 'Documentos', name: 'Documentos', icon: FileText },
    { type: 'Imagens', name: 'Imagens', icon: Image },
    { type: 'Vídeos', name: 'Vídeos', icon: Video },
    { type: 'Áudio', name: 'Áudio', icon: Music },
    { type: 'Outros', name: 'Outros', icon: Archive }
  ];

  // Hook de operações de documentos
  const {
    createDocument,
    updateDocument,
    deleteDocument,
    isUploading,
    uploadProgress,
    uploadStage,
    validateFormData,
    generateDigitalId
  } = useDocumentOperations();

  // Queries de dados
  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/documents-with-related'],
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    gcTime: 10 * 60 * 1000, // 10 minutos no garbage collector
  });

  // Query para contagem de categorias
  const { data: categoryCounts = {} } = useQuery({
    queryKey: ['/api/documents/category-counts'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  // Filtros
  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.tags && doc.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = selectedCategory === 'Todos' || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Paginação
  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset para primeira página quando mudar filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Handlers
  const handleDocumentFormSubmit = async (formData: any, attachedImages?: File[], mainFile?: File) => {
    const fileToUpload = mainFile || selectedFile;
    
    if (!fileToUpload) {
      alert('Nenhum arquivo selecionado para upload!');
      return;
    }

    await createDocument(formData, fileToUpload, attachedImages, {
      onSuccess: () => {
        setIsDocumentFormOpen(false);
        setSelectedFile(null);
        setSelectedFileCategory('');
        refetch();
      }
    });
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
  };

  const handleEditSubmit = async (data: any) => {
    if (!editingDocument) return;

    await updateDocument(editingDocument.id, data, {
      onSuccess: () => {
        setEditingDocument(null);
        refetch();
      }
    });
  };

  const handleDeleteDocument = async (document: Document) => {
    if (window.confirm(`Tem certeza que deseja excluir "${document.title}"?`)) {
      await deleteDocument(document.id, document.title, {
        onSuccess: () => refetch()
      });
    }
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      const response = await fetch(`/api/documents/${document.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = document.title;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (error) {
      console.error('Erro no download:', error);
    }
  };

  const handleViewDocument = (document: Document) => {
    window.location.href = `/document/${document.id}`;
  };

  const handleAttachDocument = (document: Document) => {
    // Implementar lógica de anexar documento
    setIsDocumentFormOpen(true);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Folder className="h-6 w-6 text-amber-400 fill-current" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Gestão de Documentos
              </h1>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              Nível de acesso: 2
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setIsDocumentFormOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Enviar Documentos
            </Button>
          </div>
        </div>
      </div>

      {/* Área principal */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {/* Sidebar com categorias */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="px-3 py-2">
                <CardTitle className="text-sm">Categorias</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === category.type;
                    
                    return (
                      <button
                        key={category.type}
                        onClick={() => setSelectedCategory(category.type)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                          isSelected && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={cn(
                            "h-3.5 w-3.5",
                            isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                          )} />
                          <span className="text-xs font-medium">{category.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {category.type === 'Todos' ? categoryCounts['all'] : categoryCounts[category.type] || 0}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Área principal de conteúdo */}
          <div className="lg:col-span-5">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar arquivos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Document Grid */}
                <DocumentGrid
                  documents={paginatedDocuments}
                  viewMode={viewMode}
                  isLoading={isLoading}
                  searchQuery={searchQuery}
                  onView={handleViewDocument}
                  onDownload={handleDownloadDocument}
                  onEdit={handleEditDocument}
                  onDelete={handleDeleteDocument}
                  onAttach={handleAttachDocument}
                  isAuthenticated={isAuthenticated}
                />
                
                {/* Controles de Paginação */}
                {filteredDocuments.length > ITEMS_PER_PAGE && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                      Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredDocuments.length)} de {filteredDocuments.length}
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="h-8 px-2 sm:px-3"
                      >
                        <span className="sm:hidden">←</span>
                        <span className="hidden sm:inline">Anterior</span>
                      </Button>
                      
                      {/* Números de página - mostrar menos em mobile */}
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            // Em mobile, mostrar apenas páginas próximas
                            if (totalPages <= 5) return true;
                            if (page === 1 || page === totalPages) return true;
                            return Math.abs(page - currentPage) <= 1;
                          })
                          .map((page, index, array) => (
                            <React.Fragment key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className="px-1 text-gray-400">...</span>
                              )}
                              <Button
                                variant={currentPage === page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-7 h-7 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm"
                              >
                                {page}
                              </Button>
                            </React.Fragment>
                          ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 px-2 sm:px-3"
                      >
                        <span className="sm:hidden">→</span>
                        <span className="hidden sm:inline">Próximo</span>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Upload Progress Modal */}
      <UploadProgressModal
        isVisible={isUploading}
        progress={uploadProgress}
        stage={uploadStage}
      />

      {/* Document Form Modal */}
      <Dialog open={isDocumentFormOpen} onOpenChange={setIsDocumentFormOpen}>
        <DialogContent className="max-w-7xl w-[98vw] max-h-[95vh] overflow-y-auto">
          <VisuallyHidden>
            <DialogTitle>Enviar Documentos</DialogTitle>
          </VisuallyHidden>
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-6 -m-6 mb-6 rounded-t-lg">
            <h2 className="text-xl font-bold">Enviar Documentos</h2>
          </div>
          
          <DocumentFormInline
            onSubmit={handleDocumentFormSubmit}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            selectedFileCategory={selectedFileCategory}
            onCategorySelect={setSelectedFileCategory}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Document Modal */}
      {editingDocument && (
        <SimpleEditDocumentModal
          document={editingDocument}
          isOpen={true}
          onClose={() => setEditingDocument(null)}
          onSave={handleEditSave}
        />
      )}
      
    </div>
  );
};