/**
 * DocumentFormContainer - Seguindo SRP
 * Responsabilidade única: Orquestrar formulário completo de documentos
 * REFATORAÇÃO: DocumentFormModal.tsx (824 linhas) dividido em módulos
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DocumentFormWizard } from './DocumentFormWizard';
import { DocumentFormFileUpload } from './DocumentFormFileUpload';
import { DocumentFormValidation } from './DocumentFormValidation';
import { useDocumentOperations } from '@/hooks/useDocumentOperations';
import { documentValidationService } from '@/services/document/DocumentValidationService';

export interface DocumentFormContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any, file: File, images?: File[]) => void;
  selectedFile?: File | null;
  onFileSelect?: (file: File | null) => void;
  selectedFileCategory?: string;
  onCategorySelect?: (category: string) => void;
}

export const DocumentFormContainer: React.FC<DocumentFormContainerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedFile,
  onFileSelect,
  selectedFileCategory,
  onCategorySelect
}) => {
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [mainFile, setMainFile] = useState<File | null>(selectedFile || null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { validateFormData } = useDocumentOperations();

  const handleFormDataChange = (data: any) => {
    setFormData(data);
  };

  const handleFileChange = (file: File | null) => {
    setMainFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleImagesChange = (images: File[]) => {
    setAdditionalImages(images);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Validar dados do formulário
      const validation = validateFormData(formData);
      if (!validation.isValid) {
        alert(`Erros de validação:\n${validation.errors.join('\n')}`);
        return;
      }

      if (!mainFile) {
        alert('Selecione um arquivo para upload!');
        return;
      }

      // Gerar campos automáticos
      const digitalId = documentValidationService.generateDigitalId();
      const verificationHash = await documentValidationService.calculateFileHash(mainFile);

      const finalData = {
        ...formData,
        digitalId,
        verificationHash
      };

      await onSubmit(finalData, mainFile, additionalImages);
      
      // Reset form
      setFormData({});
      setMainFile(null);
      setAdditionalImages([]);
      setCurrentStep(1);
      onClose();
      
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      alert('Erro ao enviar documento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[98vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-6 -m-6 mb-6 rounded-t-lg">
            Enviar Documentos - Etapa {currentStep} de 3
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Upload de arquivo */}
          {currentStep === 1 && (
            <DocumentFormFileUpload
              mainFile={mainFile}
              onFileChange={handleFileChange}
              additionalImages={additionalImages}
              onImagesChange={handleImagesChange}
              selectedFileCategory={selectedFileCategory}
              onCategorySelect={onCategorySelect}
            />
          )}

          {/* Step 2: Formulário de metadados */}
          {currentStep === 2 && (
            <DocumentFormWizard
              formData={formData}
              onFormDataChange={handleFormDataChange}
              isLoading={isLoading}
            />
          )}

          {/* Step 3: Validação e confirmação */}
          {currentStep === 3 && (
            <DocumentFormValidation
              formData={formData}
              mainFile={mainFile}
              additionalImages={additionalImages}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          )}

          {/* Navegação entre steps */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1 || isLoading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>

            <div className="flex gap-2">
              {[1, 2, 3].map(step => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full ${
                    step === currentStep 
                      ? 'bg-blue-600' 
                      : step < currentStep 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={isLoading || (currentStep === 1 && !mainFile)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
              >
                Próximo
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50"
              >
                {isLoading ? 'Enviando...' : 'Finalizar'}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};