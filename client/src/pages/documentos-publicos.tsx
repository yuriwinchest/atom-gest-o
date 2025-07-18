import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter,
  Grid3X3,
  List,
  Folder,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Download,
  Eye,
  X,
  AlertCircle,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { Document } from '@shared/schema';
import PublicPreviewModal from '@/components/PublicPreviewModal';

// Categorias para filtros
const categories = [
  { name: 'Todos', icon: Folder, count: 0, type: 'all', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { name: 'Documentos', icon: FileText, count: 0, type: 'Documentos', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { name: 'Imagens', icon: Image, count: 0, type: 'Imagens', color: 'bg-green-100 text-green-800 border-green-200' },
  { name: 'Vídeos', icon: Video, count: 0, type: 'Vídeos', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { name: 'Áudio', icon: Music, count: 0, type: 'Áudio', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  { name: 'Outros', icon: Archive, count: 0, type: 'Outros', color: 'bg-gray-100 text-gray-800 border-gray-200' },
];

// Função para determinar ícone e cores baseado no tipo de arquivo
const getFileIconWithColor = (document: Document) => {
  try {
    const documentDetails = JSON.parse(document.content || '{}');
    const fileType = documentDetails?.fileType || documentDetails?.fileInfo?.mimeType || '';
    
    if (fileType.includes('pdf')) {
      return { 
        icon: FileText, 
        color: 'text-red-600', 
        bgColor: 'bg-red-50', 
        borderColor: 'border-red-200',
        type: 'PDF',
        accent: 'bg-red-500'
      };
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return { 
        icon: FileText, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50', 
        borderColor: 'border-blue-200',
        type: 'Word',
        accent: 'bg-blue-500'
      };
    } else if (fileType.includes('image')) {
      return { 
        icon: Image, 
        color: 'text-green-600', 
        bgColor: 'bg-green-50', 
        borderColor: 'border-green-200',
        type: 'Imagem',
        accent: 'bg-green-500'
      };
    } else if (fileType.includes('video')) {
      return { 
        icon: Video, 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-50', 
        borderColor: 'border-purple-200',
        type: 'Vídeo',
        accent: 'bg-purple-500'
      };
    } else if (fileType.includes('audio')) {
      return { 
        icon: Music, 
        color: 'text-teal-600', 
        bgColor: 'bg-teal-50', 
        borderColor: 'border-teal-200',
        type: 'Áudio',
        accent: 'bg-teal-500'
      };
    }
  } catch (error) {
    // Fallback silencioso
  }
  
  return { 
    icon: FileText, 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-50', 
    borderColor: 'border-gray-200',
    type: 'Documento',
    accent: 'bg-gray-500'
  };
};

interface DocumentosPublicosProps {
  user?: any;
}

export default function DocumentosPublicos({ user }: DocumentosPublicosProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSearchError, setShowSearchError] = useState(false);
  const [location, setLocation] = useLocation();
  
  // Estados para o modal de preview
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Extrair parâmetro de busca da URL quando a página carrega
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location]);

  // Buscar todos os documentos
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents']
  });

  // Filtrar documentos
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Atualizar contadores das categorias
  const categoriesWithCount = categories.map(cat => ({
    ...cat,
    count: cat.type === 'all' ? documents.length : documents.filter(doc => doc.category === cat.type).length
  }));

  const handleSearch = () => {
    if (filteredDocuments.length === 0 && searchQuery) {
      setShowSearchError(true);
    } else {
      setShowSearchError(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchError(false);
  };



  const handleDownloadDocument = (document: Document) => {
    window.open(`/api/documents/${document.id}/view`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Acervo Digital de Documentos</h1>
          <p className="text-xl text-purple-100 mb-8">
            Explore nossa coleção de documentos históricos e patrimônio cultural
          </p>
          
          {/* Barra de busca */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-10 h-12 text-gray-900 bg-white border-0 focus:ring-2 focus:ring-white/20"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button 
                onClick={handleSearch}
                className="h-12 px-8 bg-white text-purple-600 hover:bg-purple-50 font-semibold"
              >
                Buscar
              </Button>
            </div>
            
            {/* Erro de busca */}
            {showSearchError && (
              <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-200" />
                <div className="text-left">
                  <p className="text-red-100 font-medium">Erro ao buscar documentos. Verifique sua conexão e tente novamente.</p>
                  <p className="text-red-200 text-sm mt-1">
                    Dica: Busque por palavras-chave como "uma", "por", "as" ou qualquer palavra nas etiquetas (tags) dos documentos
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSearchError(false)}
                  className="text-red-200 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filtros horizontais entre busca e cards */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-900 dark:text-white text-sm">Filtrar por categoria:</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {categoriesWithCount.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.type}
                  variant={selectedCategory === category.type ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.type)}
                  className={cn(
                    "h-auto p-2.5 border text-xs font-medium",
                    selectedCategory === category.type 
                      ? category.color 
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className="h-3 w-3 mr-1.5" />
                  <span>{category.name}</span>
                  <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0.5">
                    {category.count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Controles de visualização compactos */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            {filteredDocuments.length} documento(s) encontrado(s)
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-3"
            >
              <Grid3X3 className="h-3 w-3" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              <List className="h-3 w-3" />
            </Button>
          </div>
        </div>

            {/* Loading */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Carregando documentos...</p>
              </div>
            )}

            {/* Documentos não encontrados */}
            {!isLoading && filteredDocuments.length === 0 && (
              <div className="text-center py-16">
                <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhum documento encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Não encontramos nenhum documento correspondente<br />
                  à busca "{searchQuery}".
                </p>
                <Button onClick={clearSearch} className="bg-blue-600 hover:bg-blue-700">
                  Limpar busca
                </Button>
              </div>
            )}

            {/* Grid/Lista de documentos */}
            {!isLoading && filteredDocuments.length > 0 && (
              <div className={cn(
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4'
                  : 'space-y-4'
              )}>
                {filteredDocuments.map((document) => {
                  const fileInfo = getFileIconWithColor(document);
                  const { icon: Icon, color, bgColor, borderColor, type, accent } = fileInfo;
                  
                  if (viewMode === 'grid') {
                    return (
                      <Card key={document.id} className="group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-gray-200 overflow-hidden bg-white h-full flex flex-col">
                        <CardContent className="p-0 flex flex-col h-full">
                          {/* Header com gradiente colorido mais sutil */}
                          <div className={cn("h-2 bg-gradient-to-r", accent)}></div>
                          
                          <div className="p-4 flex flex-col flex-1">
                            {/* Header principal compacto */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className={cn("p-2 rounded-xl shadow-md flex-shrink-0 transition-transform group-hover:scale-105", bgColor, "border", borderColor)}>
                                <Icon className={cn("h-5 w-5", color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-2 line-clamp-2">
                                  {document.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={cn("font-medium px-2 py-1 text-xs", color, borderColor, "border shadow-sm")}>
                                    {type}
                                  </Badge>
                                  <span className="text-xs text-gray-500 font-medium bg-gray-50 px-1.5 py-0.5 rounded">432.1 KB</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Metadados bem organizados */}
                            {(() => {
                              try {
                                const documentDetails = JSON.parse(document.content || '{}');
                                const description = documentDetails?.description || document.description;
                                const subject = documentDetails?.mainSubject || documentDetails?.subject || documentDetails?.assunto;
                                const tags = documentDetails?.tags || document.tags || [];
                                
                                return (
                                  <div className="space-y-3 mb-4 flex-1">
                                    {/* Descrição compacta */}
                                    {description && (
                                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-3 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                          <span className="font-bold text-blue-800 text-xs uppercase tracking-wide">Descrição</span>
                                        </div>
                                        <p className="text-gray-800 text-xs line-clamp-2 leading-relaxed font-medium">
                                          {description}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {/* Assunto compacto */}
                                    {subject && (
                                      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 p-3 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          <span className="font-bold text-green-800 text-xs uppercase tracking-wide">Assunto</span>
                                        </div>
                                        <p className="text-gray-800 text-xs line-clamp-1 leading-relaxed font-semibold">
                                          {subject}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {/* Tags compactas */}
                                    {tags && tags.length > 0 && (
                                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 p-3 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                          <span className="font-bold text-purple-800 text-xs uppercase tracking-wide">Palavras-chave</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                          {tags.slice(0, 3).map((tag: string, index: number) => (
                                            <Badge key={index} className="bg-white text-purple-800 border-purple-300 hover:bg-purple-50 font-medium px-2 py-1 text-xs shadow-sm transition-colors">
                                              {tag}
                                            </Badge>
                                          ))}
                                          {tags.length > 3 && (
                                            <Badge className="bg-gray-100 text-gray-600 border-gray-300 font-medium px-2 py-1 text-xs shadow-sm">
                                              +{tags.length - 3}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              } catch (error) {
                                return (
                                  <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded-r-lg flex-1">
                                    <p className="text-sm text-gray-600 italic">
                                      {document.description || 'Sem informações adicionais disponíveis'}
                                    </p>
                                  </div>
                                );
                              }
                            })()}
                            
                            {/* Footer compacto e elegante */}
                            <div className="mt-auto pt-4 border-t border-gray-100">
                              {/* Data compacta */}
                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                <Calendar className="h-3 w-3 flex-shrink-0" />
                                <span className="font-medium">
                                  {document.createdAt ? formatDate(document.createdAt) : 'Data não disponível'}
                                </span>
                              </div>
                              
                              {/* Botões compactos responsivos */}
                              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => window.location.href = `/document/${document.id}?public=true`}
                                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 h-8 text-[10px] sm:text-xs px-1 sm:px-3"
                                >
                                  <Eye className="h-3 w-3 sm:mr-1" />
                                  <span className="hidden sm:inline">Ver</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadDocument(document)}
                                  className="border border-green-600 text-green-700 hover:bg-green-600 hover:text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 h-8 text-[10px] sm:text-xs px-1 sm:px-3"
                                >
                                  <Download className="h-3 w-3 sm:mr-1" />
                                  <span className="hidden sm:inline">Baixar</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  } else {
                    return (
                      <div key={document.id} className={cn(
                        "flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg hover:shadow-md transition-all duration-200 border-l-4 bg-white dark:bg-gray-800 min-w-0 overflow-hidden",
                        accent.replace('bg-', 'border-l-')
                      )}>
                        <div className={cn("p-2 sm:p-3 rounded-lg shrink-0", bgColor, borderColor, "border")}>
                          <Icon className={cn("h-4 w-4 sm:h-6 sm:w-6", color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base truncate">
                            {document.title}
                          </h3>
                          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <Badge variant="outline" className={cn("text-xs shrink-0", color, borderColor)}>
                              {type}
                            </Badge>
                            <span className="truncate text-xs sm:text-sm">{document.createdAt ? formatDate(document.createdAt) : 'Data não disponível'}</span>
                          </div>
                          
                          {/* Campos do formulário na visão lista - horizontalmente distribuído */}
                          {(() => {
                            try {
                              const documentDetails = JSON.parse(document.content || '{}');
                              const description = documentDetails?.description || document.description;
                              const subject = documentDetails?.mainSubject || documentDetails?.subject || documentDetails?.assunto;
                              const tags = documentDetails?.tags || document.tags || [];
                              
                              return (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-600 dark:text-gray-400">
                                  {/* Descrição */}
                                  {description && (
                                    <div className="flex items-center gap-1 min-w-0">
                                      <span className="font-medium text-blue-700 shrink-0 hidden sm:inline">Descrição:</span>
                                      <span className="truncate max-w-[120px] sm:max-w-[200px]">
                                        {description.length > (window.innerWidth < 640 ? 30 : 50) ? description.substring(0, window.innerWidth < 640 ? 30 : 50) + '...' : description}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* Assunto */}
                                  {subject && (
                                    <div className="flex items-center gap-1 min-w-0">
                                      <span className="font-medium text-green-700 shrink-0 hidden sm:inline">Assunto:</span>
                                      <span className="truncate max-w-[100px] sm:max-w-[150px]">
                                        {subject.length > (window.innerWidth < 640 ? 25 : 40) ? subject.substring(0, window.innerWidth < 640 ? 25 : 40) + '...' : subject}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* Tags */}
                                  {tags && tags.length > 0 && (
                                    <div className="flex items-center gap-1 min-w-0">
                                      <span className="font-medium text-purple-700 shrink-0 hidden sm:inline">Tags:</span>
                                      <div className="flex gap-1">
                                        {tags.slice(0, 1).map((tag: string, index: number) => (
                                          <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 max-w-[60px] sm:max-w-none truncate">
                                            {tag}
                                          </Badge>
                                        ))}
                                        {tags.length > 1 && (
                                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 shrink-0">
                                            +{tags.length - 1}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            } catch (error) {
                              return (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {document.description || 'Sem descrição disponível'}
                                </p>
                              );
                            }
                          })()}
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.href = `/document/${document.id}?public=true`}
                            className="text-blue-600 hover:text-blue-700 p-1 sm:p-2"
                            title="Ver detalhes do documento"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadDocument(document)}
                            className="text-green-600 hover:text-green-700 p-1 sm:p-2"
                            title="Baixar documento"
                          >
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </div>

          {/* Footer estático removido - agora usa o Footer dinâmico global */}

      {/* Modal de Preview Público */}
      <PublicPreviewModal
        document={previewDocument}
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewDocument(null);
        }}
      />
    </div>
  );
}