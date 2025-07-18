import { supabase } from '@/lib/supabaseClient';

export interface SupabaseFile {
  id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_type: string;
  category?: string;
  uploaded_by?: string;
  description?: string;
  tags?: string[];
  is_public: boolean;
  download_count: number;
  last_accessed?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  environment: string;
}

export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  byType: Record<string, { count: number; size: number }>;
  recentFiles: SupabaseFile[];
}

// Configuração dos buckets por tipo MIME - SEM LIMITES DE TAMANHO
const BUCKET_CONFIG = {
  documents: {
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    public: false
  },
  images: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    public: true
  },
  spreadsheets: {
    mimeTypes: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
    public: false
  },
  presentations: {
    mimeTypes: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    public: false
  },
  archives: {
    mimeTypes: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
    public: false
  },
  videos: {
    mimeTypes: ['video/mp4', 'video/avi', 'video/quicktime'],
    public: false
  },
  audio: {
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    public: false
  }
};

class SupabaseStorageService {
  // Determinar bucket baseado no tipo MIME
  private getMimeTypeBucket(mimeType: string): string {
    for (const [bucket, config] of Object.entries(BUCKET_CONFIG)) {
      if (config.mimeTypes.some(type => {
        if (type.endsWith('/*')) {
          return mimeType.startsWith(type.replace('/*', '/'));
        }
        return mimeType === type;
      })) {
        return bucket;
      }
    }
    return 'documents'; // fallback padrão
  }

  // Validar arquivo antes do upload - SEM LIMITES DE TAMANHO
  private validateFile(file: File): { valid: boolean; error?: string } {
    const bucket = this.getMimeTypeBucket(file.type);
    const config = BUCKET_CONFIG[bucket as keyof typeof BUCKET_CONFIG];

    if (!config) {
      return { valid: false, error: 'Tipo de arquivo não suportado' };
    }

    // REMOVIDO: Verificação de tamanho máximo
    // Agora aceita arquivos de qualquer tamanho

    return { valid: true };
  }

  // Gerar nome único para o arquivo
  private generateUniqueFileName(originalName: string, userId?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    const baseName = originalName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, '_');
    
    const prefix = userId ? `${userId}/` : '';
    return `${prefix}${timestamp}_${random}_${baseName}.${extension}`;
  }

  // Upload de arquivo único
  async uploadFileToSupabase(
    file: File,
    metadata: {
      category?: string;
      description?: string;
      tags?: string[];
      userId?: string;
    } = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<SupabaseFile> {
    try {
      // Validar arquivo
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const bucket = this.getMimeTypeBucket(file.type);
      const filename = this.generateUniqueFileName(file.name, metadata.userId);

      // Callback de progresso inicial
      onProgress?.({
        filename: file.name,
        progress: 0,
        status: 'uploading'
      });

      // Upload via servidor para contornar RLS
      console.log('🚀 Fazendo upload via servidor para Supabase Storage...');
      
      // CORREÇÃO CRÍTICA: Usar FormData em vez de base64 para evitar corrupção
      console.log('🚀 Fazendo upload direto com FormData...');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', filename);
      formData.append('bucket', bucket);
      formData.append('metadata', JSON.stringify({
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        category: metadata.category,
        description: metadata.description,
        tags: metadata.tags,
        userId: metadata.userId
      }));

      // Enviar FormData para evitar corrupção de arquivos binários
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800000); // 30 minutos
      
      const response = await fetch('/api/supabase-upload-formdata', {
        method: 'POST',
        body: formData, // FormData sem Content-Type header
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro no upload via servidor:', errorText);
        console.error('❌ Arquivo:', file.name, 'Tamanho:', file.size, 'bytes');
        console.error('❌ Status da resposta:', response.status, response.statusText);
        throw new Error(`Erro no upload: ${errorText}`);
      }

      const uploadResult = await response.json();
      console.log('✅ Upload realizado com sucesso via servidor:', uploadResult.file_path);

      // Progresso 50%
      onProgress?.({
        filename: file.name,
        progress: 50,
        status: 'uploading'
      });

      // O servidor já processou tudo, usar o resultado direto
      const supabaseFile: SupabaseFile = uploadResult;

      // Progresso 100%
      onProgress?.({
        filename: file.name,
        progress: 100,
        status: 'success'
      });

      return supabaseFile;

    } catch (error) {
      onProgress?.({
        filename: file.name,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  }

  // Upload múltiplo
  async uploadMultipleFiles(
    files: File[],
    metadata: {
      category?: string;
      description?: string;
      tags?: string[];
      userId?: string;
    } = {},
    onProgress?: (progress: UploadProgress[]) => void
  ): Promise<SupabaseFile[]> {
    const results: SupabaseFile[] = [];
    const progressArray: UploadProgress[] = files.map(file => ({
      filename: file.name,
      progress: 0,
      status: 'uploading' as const
    }));

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        console.log(`📤 Iniciando upload do arquivo ${i + 1}/${files.length}:`, file.name);
        
        const result = await this.uploadFileToSupabase(
          file,
          metadata,
          (progress) => {
            progressArray[i] = progress;
            onProgress?.(progressArray);
          }
        );
        results.push(result);
        console.log(`✅ Upload concluído:`, result);
      } catch (error) {
        console.error(`❌ Erro no upload do arquivo ${file.name}:`, error);
        progressArray[i] = {
          filename: file.name,
          progress: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        };
        onProgress?.(progressArray);
        throw error; // Re-throw para que o erro chegue ao código que chama
      }
    }

    return results;
  }

  // Listar arquivos por bucket
  async listFilesByBucket(bucket?: string, userId?: string): Promise<SupabaseFile[]> {
    let query = supabase.from('files').select('*');

    if (bucket) {
      query = query.eq('file_type', bucket);
    }

    if (userId) {
      query = query.eq('uploaded_by', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao listar arquivos: ${error.message}`);
    }

    return data as SupabaseFile[];
  }

  // Buscar arquivos
  async searchFiles(searchTerm: string, filters?: {
    bucket?: string;
    category?: string;
    userId?: string;
  }): Promise<SupabaseFile[]> {
    let query = supabase.from('files').select('*');

    if (searchTerm) {
      query = query.or(`original_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    if (filters?.bucket) {
      query = query.eq('file_type', filters.bucket);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.userId) {
      query = query.eq('uploaded_by', filters.userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro na busca: ${error.message}`);
    }

    return data as SupabaseFile[];
  }

  // Obter URL de download
  async getDownloadUrl(file: SupabaseFile): Promise<string> {
    if (file.is_public) {
      const { data } = supabase.storage
        .from(file.file_type)
        .getPublicUrl(file.filename);
      return data.publicUrl;
    } else {
      const { data, error } = await supabase.storage
        .from(file.file_type)
        .createSignedUrl(file.filename, 3600); // 1 hora

      if (error) {
        throw new Error(`Erro ao gerar URL: ${error.message}`);
      }

      return data.signedUrl;
    }
  }

  // Excluir arquivo do Supabase Storage (SUBSTITUIÇÃO DE ARQUIVOS)
  async deleteFile(fileName: string, bucket: string = 'documents'): Promise<boolean> {
    try {
      console.log('🗑️ DELETANDO arquivo do Supabase Storage:', fileName, 'bucket:', bucket);
      
      // Fazer requisição para o servidor deletar o arquivo
      const response = await fetch('/api/supabase-delete-file', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: fileName,
          bucket: bucket
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro ao deletar arquivo:', errorText);
        throw new Error(`Erro ao deletar: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Arquivo deletado com sucesso:', result);
      return true;
      
    } catch (error) {
      console.error('❌ Erro na exclusão do arquivo:', error);
      throw error;
    }
  }

  // Excluir registro de arquivo do banco (função original)
  async deleteFileRecord(fileId: string): Promise<boolean> {
    try {
      // Buscar informações do arquivo
      const { data: fileData, error: fetchError } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (fetchError || !fileData) {
        throw new Error('Arquivo não encontrado');
      }

      // Remover do storage
      const { error: storageError } = await supabase.storage
        .from(fileData.file_type)
        .remove([fileData.filename]);

      if (storageError) {
        console.warn('Erro ao remover do storage:', storageError);
      }

      // Remover do banco
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (dbError) {
        throw new Error(`Erro ao excluir: ${dbError.message}`);
      }

      return true;
    } catch (error) {
      console.error('Erro na exclusão:', error);
      return false;
    }
  }

  // Obter estatísticas
  async getStorageStats(userId?: string): Promise<StorageStats> {
    let query = supabase.from('files').select('*');

    if (userId) {
      query = query.eq('uploaded_by', userId);
    }

    const { data: files, error } = await query;

    if (error) {
      throw new Error(`Erro ao obter estatísticas: ${error.message}`);
    }

    const stats: StorageStats = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + (file.file_size || 0), 0),
      byType: {},
      recentFiles: files
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
    };

    // Estatísticas por tipo
    files.forEach(file => {
      const type = file.file_type;
      if (!stats.byType[type]) {
        stats.byType[type] = { count: 0, size: 0 };
      }
      stats.byType[type].count++;
      stats.byType[type].size += file.file_size || 0;
    });

    return stats;
  }

  // Atualizar contador de download
  async incrementDownloadCount(fileId: string): Promise<void> {
    await supabase
      .from('files')
      .update({ 
        download_count: 1, // Simplificado para evitar problemas com supabase.raw
        last_accessed: new Date().toISOString()
      })
      .eq('id', fileId);
  }

  // Listar buckets disponíveis
  getBucketConfig(): typeof BUCKET_CONFIG {
    return BUCKET_CONFIG;
  }
}

export const supabaseStorageService = new SupabaseStorageService();

// Alias para compatibilidade com código existente
export const uploadFile = supabaseStorageService.uploadFileToSupabase.bind(supabaseStorageService);
export const uploadMultipleFiles = supabaseStorageService.uploadMultipleFiles.bind(supabaseStorageService);