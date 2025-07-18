/**
 * FileUploadService - Seguindo SRP (Single Responsibility Principle)
 * Responsabilidade única: Gerenciar upload de arquivos
 */

import { supabaseStorageService } from '../supabaseStorageService';

export interface IFileUploadService {
  uploadSingle(file: File, options: UploadOptions): Promise<UploadResult>;
  uploadMultiple(files: File[], options: UploadOptions): Promise<UploadResult[]>;
  uploadWithProgress(file: File, options: UploadOptions, onProgress?: (progress: number) => void): Promise<UploadResult>;
}

export interface UploadOptions {
  category: string;
  description: string;
  tags: string[];
}

export interface UploadResult {
  id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export class FileUploadService implements IFileUploadService {
  
  async uploadSingle(file: File, options: UploadOptions): Promise<UploadResult> {
    const results = await supabaseStorageService.uploadMultipleFiles([file], options);
    
    if (results.length === 0) {
      throw new Error('Falha no upload do arquivo');
    }
    
    return results[0];
  }

  async uploadMultiple(files: File[], options: UploadOptions): Promise<UploadResult[]> {
    return await supabaseStorageService.uploadMultipleFiles(files, options);
  }

  async uploadWithProgress(
    file: File, 
    options: UploadOptions, 
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    // Simular progresso em etapas
    if (onProgress) {
      onProgress(10); // Iniciando
      
      setTimeout(() => onProgress(25), 100); // Validando
      setTimeout(() => onProgress(50), 300); // Enviando
      setTimeout(() => onProgress(75), 500); // Processando
    }
    
    const result = await this.uploadSingle(file, options);
    
    if (onProgress) {
      onProgress(100); // Concluído
    }
    
    return result;
  }

  // Métodos de conveniência para tipos específicos
  async uploadDocument(file: File, metadata: any): Promise<UploadResult> {
    return this.uploadSingle(file, {
      category: 'documents',
      description: metadata.description || 'Documento',
      tags: metadata.tags || []
    });
  }

  async uploadImage(file: File, metadata: any): Promise<UploadResult> {
    return this.uploadSingle(file, {
      category: 'images',
      description: metadata.description || 'Imagem',
      tags: metadata.tags || []
    });
  }

  async uploadImages(files: File[], metadata: any): Promise<UploadResult[]> {
    return this.uploadMultiple(files, {
      category: 'images',
      description: metadata.description || 'Imagens adicionais',
      tags: metadata.tags || []
    });
  }

  // Validações antes do upload - seguindo SRP
  validateFile(file: File): { isValid: boolean; error?: string } {
    // Sem limite de tamanho conforme especificação
    if (!file || file.size === 0) {
      return { isValid: false, error: 'Arquivo inválido ou vazio' };
    }

    return { isValid: true };
  }

  getAutomaticCategory(file: File): string {
    const extension = file.name.toLowerCase().split('.').pop() || '';
    const type = file.type.toLowerCase();
    
    if (type.includes('pdf') || extension === 'pdf') return 'documents';
    if (type.includes('document') || type.includes('word') || ['doc', 'docx'].includes(extension)) return 'documents';
    if (type.includes('spreadsheet') || type.includes('excel') || ['xls', 'xlsx'].includes(extension)) return 'documents';
    if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) return 'images';
    if (type.includes('video') || ['mp4', 'avi', 'mov', 'mkv', 'wmv'].includes(extension)) return 'videos';
    if (type.includes('audio') || ['mp3', 'wav', 'ogg', 'aac'].includes(extension)) return 'audio';
    
    return 'documents';
  }
}

// Singleton instance
export const fileUploadService = new FileUploadService();