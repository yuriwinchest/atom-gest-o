import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  BarChart3,
  RefreshCw,
  HardDrive,
  Users,
  Clock
} from 'lucide-react';
import SupabaseFileUpload from '@/components/FileManager/SupabaseFileUpload';
import { useSupabaseFiles } from '@/hooks/useSupabaseFiles';
import { formatDate, formatNumber } from '@/lib/utils';

export default function SupabaseFileManager() {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    files,
    filteredFiles,
    stats,
    loading,
    error,
    uploading,
    uploadProgress,
    refreshFiles,
    uploadFiles,
    deleteFile,
    downloadFile,
    clearError
  } = useSupabaseFiles({
    autoRefresh: true,
    refreshInterval: 30000,
    userId: 'demo-user'
  });

  // Ícones por tipo de arquivo
  const getFileIcon = (fileType: string) => {
    const icons = {
      documents: FileText,
      images: Image,
      videos: Video,
      audio: Music,
      spreadsheets: FileText,
      presentations: FileText,
      archives: Archive
    };
    const Icon = icons[fileType as keyof typeof icons] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  // Cores por tipo de arquivo
  const getFileTypeColor = (fileType: string) => {
    const colors = {
      documents: 'bg-blue-100 text-blue-800',
      images: 'bg-green-100 text-green-800',
      videos: 'bg-purple-100 text-purple-800',
      audio: 'bg-orange-100 text-orange-800',
      spreadsheets: 'bg-emerald-100 text-emerald-800',
      presentations: 'bg-pink-100 text-pink-800',
      archives: 'bg-gray-100 text-gray-800'
    };
    return colors[fileType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Formatar tamanho de arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Manipular upload completo
  const handleUploadComplete = (uploadedFiles: any[]) => {
    setShowUpload(false);
    refreshFiles();
    console.log('Arquivos enviados:', uploadedFiles);
  };

  // Manipular erro de upload
  const handleUploadError = (error: string) => {
    console.error('Erro no upload:', error);
  };

  // Manipular exclusão
  const handleDelete = async (fileId: string) => {
    if (confirm('Tem certeza que deseja excluir este arquivo?')) {
      const success = await deleteFile(fileId);
      if (success) {
        console.log('Arquivo excluído com sucesso');
      } else {
        console.error('Erro ao excluir arquivo');
      }
    }
  };

  // Filtrar arquivos
  const applyFilters = (files: any[]) => {
    let filtered = files;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(file =>
        file.original_name?.toLowerCase().includes(term) ||
        file.description?.toLowerCase().includes(term) ||
        file.tags?.some((tag: string) => tag.toLowerCase().includes(term))
      );
    }

    if (selectedBucket && selectedBucket !== 'all') {
      filtered = filtered.filter(file => file.file_type === selectedBucket);
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(file => file.category === selectedCategory);
    }

    return filtered;
  };

  const displayFiles = applyFilters(files);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gerenciador de Arquivos Supabase</h1>
          <p className="text-gray-600">Gerencie seus arquivos com armazenamento em nuvem</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshFiles}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={() => setShowUpload(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Enviar Arquivos
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <p className="text-red-800">{error}</p>
              <Button variant="ghost" size="sm" onClick={clearError}>
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalFiles}</p>
                  <p className="text-sm text-gray-600">Total de Arquivos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <HardDrive className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
                  <p className="text-sm text-gray-600">Espaço Usado</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{Object.keys(stats.byType).length}</p>
                  <p className="text-sm text-gray-600">Tipos de Arquivo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.recentFiles.length}</p>
                  <p className="text-sm text-gray-600">Arquivos Recentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="files" className="space-y-4">
        <TabsList>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
          <TabsTrigger value="analytics">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar arquivos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de arquivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="documents">Documentos</SelectItem>
                    <SelectItem value="images">Imagens</SelectItem>
                    <SelectItem value="videos">Vídeos</SelectItem>
                    <SelectItem value="audio">Áudio</SelectItem>
                    <SelectItem value="spreadsheets">Planilhas</SelectItem>
                    <SelectItem value="presentations">Apresentações</SelectItem>
                    <SelectItem value="archives">Arquivos</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    <SelectItem value="documento">Documento</SelectItem>
                    <SelectItem value="relatório">Relatório</SelectItem>
                    <SelectItem value="apresentação">Apresentação</SelectItem>
                    <SelectItem value="planilha">Planilha</SelectItem>
                    <SelectItem value="imagem">Imagem</SelectItem>
                    <SelectItem value="backup">Backup</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setSelectedBucket('all');
                  setSelectedCategory('all');
                }}>
                  <Filter className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Arquivos */}
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p>Carregando arquivos...</p>
              </CardContent>
            </Card>
          ) : displayFiles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum arquivo encontrado</p>
                <Button className="mt-4" onClick={() => setShowUpload(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar Primeiro Arquivo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayFiles.map((file) => (
                <Card key={file.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(file.file_type)}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{file.original_name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getFileTypeColor(file.file_type)}>
                              {file.file_type}
                            </Badge>
                            {file.category && (
                              <Badge variant="outline">{file.category}</Badge>
                            )}
                            <span className="text-sm text-gray-500">
                              {formatFileSize(file.file_size)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(file.created_at)}
                            </span>
                          </div>
                          {file.description && (
                            <p className="text-sm text-gray-600 mt-1 truncate">
                              {file.description}
                            </p>
                          )}
                          {file.tags && file.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {file.tags.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {file.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{file.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadFile(file)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.byType).map(([type, data]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getFileIcon(type)}
                          <span className="capitalize">{type}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{data.count} arquivos</div>
                          <div className="text-sm text-gray-500">
                            {formatFileSize(data.size)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Arquivos Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-3">
                        {getFileIcon(file.file_type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.original_name}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(file.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getFileTypeColor(file.file_type)}>
                            {file.file_type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Upload */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Upload de Arquivos</h2>
              <Button variant="ghost" onClick={() => setShowUpload(false)}>
                ×
              </Button>
            </div>
            <div className="p-4">
              <SupabaseFileUpload
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                userId="demo-user"
                maxFiles={20}
              />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}