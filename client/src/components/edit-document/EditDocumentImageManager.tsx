/**
 * EditDocumentImageManager - Seguindo SRP
 * Responsabilidade única: Gerenciar imagens anexadas ao documento
 */

import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, Upload, Trash2, Eye, Plus } from 'lucide-react';
import type { Document } from '@shared/schema';

export interface EditDocumentImageManagerProps {
  document: Document;
  additionalImages: File[];
  onImagesChange: (images: File[]) => void;
  onDeleteImage: (imageId: string) => void;
  imagesToDelete: string[];
}

export const EditDocumentImageManager: React.FC<EditDocumentImageManagerProps> = ({
  document,
  additionalImages,
  onImagesChange,
  onDeleteImage,
  imagesToDelete
}) => {
  
  const imagesInputRef = useRef<HTMLInputElement>(null);

  // Extrair imagens existentes do documento
  const getExistingImages = () => {
    try {
      const content = document.content ? JSON.parse(document.content) : {};
      return content.additionalImages || [];
    } catch {
      return [];
    }
  };

  const existingImages = getExistingImages();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleImagesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      alert('Apenas arquivos de imagem são permitidos');
    }
    
    onImagesChange([...additionalImages, ...imageFiles]);
  };

  const handleRemoveNewImage = (index: number) => {
    const updatedImages = additionalImages.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  const handleDeleteExistingImage = (imageId: string) => {
    if (confirm('Tem certeza que deseja remover esta imagem?')) {
      onDeleteImage(imageId);
    }
  };

  const handleViewImage = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  const totalImages = existingImages.length + additionalImages.length;
  const activeExistingImages = existingImages.filter(
    (img: any) => !imagesToDelete.includes(img.supabaseId)
  );

  return (
    <Card className="border-pink-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-pink-800">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Imagens Anexadas
          </div>
          <Badge className="bg-pink-100 text-pink-700">
            {totalImages - imagesToDelete.length} imagem(ns)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Imagens existentes */}
        {activeExistingImages.length > 0 && (
          <div>
            <h5 className="font-medium text-gray-700 mb-3">Imagens atuais:</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {activeExistingImages.map((image: any, index: number) => (
                <div key={image.supabaseId} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                    <img
                      src={`/api/documents/photos/${image.fileName}`}
                      alt={image.originalName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center bg-gray-200">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Overlay com ações */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleViewImage(`/api/documents/photos/${image.fileName}`)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteExistingImage(image.supabaseId)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Informações da imagem */}
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {image.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(image.fileSize)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Novas imagens */}
        {additionalImages.length > 0 && (
          <div>
            <h5 className="font-medium text-gray-700 mb-3">Novas imagens:</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {additionalImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg border border-green-200 overflow-hidden">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Badge de nova imagem */}
                  <Badge className="absolute top-2 left-2 bg-green-100 text-green-700 text-xs">
                    Nova
                  </Badge>
                  
                  {/* Botão de remover */}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveNewImage(index)}
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
          </div>
        )}

        {/* Botão para adicionar imagens */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Imagens
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Clique para selecionar múltiplas imagens
          </p>
        </div>

        {/* Informações sobre imagens */}
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
          <h5 className="font-medium text-pink-800 mb-2">Sobre as imagens:</h5>
          <ul className="text-sm text-pink-700 space-y-1">
            <li>• Formatos aceitos: JPG, PNG, GIF, BMP, WEBP, SVG</li>
            <li>• Você pode selecionar múltiplas imagens de uma vez</li>
            <li>• Imagens são armazenadas separadamente do documento principal</li>
            <li>• Utilize para anexar evidências, diagramas ou documentos complementares</li>
          </ul>
        </div>

        {/* Resumo das alterações */}
        {(additionalImages.length > 0 || imagesToDelete.length > 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h5 className="font-medium text-yellow-800 mb-2">Alterações pendentes:</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              {additionalImages.length > 0 && (
                <li>• {additionalImages.length} nova(s) imagem(ns) será(ão) adicionada(s)</li>
              )}
              {imagesToDelete.length > 0 && (
                <li>• {imagesToDelete.length} imagem(ns) será(ão) removida(s)</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};