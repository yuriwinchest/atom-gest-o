/**
 * InlineFormFileUpload - Seguindo SRP
 * Responsabilidade única: Upload de arquivos no formulário inline
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

export interface InlineFormFileUploadProps {
  mainFile: File | null;
  onFileChange: (file: File | null) => void;
  additionalImages: File[];
  onImagesChange: (images: File[]) => void;
}

export const InlineFormFileUpload: React.FC<InlineFormFileUploadProps> = ({
  mainFile,
  onFileChange,
  additionalImages,
  onImagesChange
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Upload de arquivo principal */}
      <Card className="border-blue-200">
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 text-blue-800 text-base">
            <Upload className="h-4 w-4" />
            Arquivo Principal
            {mainFile && <CheckCircle className="h-4 w-4 text-green-600" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {!mainFile ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Clique ou arraste um arquivo
              </p>
              <p className="text-xs text-gray-500">
                Todos os tipos • Tamanho ilimitado
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
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-green-50">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${getFileTypeColor(mainFile)}`}>
                  {React.createElement(getFileIcon(mainFile), { className: "h-4 w-4" })}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                    {mainFile.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(mainFile.size)}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveMainFile}
                className="text-red-600 hover:text-red-700 h-7 w-7 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload de imagens adicionais */}
      <Card className="border-purple-200">
        <CardHeader className="py-3">
          <CardTitle className="flex items-center justify-between text-purple-800 text-base">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Imagens
            </div>
            <Badge className="bg-purple-100 text-purple-700 text-xs">
              {additionalImages.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {/* Grid de imagens anexadas */}
          {additionalImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {additionalImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded border border-gray-200 overflow-hidden">
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
                    className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-2 w-2" />
                  </Button>
                  
                  {/* Nome da imagem */}
                  <p className="text-xs font-medium text-gray-700 truncate mt-1">
                    {image.name}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Botão para adicionar imagens */}
          <div className="border-2 border-dashed border-purple-300 rounded-lg p-3 text-center">
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
              className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 h-8 text-sm"
            >
              <Plus className="h-3 w-3 mr-2" />
              Adicionar Imagens
            </Button>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, GIF, etc.
            </p>
          </div>

          {/* Informações sobre imagens */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
            <ul className="text-xs text-purple-700 space-y-0.5">
              <li>• Para evidências e documentos complementares</li>
              <li>• Formatos aceitos: JPG, PNG, GIF, BMP, WEBP, SVG</li>
              <li>• Você pode selecionar múltiplas imagens</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Resumo dos arquivos */}
      {(mainFile || additionalImages.length > 0) && (
        <div className="lg:col-span-2">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-green-700">
                  <span className="font-medium">Resumo:</span>
                  {mainFile && ` 1 arquivo principal`}
                  {additionalImages.length > 0 && ` • ${additionalImages.length} imagem(ns)`}
                </div>
                <div className="text-xs text-green-600 font-medium">
                  Total: {formatFileSize(
                    (mainFile?.size || 0) + additionalImages.reduce((sum, img) => sum + img.size, 0)
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};