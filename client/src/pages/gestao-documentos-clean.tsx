import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  Grid3X3, 
  List, 
  Folder,
  FileText,
  Image,
  Zap,
  Video,
  Music,
  Archive,
  Link2,
  File,
  FileSpreadsheet,
  Presentation,
  BookOpen,
  Calendar
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { Document, SystemStats } from '@shared/schema';
import DocumentFormModal from '@/components/DocumentFormModal';
import FileUploadModal from '@/components/FileUploadModal';
import { supabaseStorageService } from '@/services/supabaseStorageService';
import { useToast } from '@/hooks/use-toast';

// Categorias disponíveis no sistema
const categories = [
  { name: 'Todos os arquivos', icon: Folder, count: 0, type: 'all' },
  { name: 'Documentos', icon: FileText, count: 0, type: 'Documentos' },
  { name: 'Imagens', icon: Image, count: 0, type: 'Imagens' },
  { name: 'Vídeos', icon: Video, count: 0, type: 'Vídeos' },
  { name: 'Áudio', icon: Music, count: 0, type: 'Áudio' },
  { name: 'Arquivos', icon: Archive, count: 0, type: 'Arquivos' },
  { name: 'Outros', icon: Archive, count: 0, type: 'Outros' },
];

export default function GestaoDocumentos() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDocumentFormOpen, setIsDocumentFormOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileCategory, setSelectedFileCategory] = useState('');

  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Buscar documentos
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  // Filtrar documentos baseado na categoria e busca
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Contar documentos por categoria
  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    count: cat.type === 'all' 
      ? filteredDocuments.length 
      : filteredDocuments.filter(doc => doc.category === cat.type).length
  }));

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Função para obter ícone por tipo de arquivo
  const getFileIcon = (document: Document) => {
    try {
      const documentDetails = JSON.parse(document.content || '{}');
      const fileType = documentDetails?.fileType || documentDetails?.fileInfo?.mimeType || '';
      const fileName = documentDetails?.fileName || documentDetails?.fileInfo?.originalName || document.title;
      
      if (fileType.includes('pdf') || fileName.toLowerCase().includes('.pdf')) {
        return { icon: File, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', type: 'PDF' };
      }
      if (fileType.includes('word') || fileType.includes('document') || fileName.toLowerCase().includes('.doc')) {
        return { icon: BookOpen, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', type: 'WORD' };
      }
      if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileName.toLowerCase().includes('.xls')) {
        return { icon: FileSpreadsheet, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', type: 'EXCEL' };
      }
      if (fileType.includes('image') || fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) {
        return { icon: Image, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', type: 'IMAGE' };
      }
      
      return { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', type: 'DOC' };
    } catch (error) {
      return { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', type: 'DOC' };
    }
  };

  // Função para lidar com seleção de arquivo (abre o formulário)
  const handleFileSelected = (file: File, category: string) => {
    setSelectedFile(file);
    setSelectedFileCategory(category);
    setIsDocumentFormOpen(true);
  };

  // Função para calcular hash SHA-256 do arquivo
  const calculateFileHash = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {
      console.error('Erro ao calcular hash SHA-256:', error);
      return 'HASH_CALCULATION_ERROR';
    }
  };

  // Função para submeter o formulário completo
  const handleDocumentFormSubmit = async (formData: any) => {
    if (!selectedFile) return;

    try {
      // 1. Calcular hash SHA-256 do arquivo
      const fileHash = await calculateFileHash(selectedFile);

      // 2. Fazer upload do arquivo para o Supabase Storage
      const uploadedFiles = await supabaseStorageService.uploadMultipleFiles([selectedFile], {
        category: selectedFileCategory,
        description: formData.description,
        tags: formData.tags || []
      });

      if (uploadedFiles.length === 0) {
        throw new Error('Falha no upload do arquivo');
      }

      const uploadedFile = uploadedFiles[0];

      // 3. Criar documento com dados completos do formulário
      const documentData = {
        title: formData.title,
        description: formData.description,
        content: JSON.stringify({
          description: formData.description,
          documentType: formData.documentType,
          publicOrgan: formData.publicOrgan,
          responsible: formData.responsible,
          mainSubject: formData.mainSubject,
          digitalId: formData.digitalId || `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          verificationHash: fileHash,
          fileName: selectedFile.name,
          fileSize: formatFileSize(selectedFile.size),
          fileType: selectedFile.type,
          supabaseUrl: uploadedFile.file_path
        }),
        category: selectedFileCategory,
        author: formData.responsible || 'Sistema',
        tags: formData.tags || []
      };

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData)
      });

      if (!response.ok) {
        throw new Error('Erro ao criar documento');
      }

      // Invalidar cache para recarregar documentos
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      // Resetar estados
      setSelectedFile(null);
      setSelectedFileCategory('');
      setIsDocumentFormOpen(false);
      
      toast({
        title: "Documento salvo com sucesso!",
        description: `${formData.title} foi adicionado ao sistema.`,
      });
      
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      toast({
        title: "Erro ao salvar documento",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
    }
  };

  const handleDownloadDocument = async (doc: any) => {
    try {
      // Fallback: download como texto
      const element = window.document.createElement('a');
      const file = new Blob([`Documento: ${doc.title}\n\nConteúdo: ${doc.content || doc.description || 'Conteúdo do documento...'}\n\nAutor: ${doc.author}\nCategoria: ${doc.category || 'Não especificada'}`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${doc.title || 'documento'}.txt`;
      window.document.body.appendChild(element);
      element.click();
      window.document.body.removeChild(element);
      
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro no download",
        description: "Erro ao baixar arquivo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocument = async (document: Document) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja deletar o documento "${document.title}"?\n\nEsta ação não pode ser desfeita.`
    );
    
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar documento');
      }

      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: "Documento deletado",
        description: "O documento foi removido com sucesso.",
      });
      
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      toast({
        title: "Erro ao deletar",
        description: "Erro ao deletar documento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-4rem)]">
      {/* Header com informações de nível de acesso */}
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
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Enviar Documentos
            </Button>
          </div>
        </div>
      </div>

      {/* Estatísticas principais */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {filteredDocuments.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Documentos
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Área principal com sidebar e conteúdo */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar com categorias */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categorias</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {categoriesWithCounts.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === category.type;
                    
                    return (
                      <button
                        key={category.type}
                        onClick={() => setSelectedCategory(category.type)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                          isSelected && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={cn(
                            "h-4 w-4",
                            isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                          )} />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Área principal de conteúdo */}
          <div className="lg:col-span-3">
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
                <div className="mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredDocuments.length} arquivo(s) encontrado(s)
                  </span>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">Carregando arquivos...</div>
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchQuery ? 'Nenhum arquivo encontrado' : 'Nenhum arquivo disponível'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className={cn(
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                      : 'space-y-2'
                  )}>
                    {filteredDocuments.map((document: Document) => {
                      const fileInfo = getFileIcon(document);
                      const { icon: Icon, color, bgColor, borderColor, type } = fileInfo;
                      
                      return viewMode === 'grid' ? (
                        <Card key={document.id} className="group hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden bg-white">
                          <CardContent className="p-6">
                            {/* Header do documento */}
                            <div className="flex items-start gap-4 mb-4">
                              <div className={cn("p-3 rounded-xl shadow-lg", bgColor, "border-2", borderColor)}>
                                <Icon className={cn("h-7 w-7", color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2 mb-2 leading-tight">
                                  {document.title}
                                </h3>
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className={cn("font-semibold px-3 py-1.5 text-sm", color, borderColor, "border-2")}>
                                    {type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            {/* Descrição */}
                            {document.description && (
                              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-4">
                                <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">
                                  {document.description}
                                </p>
                              </div>
                            )}
                            
                            {/* Footer do card com data e botões */}
                            <div className="flex items-center justify-between pt-5 border-t border-gray-200">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">
                                  {document.createdAt ? formatDate(document.createdAt) : 'Data não disponível'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => setLocation(`/document/${document.id}`)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 shadow-sm"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Detalhes
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadDocument(document)}
                                  className="border-green-600 text-green-600 hover:bg-green-50 font-medium px-3 py-1.5"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Baixar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteDocument(document)}
                                  className="border-red-600 text-red-600 hover:bg-red-50 font-medium px-3 py-1.5"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card key={document.id} className="hover:shadow-lg transition-all duration-200">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className={cn("p-2 rounded-lg", bgColor, borderColor, "border-2")}>
                                <Icon className={cn("h-5 w-5", color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate mb-2">
                                  {document.title}
                                </h3>
                                {document.description && (
                                  <p className="text-sm text-gray-600 truncate">
                                    {document.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setLocation(`/document/${document.id}`)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Detalhes
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadDocument(document)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Baixar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteDocument(document)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Upload */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={() => {}}
        onFileSelected={handleFileSelected}
      />

      {/* Modal do Formulário de Documento */}
      <DocumentFormModal
        isOpen={isDocumentFormOpen}
        onClose={() => setIsDocumentFormOpen(false)}
        onSubmit={handleDocumentFormSubmit}
        fileName={selectedFile?.name || ''}
      />
    </div>
  );
}