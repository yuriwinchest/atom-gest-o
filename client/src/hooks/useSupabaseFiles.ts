import { useState, useEffect, useCallback } from 'react';
import { supabaseStorageService, type SupabaseFile, type StorageStats, type UploadProgress } from '@/services/supabaseStorageService';

interface UseSupabaseFilesOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  userId?: string;
  bucket?: string;
  category?: string;
}

interface UseSupabaseFilesReturn {
  // Estado dos arquivos
  files: SupabaseFile[];
  filteredFiles: SupabaseFile[];
  stats: StorageStats | null;
  
  // Estados de controle
  loading: boolean;
  error: string | null;
  uploading: boolean;
  uploadProgress: UploadProgress[];
  
  // Filtros e busca
  searchTerm: string;
  selectedBucket: string;
  selectedCategory: string;
  
  // Ações
  setSearchTerm: (term: string) => void;
  setSelectedBucket: (bucket: string) => void;
  setSelectedCategory: (category: string) => void;
  refreshFiles: () => Promise<void>;
  uploadFiles: (files: File[], metadata?: {
    category?: string;
    description?: string;
    tags?: string[];
  }) => Promise<SupabaseFile[]>;
  deleteFile: (fileId: string) => Promise<boolean>;
  downloadFile: (file: SupabaseFile) => Promise<void>;
  clearError: () => void;
}

export function useSupabaseFiles(options: UseSupabaseFilesOptions = {}): UseSupabaseFilesReturn {
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    userId,
    bucket: initialBucket = '',
    category: initialCategory = ''
  } = options;

  // Estados principais
  const [files, setFiles] = useState<SupabaseFile[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBucket, setSelectedBucket] = useState(initialBucket);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Carregar arquivos
  const refreshFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [filesData, statsData] = await Promise.all([
        supabaseStorageService.listFilesByBucket(selectedBucket || undefined, userId),
        supabaseStorageService.getStorageStats(userId)
      ]);
      
      setFiles(filesData);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar arquivos';
      setError(errorMessage);
      console.error('Erro ao carregar arquivos:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBucket, userId]);

  // Filtrar arquivos baseado na busca e filtros
  const filteredFiles = useState(() => {
    let result = files;

    // Filtro por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(file => 
        file.original_name.toLowerCase().includes(term) ||
        (file.description && file.description.toLowerCase().includes(term)) ||
        (file.tags && file.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    // Filtro por bucket
    if (selectedBucket) {
      result = result.filter(file => file.file_type === selectedBucket);
    }

    // Filtro por categoria
    if (selectedCategory) {
      result = result.filter(file => file.category === selectedCategory);
    }

    return result;
  })[0];

  // Upload de arquivos
  const uploadFiles = useCallback(async (
    filesToUpload: File[], 
    metadata: {
      category?: string;
      description?: string;
      tags?: string[];
    } = {}
  ): Promise<SupabaseFile[]> => {
    setUploading(true);
    setError(null);
    setUploadProgress([]);

    try {
      const uploadMetadata = {
        ...metadata,
        userId
      };

      const results = await supabaseStorageService.uploadMultipleFiles(
        filesToUpload,
        uploadMetadata,
        (progress) => setUploadProgress(progress)
      );

      // Atualizar lista de arquivos após upload
      await refreshFiles();
      
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no upload';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress([]);
    }
  }, [userId, refreshFiles]);

  // Excluir arquivo
  const deleteFile = useCallback(async (fileId: string): Promise<boolean> => {
    setError(null);
    
    try {
      const success = await supabaseStorageService.deleteFile(fileId);
      
      if (success) {
        // Atualizar lista após exclusão
        await refreshFiles();
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir arquivo';
      setError(errorMessage);
      return false;
    }
  }, [refreshFiles]);

  // Download de arquivo
  const downloadFile = useCallback(async (file: SupabaseFile): Promise<void> => {
    setError(null);
    
    try {
      // Incrementar contador de download
      await supabaseStorageService.incrementDownloadCount(file.id);
      
      // Obter URL de download
      const downloadUrl = await supabaseStorageService.getDownloadUrl(file);
      
      // Criar link temporário para download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.original_name;
      link.target = '_blank';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Atualizar estatísticas após download
      await refreshFiles();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao baixar arquivo';
      setError(errorMessage);
    }
  }, [refreshFiles]);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(refreshFiles, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshFiles]);

  // Carregar arquivos na montagem do componente
  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  // Recalcular arquivos filtrados quando mudam os filtros
  useEffect(() => {
    // Este efeito força uma nova filtragem quando mudam os critérios
  }, [files, searchTerm, selectedBucket, selectedCategory]);

  return {
    // Estado dos arquivos
    files,
    filteredFiles,
    stats,
    
    // Estados de controle
    loading,
    error,
    uploading,
    uploadProgress,
    
    // Filtros e busca
    searchTerm,
    selectedBucket,
    selectedCategory,
    
    // Ações
    setSearchTerm,
    setSelectedBucket,
    setSelectedCategory,
    refreshFiles,
    uploadFiles,
    deleteFile,
    downloadFile,
    clearError
  };
}