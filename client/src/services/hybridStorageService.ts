import { backblazeStorageService, type BackblazeFile } from './backblazeStorageService.js';
import { supabase } from '../lib/supabaseClient';

export interface HybridFile {
  id: string;
  filename: string;
  file_path: string;
  url: string;
  file_size: number;
  mime_type: string;
  upload_timestamp: string;
  storage_type: 'backblaze' | 'supabase';
  backblaze_data?: BackblazeFile;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  backblazeFiles: number;
  supabaseFiles: number;
  lastSync: string;
}

class HybridStorageService {
  private isBackblazeAvailable: boolean = true;
  private backblazeFailures: number = 0;
  private readonly MAX_BACKBLAZE_FAILURES = 3;

  /**
   * Faz upload de um arquivo com fallback automático
   */
  async uploadFile(file: File, metadata?: { category?: string; description?: string; tags?: string[] }): Promise<HybridFile> {
    // Tentar Backblaze primeiro
    if (this.isBackblazeAvailable) {
      try {
        console.log('📤 Tentando upload via Backblaze B2...');
        const backblazeFile = await backblazeStorageService.uploadFile(file, metadata);

        const hybridFile: HybridFile = {
          id: backblazeFile.id,
          filename: backblazeFile.filename,
          file_path: backblazeFile.file_path,
          url: backblazeFile.backblaze_url,
          file_size: backblazeFile.file_size,
          mime_type: backblazeFile.mime_type,
          upload_timestamp: backblazeFile.upload_timestamp,
          storage_type: 'backblaze',
          backblaze_data: backblazeFile
        };

        console.log('✅ Upload via Backblaze B2 realizado com sucesso');
        this.backblazeFailures = 0; // Reset contador de falhas
        return hybridFile;

      } catch (error) {
        console.warn('⚠️ Falha no Backblaze B2:', error instanceof Error ? error.message : 'Erro desconhecido');
        this.backblazeFailures++;

        if (this.backblazeFailures >= this.MAX_BACKBLAZE_FAILURES) {
          console.log('🔄 Muitas falhas no Backblaze, desabilitando temporariamente');
          this.isBackblazeAvailable = false;
        }
      }
    }

    // Fallback para Supabase
    console.log('📤 Fazendo upload via Supabase (fallback)...');
    try {
      const supabaseFile = await this.uploadToSupabase(file, metadata);

      const hybridFile: HybridFile = {
        id: supabaseFile.id,
        filename: supabaseFile.filename,
        file_path: supabaseFile.file_path,
        url: supabaseFile.url,
        file_size: supabaseFile.file_size,
        mime_type: supabaseFile.mime_type,
        upload_timestamp: supabaseFile.upload_timestamp,
        storage_type: 'supabase'
      };

      console.log('✅ Upload via Supabase realizado com sucesso (fallback)');
      return hybridFile;

    } catch (error) {
      console.error('❌ Falha em ambos os serviços de storage:', error);
      throw new Error(`Falha no upload: Backblaze e Supabase indisponíveis - ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Upload para Supabase como fallback
   */
  private async uploadToSupabase(file: File, metadata?: { category?: string; description?: string; tags?: string[] }): Promise<any> {
    try {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const fileName = `${timestamp}_${randomId}_${file.name}`;

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Erro no upload Supabase: ${uploadError.message}`);
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Salvar metadados no banco
      const fileRecord = {
        name: file.name,
        description: metadata?.description || undefined,
        file_type: 'document',
        file_path: uploadData.path,
        tags: metadata?.tags || undefined,
        environment: 'production',
        metadata: {
          category: metadata?.category,
          author: metadata?.description,
          content: null,
          extractedText: null,
          physical_url: urlData.publicUrl,
          storage_type: 'supabase'
        }
      };

      const { data: fileData, error: dbError } = await supabase
        .from('files')
        .insert(fileRecord)
        .select()
        .single();

      if (dbError) {
        throw new Error(`Erro ao salvar metadados: ${dbError.message}`);
      }

      return {
        id: fileData.id,
        filename: file.name,
        file_path: `documents/${fileName}`,
        url: urlData.publicUrl,
        file_size: file.size,
        mime_type: file.type,
        upload_timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Erro no upload Supabase:', error);
      throw error;
    }
  }

  /**
   * Upload de múltiplos arquivos
   */
  async uploadMultipleFiles(files: File[], metadata?: { category?: string; description?: string; tags?: string[] }): Promise<HybridFile[]> {
    console.log(`📤 Iniciando upload de ${files.length} arquivos via serviço híbrido...`);

    const results: HybridFile[] = [];
    const errors: Error[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file, metadata);
        results.push(result);
        console.log(`✅ ${file.name} - Upload concluído via ${result.storage_type}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error(`❌ ${file.name} - Falha no upload:`, errorMsg);
        errors.push(error instanceof Error ? error : new Error(errorMsg));
      }
    }

    if (errors.length > 0) {
      console.warn(`⚠️ ${errors.length} arquivos falharam no upload`);
      throw new Error(`Falha no upload de ${errors.length} arquivos: ${errors.map(e => e.message).join(', ')}`);
    }

    console.log(`🎉 Upload de ${results.length} arquivos concluído com sucesso`);
    return results;
  }

  /**
   * Obtém URL de download
   */
  async getDownloadUrl(file: HybridFile): Promise<string> {
    return file.url;
  }

  /**
   * Deleta arquivo
   */
  async deleteFile(file: HybridFile): Promise<boolean> {
    try {
      if (file.storage_type === 'backblaze' && file.backblaze_data) {
        return await backblazeStorageService.deleteFile(file.backblaze_data.id);
      } else if (file.storage_type === 'supabase') {
        // Extrair nome do arquivo do path
        const fileName = file.file_path.split('/').pop();
        if (fileName) {
          const { error } = await supabase.storage
            .from('documents')
            .remove([fileName]);

          if (!error) {
            // Deletar registro do banco
            await supabase
              .from('files')
              .delete()
              .eq('id', file.id);

            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao deletar arquivo:', error);
      return false;
    }
  }

  /**
   * Obtém estatísticas do storage
   */
  async getStorageStats(): Promise<StorageStats> {
    try {
      // Contar arquivos no Supabase
      const { count: supabaseCount } = await supabase
        .from('files')
        .select('*', { count: 'exact', head: true })
        .eq('metadata->storage_type', 'supabase');

      // Contar arquivos no Backblaze (se disponível)
      let backblazeCount = 0;
      if (this.isBackblazeAvailable) {
        try {
          const { count } = await supabase
            .from('files')
            .select('*', { count: 'exact', head: true })
            .eq('metadata->storage_type', 'backblaze');
          backblazeCount = count || 0;
        } catch (error) {
          console.warn('Não foi possível contar arquivos do Backblaze');
        }
      }

      return {
        totalFiles: (supabaseCount || 0) + backblazeCount,
        totalSize: 0, // Implementar cálculo de tamanho se necessário
        backblazeFiles: backblazeCount,
        supabaseFiles: supabaseCount || 0,
        lastSync: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        backblazeFiles: 0,
        supabaseFiles: 0,
        lastSync: new Date().toISOString()
      };
    }
  }

  /**
   * Testa a conectividade dos serviços
   */
  async testConnectivity(): Promise<{ backblaze: boolean; supabase: boolean }> {
    const results = { backblaze: false, supabase: false };

    // Testar Backblaze
    try {
      await backblazeStorageService.testConnection();
      results.backblaze = true;
      console.log('✅ Backblaze: Conectividade OK');
    } catch (error) {
      console.log('❌ Backblaze: Falha na conectividade');
      this.isBackblazeAvailable = false;
    }

    // Testar Supabase
    try {
      const { data, error } = await supabase
        .from('files')
        .select('count', { count: 'exact', head: true });

      if (!error) {
        results.supabase = true;
        console.log('✅ Supabase: Conectividade OK');
      } else {
        console.log('❌ Supabase: Falha na conectividade');
      }
    } catch (error) {
      console.log('❌ Supabase: Falha na conectividade');
    }

    return results;
  }

  /**
   * Reabilita o Backblaze após falhas
   */
  async reenableBackblaze(): Promise<void> {
    try {
      await backblazeStorageService.testConnection();
      this.isBackblazeAvailable = true;
      this.backblazeFailures = 0;
      console.log('✅ Backblaze reabilitado com sucesso');
    } catch (error) {
      console.log('❌ Backblaze ainda indisponível');
    }
  }
}

export const hybridStorageService = new HybridStorageService();
