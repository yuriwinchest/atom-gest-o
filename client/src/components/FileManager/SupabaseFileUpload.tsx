import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabaseStorageService } from '@/services/supabaseStorageService';
import type { UploadProgress } from '@/services/supabaseStorageService';

interface SupabaseFileUploadProps {
  onUploadComplete?: (files: any[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  userId?: string;
  className?: string;
}

interface FileWithPreview extends File {
  id: string;
  preview?: string;
}

export default function SupabaseFileUpload({
  onUploadComplete,
  onUploadError,
  maxFiles = 20,
  userId = 'demo-user',
  className = ''
}: SupabaseFileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  
  // Metadados
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const bucketConfig = supabaseStorageService.getBucketConfig();

  // Categorias disponíveis
  const categories = [
    'documento',
    'relatório',
    'apresentação',
    'planilha',
    'imagem',
    'arquivo',
    'backup',
    'outro'
  ];

  // Determinar tipo de arquivo baseado na extensão
  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const extensionMap: { [key: string]: string } = {
      'pdf': 'documents',
      'doc': 'documents',
      'docx': 'documents',
      'txt': 'documents',
      'jpg': 'images',
      'jpeg': 'images',
      'png': 'images',
      'gif': 'images',
      'webp': 'images',
      'svg': 'images',
      'xls': 'spreadsheets',
      'xlsx': 'spreadsheets',
      'csv': 'spreadsheets',
      'ppt': 'presentations',
      'pptx': 'presentations',
      'zip': 'archives',
      'rar': 'archives',
      '7z': 'archives',
      'mp4': 'videos',
      'avi': 'videos',
      'mov': 'videos',
      'mp3': 'audio',
      'wav': 'audio',
      'ogg': 'audio'
    };
    return extensionMap[extension || ''] || 'documents';
  };

  // Validar arquivo - SEM LIMITES DE TAMANHO
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const fileType = getFileType(file.name);
    const config = bucketConfig[fileType as keyof typeof bucketConfig];

    if (!config) {
      return { valid: false, error: 'Tipo de arquivo não suportado' };
    }

    // REMOVIDO: Verificação de tamanho máximo
    // Agora aceita arquivos de qualquer tamanho

    if (!config.mimeTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    })) {
      return { valid: false, error: 'Tipo MIME não permitido' };
    }

    return { valid: true };
  };

  // Processar arquivos selecionados
  const processFiles = (fileList: FileList) => {
    const newFiles: FileWithPreview[] = [];
    
    for (let i = 0; i < Math.min(fileList.length, maxFiles - files.length); i++) {
      const file = fileList[i];
      const validation = validateFile(file);
      
      if (validation.valid) {
        const fileWithPreview = Object.assign(file, {
          id: Math.random().toString(36).substring(2),
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
        });
        newFiles.push(fileWithPreview);
      } else {
        onUploadError?.(validation.error || 'Erro de validação');
      }
    }
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  // Eventos de drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  }, []);

  // Selecionar arquivos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  // Remover arquivo
  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(file => file.id !== id);
      // Limpar URL de preview se existir
      const removedFile = prev.find(file => file.id === id);
      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      return updated;
    });
  };

  // Adicionar tag
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  // Remover tag
  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // Upload dos arquivos
  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress([]);

    try {
      const metadata = {
        category: category || undefined,
        description: description || undefined,
        tags: tags.length > 0 ? tags : undefined,
        userId
      };

      const results = await supabaseStorageService.uploadMultipleFiles(
        files,
        metadata,
        (progress) => setUploadProgress(progress)
      );

      // Limpar formulário
      setFiles([]);
      setCategory('');
      setDescription('');
      setTags([]);
      setUploadProgress([]);

      onUploadComplete?.(results);
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Erro no upload');
    } finally {
      setUploading(false);
    }
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de Arquivos - Supabase Storage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Área de upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium mb-2">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Máximo {maxFiles} arquivos. Tipos suportados: PDF, Word, Excel, PowerPoint, Imagens, Arquivos
          </p>
          <Button variant="outline" asChild>
            <label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp,.svg,.xls,.xlsx,.csv,.ppt,.pptx,.zip,.rar,.7z,.mp4,.avi,.mov,.mp3,.wav,.ogg"
                onChange={handleFileSelect}
                className="hidden"
              />
              Selecionar Arquivos
            </label>
          </Button>
        </div>

        {/* Lista de arquivos selecionados */}
        {files.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Arquivos Selecionados ({files.length})</h3>
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {file.preview ? (
                    <img src={file.preview} alt="" className="w-10 h-10 object-cover rounded" />
                  ) : (
                    <FileText className="h-10 w-10 text-blue-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • {getFileType(file.name)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição dos arquivos..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2 flex-wrap">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                {tag} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Adicionar tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <Button variant="outline" size="sm" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progresso do upload */}
        {uploadProgress.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Progresso do Upload</h3>
            {uploadProgress.map((progress, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{progress.filename}</span>
                  <div className="flex items-center gap-2">
                    {progress.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {progress.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                    <span className="text-sm">{progress.progress}%</span>
                  </div>
                </div>
                <Progress value={progress.progress} className="h-2" />
                {progress.error && (
                  <p className="text-sm text-red-500">{progress.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Botão de upload */}
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="w-full"
          size="lg"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Enviando Arquivos...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Enviar {files.length} Arquivo{files.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}