/**
 * EditDocumentFileManager - Seguindo SRP
 * Responsabilidade única: Gerenciar arquivo principal do documento
 */

import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, File, FileText, Image, Video, Music, Trash2 } from 'lucide-react';
import type { Document } from '@shared/schema';

export interface EditDocumentFileManagerProps {
  currentFile: Document;
  newFile: File | null;
  onFileSelect: (file: File | null) => void;
}

export const EditDocumentFileManager: React.FC<EditDocumentFileManagerProps> = ({
  currentFile,
  newFile,
  onFileSelect
}) => {
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileInfo = () => {
    if (newFile) {
      return {
        name: newFile.name,
        size: formatFileSize(newFile.size),
        type: newFile.type,
        isNew: true
      };
    }

    // Extrair informações do arquivo atual
    try {
      const content = currentFile.content ? JSON.parse(currentFile.content) : {};
      const fileInfo = content.fileInfo || {};
      
      return {
        name: fileInfo.originalName || currentFile.title || 'Arquivo atual',
        size: formatFileSize(fileInfo.fileSize || 0),
        type: fileInfo.mimeType || 'application/octet-stream',
        isNew: false
      };
    } catch {
      return {
        name: currentFile.title || 'Arquivo atual',
        size: 'Tamanho desconhecido',
        type: 'application/octet-stream',
        isNew: false
      };
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('image')) return Image;
    if (mimeType.includes('video')) return Video;
    if (mimeType.includes('audio')) return Music;
    if (mimeType.includes('document') || mimeType.includes('word')) return FileText;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileText;
    return File;
  };

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'bg-red-100 text-red-700';
    if (mimeType.includes('image')) return 'bg-purple-100 text-purple-700';
    if (mimeType.includes('video')) return 'bg-orange-100 text-orange-700';
    if (mimeType.includes('audio')) return 'bg-pink-100 text-pink-700';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'bg-blue-100 text-blue-700';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleRemoveNewFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileInfo = getFileInfo();
  const FileIcon = getFileIcon(fileInfo.type);
  const colorClass = getFileTypeColor(fileInfo.type);

  return (
    <Card className="border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-800">
          <Upload className="h-5 w-5" />
          Arquivo Principal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Arquivo atual ou novo */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorClass}`}>
              <FileIcon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{fileInfo.name}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{fileInfo.size}</span>
                {fileInfo.isNew && (
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    Novo arquivo
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {newFile && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveNewFile}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Botão para trocar arquivo */}
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="*/*"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {newFile ? 'Trocar Arquivo' : 'Substituir Arquivo Principal'}
          </Button>
        </div>

        {/* Informações sobre o upload */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h5 className="font-medium text-blue-800 mb-2">Informações importantes:</h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• O sistema aceita arquivos de qualquer tamanho</li>
            <li>• Tipos suportados: PDF, Word, Excel, PowerPoint, imagens, vídeos, áudio</li>
            {newFile && (
              <li>• Um novo hash de verificação será gerado automaticamente</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};