/**
 * useDocumentOperations - Hook especializado seguindo SRP
 * Responsabilidade única: Operações de documentos com estado
 */

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { documentService } from '@/services/document/DocumentService';
import { documentValidationService } from '@/services/document/DocumentValidationService';
import { fileUploadService } from '@/services/storage/FileUploadService';
import { notificationService } from '@/services/ui/NotificationService';
import { useToast } from './use-toast';

export interface DocumentOperationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  invalidateQueries?: boolean;
}

export const useDocumentOperations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Configurar serviço de notificação
  useState(() => {
    notificationService.setToastFunction(toast);
  });

  // Estados para operações
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<string>('');

  const invalidateDocumentQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/documents-with-related'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/documents/category-counts'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] })
    ]);
  };

  const createDocument = async (
    formData: any, 
    mainFile: File, 
    attachedImages?: File[], 
    options?: DocumentOperationOptions
  ) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadStage('Validando dados...');

      // 1. Validação
      const validation = documentValidationService.validateFormData(formData);
      if (!validation.isValid) {
        notificationService.validationError(validation.errors);
        return;
      }

      // 2. Gerar campos automáticos
      const digitalId = documentValidationService.generateDigitalId();
      const fileHash = await documentValidationService.calculateFileHash(mainFile);

      setUploadStage('Enviando arquivo principal...');
      setUploadProgress(25);

      // 3. Upload do arquivo principal
      const uploadedFile = await fileUploadService.uploadDocument(mainFile, formData);

      setUploadProgress(50);

      // 4. Upload das imagens adicionais
      let imagesUploadResults = [];
      if (attachedImages && attachedImages.length > 0) {
        setUploadStage(`Enviando ${attachedImages.length} imagem(ns)...`);
        imagesUploadResults = await fileUploadService.uploadImages(attachedImages, formData);
      }

      setUploadStage('Salvando no banco de dados...');
      setUploadProgress(75);

      // 5. Criar documento no banco
      const documentData = {
        title: formData.title,
        description: formData.description,
        content: JSON.stringify({
          ...formData,
          digitalId,
          verificationHash: fileHash,
          fileInfo: {
            originalName: uploadedFile.original_name,
            fileName: uploadedFile.filename,
            filePath: uploadedFile.file_path,
            mimeType: uploadedFile.mime_type,
            fileSize: uploadedFile.file_size,
            supabaseId: uploadedFile.id
          },
          ...(imagesUploadResults.length > 0 && {
            additionalImages: imagesUploadResults.map(img => ({
              originalName: img.original_name,
              fileName: img.filename,
              fileSize: img.file_size,
              mimeType: img.mime_type,
              uploadPath: img.file_path,
              supabaseId: img.id
            }))
          })
        }),
        category: fileUploadService.getAutomaticCategory(mainFile),
        tags: formData.tags || [],
        authorId: 1
      };

      const createdDocument = await documentService.create(documentData);

      setUploadProgress(100);

      // 6. Invalidar queries e notificar sucesso
      if (options?.invalidateQueries !== false) {
        await invalidateDocumentQueries();
      }

      notificationService.documentSaved(formData.title, imagesUploadResults.length);
      
      options?.onSuccess?.();

      return createdDocument;

    } catch (error) {
      console.error('Erro ao criar documento:', error);
      notificationService.showError('Erro', 'Erro ao criar documento. Tente novamente.');
      options?.onError?.(error as Error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStage('');
    }
  };

  const updateDocument = async (id: number, data: any, options?: DocumentOperationOptions) => {
    try {
      const updatedDocument = await documentService.update(id, data);
      
      if (options?.invalidateQueries !== false) {
        await invalidateDocumentQueries();
      }

      notificationService.showSuccess('Sucesso', 'Documento atualizado com sucesso.');
      options?.onSuccess?.();

      return updatedDocument;
    } catch (error) {
      console.error('Erro ao atualizar documento:', error);
      notificationService.showError('Erro', 'Erro ao atualizar documento.');
      options?.onError?.(error as Error);
    }
  };

  const deleteDocument = async (id: number, title: string, options?: DocumentOperationOptions) => {
    try {
      await documentService.delete(id);
      
      if (options?.invalidateQueries !== false) {
        await invalidateDocumentQueries();
      }

      notificationService.documentDeleted(title);
      options?.onSuccess?.();

    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      notificationService.showError('Erro', 'Erro ao deletar documento.');
      options?.onError?.(error as Error);
    }
  };

  return {
    // Actions
    createDocument,
    updateDocument,
    deleteDocument,
    invalidateDocumentQueries,
    
    // States
    isUploading,
    uploadProgress,
    uploadStage,
    
    // Utils
    validateFormData: documentValidationService.validateFormData.bind(documentValidationService),
    generateDigitalId: documentValidationService.generateDigitalId.bind(documentValidationService)
  };
};