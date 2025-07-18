/**
 * DocumentFormFileUpload - Seguindo SRP
 * Responsabilidade única: Upload de arquivo principal e imagens
 */

import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Trash2,
  Plus,
  CheckCircle
} from 'lucide-react';

export interface DocumentFormFileUploadProps {
  mainFile: File | null;
  onFileChange: (file: File | null) => void;
  additionalImages: File[];
  onImagesChange: (images: File[]) => void;
  selectedFileCategory?: string;
  onCategorySelect?: (category: string) => void;
}

export const DocumentFormFileUpload: React.FC<DocumentFormFileUploadProps> = ({
  mainFile,
  onFileChange,
  additionalImages,
  onImagesChange,
  selectedFileCategory,
  onCategorySelect
}) => {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.includes('pdf')) return FileText;
    if (type.includes('image')) return Image;
    if (type.includes('video')) return Video;
    if (type.includes('audio')) return Music;
    if (type.includes('document') || type.includes('word')) return FileText;
    if (type.includes('spreadsheet') || type.includes('excel')) return FileText;
    return File;
  };

  const getFileTypeColor = (file: File) => {
    const type = file.type;
    if (type.includes('pdf')) return 'bg-red-100 text-red-700';
    if (type.includes('image')) return 'bg-purple-100 text-purple-700';
    if (type.includes('video')) return 'bg-orange-100 text-orange-700';
    if (type.includes('audio')) return 'bg-pink-100 text-pink-700';
    if (type.includes('document') || type.includes('word')) return 'bg-blue-100 text-blue-700';
    if (type.includes('spreadsheet') || type.includes('excel')) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileChange(file);
      
      // Auto-detectar categoria
      if (onCategorySelect) {
        if (file.type.includes('image')) onCategorySelect('Imagens');
        else if (file.type.includes('video')) onCategorySelect('Vídeos');
        else if (file.type.includes('audio')) onCategorySelect('Áudio');
        else onCategorySelect('Documentos');
      }
    }
  };

  const handleImagesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      alert('Apenas arquivos de imagem são permitidos para anexos');
    }
    
    onImagesChange([...additionalImages, ...imageFiles]);
  };

  const handleRemoveMainFile = () => {
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = additionalImages.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileChange(files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload de arquivo principal */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Upload className="h-5 w-5" />
            Arquivo Principal
            {mainFile && <CheckCircle className="h-5 w-5 text-green-600" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!mainFile ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Clique ou arraste um arquivo
              </h3>
              <p className="text-gray-500">
                Todos os tipos de arquivo são aceitos • Tamanho ilimitado
              </p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-green-50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getFileTypeColor(mainFile)}`}>
                  {React.createElement(getFileIcon(mainFile), { className: "h-5 w-5" })}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{mainFile.name}</h4>
                  <p className="text-sm text-gray-500">{formatFileSize(mainFile.size)}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveMainFile}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload de imagens adicionais */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-purple-800">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Imagens Adicionais
            </div>
            <Badge className="bg-purple-100 text-purple-700">
              {additionalImages.length} imagem(ns)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Grid de imagens anexadas */}
          {additionalImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {additionalImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Botão de remover */}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  
                  {/* Informações da imagem */}
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {image.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(image.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botão para adicionar imagens */}
          <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center">
            <input
              ref={imagesInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagesSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => imagesInputRef.current?.click()}
              className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Imagens
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Selecione múltiplas imagens (JPG, PNG, GIF, etc.)
            </p>
          </div>

          {/* Informações sobre imagens */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h5 className="font-medium text-purple-800 mb-2">Sobre as imagens:</h5>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Use para anexar evidências, diagramas ou documentos complementares</li>
              <li>• Formatos aceitos: JPG, PNG, GIF, BMP, WEBP, SVG</li>
              <li>• Imagens são armazenadas separadamente do documento principal</li>
              <li>• Você pode selecionar múltiplas imagens de uma vez</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Resumo dos arquivos */}
      {(mainFile || additionalImages.length > 0) && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-800 mb-2">Resumo dos arquivos:</h4>
            <div className="space-y-1 text-sm text-green-700">
              {mainFile && (
                <p>• Arquivo principal: {mainFile.name} ({formatFileSize(mainFile.size)})</p>
              )}
              {additionalImages.length > 0 && (
                <p>• {additionalImages.length} imagem(ns) adicional(is)</p>
              )}
              <p className="font-medium">
                Total: {((mainFile?.size || 0) + additionalImages.reduce((sum, img) => sum + img.size, 0)) > 0 
                  ? formatFileSize((mainFile?.size || 0) + additionalImages.reduce((sum, img) => sum + img.size, 0))
                  : '0 Bytes'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};