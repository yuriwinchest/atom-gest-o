import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Grid3x3, 
  List,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Trash2,
  Calendar,
  User,
  HardDrive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Document {
  id: number;
  title: string;
  description?: string;
  content: string;
  tags: string[];
  category: string;
  author: string | null;
  createdAt: string;
}

interface CategoryCounts {
  all: number;
  Documentos: number;
  Imagens: number;
  Vídeos: number;
  Áudio: number;
  Outros: number;
}

const ITEMS_PER_PAGE = 4;

const categories = [
  { key: 'all', label: 'Todos os arquivos', icon: HardDrive },
  { key: 'Documentos', label: 'Documentos', icon: FileText },
  { key: 'Imagens', label: 'Imagens', icon: ImageIcon },
  { key: 'Vídeos', label: 'Vídeos', icon: Video },
  { key: 'Áudio', label: 'Áudio', icon: Music },
];

export default function GestaoArquivos() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Buscar contagem por categoria
  const { data: categoryCounts, isLoading: countsLoading } = useQuery<CategoryCounts>({
    queryKey: ['/api/documents/category-counts'],
    staleTime: 30 * 1000,
  });

  // Buscar documentos
  const { data: allDocuments = [], isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents-with-related'],
    staleTime: 30 * 1000,
  });

  // Filtrar documentos por categoria e busca
  const filteredDocuments = React.useMemo(() => {
    let filtered = allDocuments;

    // Filtrar por categoria
    if (activeCategory !== 'all') {
      if (activeCategory === 'Imagens') {
        // Incluir documentos com imagens anexadas
        filtered = filtered.filter(doc => {
          try {
            const content = JSON.parse(doc.content);
            const hasImages = content.additionalImages && content.additionalImages.length > 0;
            return doc.category === 'Imagens' || hasImages;
          } catch {
            return doc.category === 'Imagens';
          }
        });
      } else {
        filtered = filtered.filter(doc => doc.category === activeCategory);
      }
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(term) ||
        doc.description?.toLowerCase().includes(term) ||
        doc.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [allDocuments, activeCategory, searchTerm]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDocuments = filteredDocuments.slice(startIndex, endIndex);

  // Reset página quando mudar filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchTerm]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Documentos': return FileText;
      case 'Imagens': return ImageIcon;
      case 'Vídeos': return Video;
      case 'Áudio': return Music;
      default: return FileText;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const extractMetadata = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      return {
        description: parsed.description || '',
        mainSubject: parsed.mainSubject || '',
        tags: parsed.tags || [],
        additionalImages: parsed.additionalImages || [],
        fileInfo: parsed.fileInfo || {},
        originalName: parsed.originalName || parsed.fileInfo?.originalName || '',
        fileSize: parsed.fileSize || parsed.fileInfo?.fileSize || 0,
        mimeType: parsed.mimeType || parsed.fileInfo?.mimeType || ''
      };
    } catch {
      return {
        description: '',
        mainSubject: '',
        tags: [],
        additionalImages: [],
        fileInfo: {},
        originalName: '',
        fileSize: 0,
        mimeType: ''
      };
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (documentsLoading || countsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando arquivos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar de Categorias */}
        <div className="w-full lg:w-64 bg-white shadow-sm border-r lg:min-h-screen p-3 sm:p-4">
          <h2 className="text-base sm:text-lg font-semibold text-blue-700 mb-3 sm:mb-4">Categorias</h2>
          
          {/* Versão mobile - horizontal scroll */}
          <div className="lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3">
              {categories.map((category) => {
                const Icon = category.icon;
                const count = categoryCounts?.[category.key as keyof CategoryCounts] || 0;
                const isActive = activeCategory === category.key;
                
                return (
                  <button
                    key={category.key}
                    onClick={() => setActiveCategory(category.key)}
                    className={cn(
                      "flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors whitespace-nowrap",
                      isActive 
                        ? "bg-blue-100 text-blue-700 border border-blue-200" 
                        : "hover:bg-gray-100 text-gray-700 bg-white border border-gray-200"
                    )}
                  >
                    <Icon className="h-3 w-3 flex-shrink-0" />
                    <span className="text-xs font-medium">{category.label}</span>
                    <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Versão desktop - vertical */}
          <div className="hidden lg:block space-y-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const count = categoryCounts?.[category.key as keyof CategoryCounts] || 0;
              const isActive = activeCategory === category.key;
              
              return (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors",
                    isActive 
                      ? "bg-blue-100 text-blue-700 border border-blue-200" 
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{category.label}</span>
                  </div>
                  <Badge variant={isActive ? "default" : "secondary"} className="text-xs flex-shrink-0">
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Área Principal */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Linha 1: Busca e Controles */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
                {/* Busca */}
                <div className="relative flex-1 max-w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar arquivos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>

                {/* Controles de Visualização */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="flex-1 sm:flex-none"
                  >
                    <Grid3x3 className="h-4 w-4 sm:mr-0" />
                    <span className="ml-1 sm:hidden">Grade</span>
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="flex-1 sm:flex-none"
                  >
                    <List className="h-4 w-4 sm:mr-0" />
                    <span className="ml-1 sm:hidden">Lista</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Contador de Resultados */}
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {filteredDocuments.length} arquivo(s) {activeCategory !== 'all' && `na categoria ${categories.find(c => c.key === activeCategory)?.label}`}
              </p>
            </div>
          </div>

          {/* Grid/Lista de Arquivos */}
          {currentDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum arquivo encontrado</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? `Nenhum arquivo corresponde ao termo "${searchTerm}"`
                  : 'Nenhum arquivo disponível nesta categoria'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {currentDocuments.map((doc) => {
                    const metadata = extractMetadata(doc.content);
                    const Icon = getCategoryIcon(doc.category);
                    
                    return (
                      <div key={doc.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                        <div className="p-3 sm:p-4">
                          {/* Header do Card */}
                          <div className="flex items-start gap-2 sm:gap-3 mb-3">
                            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 text-xs sm:text-sm leading-tight line-clamp-2">{doc.title}</h3>
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {metadata.originalName || 'Arquivo'}
                              </p>
                            </div>
                          </div>

                          {/* Metadados */}
                          {metadata.description && (
                            <div className="mb-3">
                              <p className="text-xs text-blue-600 font-medium mb-1">• DESCRIÇÃO</p>
                              <p className="text-xs text-gray-700 line-clamp-2">{metadata.description}</p>
                            </div>
                          )}

                          {metadata.mainSubject && (
                            <div className="mb-3">
                              <p className="text-xs text-green-600 font-medium mb-1">• ASSUNTO</p>
                              <p className="text-xs text-gray-700 truncate">{metadata.mainSubject}</p>
                            </div>
                          )}

                          {/* Tags */}
                          {doc.tags.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-purple-600 font-medium mb-1">• TAGS</p>
                              <div className="flex flex-wrap gap-1">
                                {doc.tags.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                                    {tag}
                                  </Badge>
                                ))}
                                {doc.tags.length > 2 && (
                                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                    +{doc.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Info do Arquivo */}
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <span>{formatDate(doc.createdAt)}</span>
                            {metadata.fileSize > 0 && (
                              <span>{formatFileSize(metadata.fileSize)}</span>
                            )}
                          </div>

                          {/* Ações */}
                          <div className="grid grid-cols-3 gap-1 sm:gap-2">
                            <Button variant="outline" size="sm" className="text-xs px-1 sm:px-2">
                              <Eye className="h-3 w-3 sm:mr-1" />
                              <span className="hidden sm:inline">Ver</span>
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs px-1 sm:px-2">
                              <Download className="h-3 w-3 sm:mr-1" />
                              <span className="hidden sm:inline">Baixar</span>
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs px-1 sm:px-2 text-red-600 hover:text-red-700">
                              <Trash2 className="h-3 w-3 sm:mr-1" />
                              <span className="hidden sm:inline">Excluir</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {currentDocuments.map((doc) => {
                      const metadata = extractMetadata(doc.content);
                      const Icon = getCategoryIcon(doc.category);
                      
                      return (
                        <div key={doc.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            {/* Mobile: Header com ícone e título */}
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                              {/* Ícone */}
                              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                              </div>

                              {/* Informações Básicas */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{doc.title}</h3>
                                <p className="text-xs sm:text-sm text-gray-500 truncate mt-1">
                                  {metadata.originalName || 'Arquivo'}
                                </p>
                              </div>
                            </div>

                            {/* Informações Detalhadas */}
                            <div className="flex-1 min-w-0 w-full sm:w-auto">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                  
                                  {/* Metadados em linha */}
                                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 mt-2 text-xs">
                                    {metadata.description && (
                                      <span className="text-blue-600 truncate">
                                        <strong>Descrição:</strong> {metadata.description.substring(0, 30)}...
                                      </span>
                                    )}
                                    {metadata.mainSubject && (
                                      <span className="text-green-600 truncate">
                                        <strong>Assunto:</strong> {metadata.mainSubject}
                                      </span>
                                    )}
                                  </div>

                                  {/* Tags */}
                                  {doc.tags.length > 0 && (
                                    <div className="flex gap-1 mt-2 flex-wrap">
                                      {doc.tags.slice(0, 2).map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                      {doc.tags.length > 2 && (
                                        <Badge variant="secondary" className="text-xs">
                                          +{doc.tags.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Info e Ações */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 sm:ml-4">
                                  <div className="text-left sm:text-right text-xs text-gray-500">
                                    <div>{formatDate(doc.createdAt)}</div>
                                    {metadata.fileSize > 0 && (
                                      <div className="mt-1">{formatFileSize(metadata.fileSize)}</div>
                                    )}
                                  </div>

                                  <div className="flex gap-1 sm:gap-2">
                                    <Button variant="outline" size="sm" className="text-xs px-2 sm:px-3">
                                      <Eye className="h-3 w-3 sm:mr-1" />
                                      <span className="hidden sm:inline">Ver</span>
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-xs px-2 sm:px-3">
                                      <Download className="h-3 w-3 sm:mr-1" />
                                      <span className="hidden sm:inline">Baixar</span>
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-xs px-2 sm:px-3 text-red-600 hover:text-red-700">
                                      <Trash2 className="h-3 w-3 sm:mr-1" />
                                      <span className="hidden sm:inline">Excluir</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="mt-6 sm:mt-8 space-y-4">
                  {/* Info de Paginação */}
                  <div className="text-center sm:text-left">
                    <div className="text-xs sm:text-sm text-gray-600">
                      Mostrando {startIndex + 1}-{Math.min(endIndex, filteredDocuments.length)} de {filteredDocuments.length} arquivos
                    </div>
                  </div>
                  
                  {/* Controles de Paginação */}
                  <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3">
                    {/* Botão Anterior */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="w-full sm:w-auto"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    
                    {/* Números das Páginas */}
                    <div className="flex items-center gap-1 overflow-x-auto max-w-full">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => 
                          page === 1 || 
                          page === totalPages || 
                          Math.abs(page - currentPage) <= 1
                        )
                        .map((page, index, filteredPages) => (
                          <React.Fragment key={page}>
                            {index > 0 && filteredPages[index - 1] !== page - 1 && (
                              <span className="px-1 sm:px-2 text-gray-400 text-xs">...</span>
                            )}
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-8 h-8 p-0 flex-shrink-0"
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        ))
                      }
                    </div>
                    
                    {/* Botão Próxima */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="w-full sm:w-auto"
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}