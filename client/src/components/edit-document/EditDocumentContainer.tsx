/**
 * EditDocumentContainer - Seguindo SRP
 * Responsabilidade única: Orquestrar edição de documentos
 * REFATORAÇÃO: SimpleEditDocumentModal.tsx (1063 linhas) dividido em módulos
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EditDocumentForm } from './EditDocumentForm';
import { EditDocumentFileManager } from './EditDocumentFileManager';
import { EditDocumentImageManager } from './EditDocumentImageManager';
import { useDocumentOperations } from '@/hooks/useDocumentOperations';
import { documentValidationService } from '@/services/document/DocumentValidationService';
import type { Document } from '@shared/schema';

export interface EditDocumentContainerProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const EditDocumentContainer: React.FC<EditDocumentContainerProps> = ({
  document,
  isOpen,
  onClose,
  onSubmit
}) => {
  
  const [formData, setFormData] = useState<any>({});
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { validateFormData } = useDocumentOperations();

  // Carregar dados do documento ao abrir
  useEffect(() => {
    if (isOpen && document) {
      loadDocumentData();
    }
  }, [isOpen, document]);

  const loadDocumentData = () => {
    try {
      const metadata = document.content ? JSON.parse(document.content) : {};
      
      setFormData({
        title: document.title || '',
        description: document.description || '',
        documentType: metadata.documentType || '',
        publicOrgan: metadata.publicOrgan || '',
        responsibleSector: metadata.responsibleSector || '',
        responsible: metadata.responsible || '',
        period: metadata.period || '',
        mainSubject: metadata.mainSubject || '',
        confidentialityLevel: metadata.confidentialityLevel || '',
        legalBasis: metadata.legalBasis || '',
        relatedProcess: metadata.relatedProcess || '',
        availability: metadata.availability || '',
        language: metadata.language || '',
        rights: metadata.rights || '',
        tags: metadata.tags || [],
        digitalizationDate: metadata.digitalizationDate || '',
        digitalizationLocation: metadata.digitalizationLocation || '',
        digitalId: metadata.digitalId || '',
        digitalizationResponsible: metadata.digitalizationResponsible || '',
        documentAuthority: metadata.documentAuthority || '',
        verificationHash: metadata.verificationHash || ''
      });
    } catch (error) {
      console.error('Erro ao carregar dados do documento:', error);
    }
  };

  const handleFormSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Validar dados do formulário
      const validation = validateFormData(formData);
      if (!validation.isValid) {
        alert(`Erros de validação:\n${validation.errors.join('\n')}`);
        return;
      }

      // Gerar novos campos automáticos se arquivo principal foi alterado
      let updatedFormData = { ...formData };
      if (mainFile) {
        updatedFormData.digitalId = documentValidationService.generateDigitalId();
        updatedFormData.verificationHash = await documentValidationService.calculateFileHash(mainFile);
      }

      // Criar dados para submission
      const submissionData = {
        ...updatedFormData,
        mainFile,
        additionalImages,
        imagesToDelete
      };

      await onSubmit(submissionData);
      onClose();
      
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      alert('Erro ao salvar documento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = (imageId: string) => {
    setImagesToDelete(prev => [...prev, imageId]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[98vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 text-white py-3 px-6 -m-6 mb-6 rounded-t-lg">
            Editar Documento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formulário principal */}
          <EditDocumentForm
            formData={formData}
            onFormDataChange={setFormData}
            isLoading={isLoading}
          />

          {/* Gerenciador de arquivo principal */}
          <EditDocumentFileManager
            currentFile={document}
            newFile={mainFile}
            onFileSelect={setMainFile}
          />

          {/* Gerenciador de imagens */}
          <EditDocumentImageManager
            document={document}
            additionalImages={additionalImages}
            onImagesChange={setAdditionalImages}
            onDeleteImage={handleDeleteImage}
            imagesToDelete={imagesToDelete}
          />

          {/* Botões de ação */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};