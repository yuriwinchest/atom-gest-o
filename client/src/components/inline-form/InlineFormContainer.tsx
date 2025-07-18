/**
 * InlineFormContainer - Seguindo SRP
 * Responsabilidade única: Orquestrar formulário inline de documentos
 * REFATORAÇÃO: DocumentFormInline.tsx (706 linhas) dividido em módulos
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InlineFormSections } from './InlineFormSections';
import { InlineFormFileUpload } from './InlineFormFileUpload';
import { useDocumentOperations } from '@/hooks/useDocumentOperations';
import { documentValidationService } from '@/services/document/DocumentValidationService';
import { Upload, Send, AlertTriangle } from 'lucide-react';

export interface InlineFormContainerProps {
  onSubmit: (data: any, file: File, images?: File[]) => void;
  onCancel?: () => void;
  className?: string;
}

export const InlineFormContainer: React.FC<InlineFormContainerProps> = ({
  onSubmit,
  onCancel,
  className
}) => {
  
  const [formData, setFormData] = useState<any>({});
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const { validateFormData } = useDocumentOperations();

  // Gerar ID digital automático
  useEffect(() => {
    const digitalId = documentValidationService.generateDigitalId();
    setFormData(prev => ({
      ...prev,
      digitalId,
      digitalizationDate: new Date().toISOString().split('T')[0]
    }));
  }, []);

  const handleFormDataChange = (data: any) => {
    setFormData(data);
    setErrors([]); // Limpar erros ao alterar dados
  };

  const handleFileChange = (file: File | null) => {
    setMainFile(file);
  };

  const handleImagesChange = (images: File[]) => {
    setAdditionalImages(images);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrors([]);
    
    try {
      // Validar dados do formulário
      const validation = validateFormData(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      if (!mainFile) {
        setErrors(['Selecione um arquivo para upload!']);
        return;
      }

      // Gerar hash de verificação
      const verificationHash = await documentValidationService.calculateFileHash(mainFile);

      const finalData = {
        ...formData,
        verificationHash
      };

      await onSubmit(finalData, mainFile, additionalImages);
      
      // Reset form após sucesso
      setFormData({
        digitalId: documentValidationService.generateDigitalId(),
        digitalizationDate: new Date().toISOString().split('T')[0]
      });
      setMainFile(null);
      setAdditionalImages([]);
      
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      setErrors(['Erro ao enviar documento. Tente novamente.']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      digitalId: documentValidationService.generateDigitalId(),
      digitalizationDate: new Date().toISOString().split('T')[0]
    });
    setMainFile(null);
    setAdditionalImages([]);
    setErrors([]);
    if (onCancel) {
      onCancel();
    }
  };

  const requiredFields = ['title', 'documentType', 'publicOrgan', 'responsible', 'mainSubject', 'description'];
  const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
  const isFormValid = missingFields.length === 0 && mainFile;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Formulário de Cadastro de Documento
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Erros de validação */}
        {errors.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 mb-2">Erros encontrados:</h4>
                  <ul className="text-red-700 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload de arquivo */}
        <InlineFormFileUpload
          mainFile={mainFile}
          onFileChange={handleFileChange}
          additionalImages={additionalImages}
          onImagesChange={handleImagesChange}
        />

        {/* Formulário de metadados */}
        <InlineFormSections
          formData={formData}
          onFormDataChange={handleFormDataChange}
          isLoading={isLoading}
        />

        {/* Status de validação */}
        <Card className={`border-2 ${isFormValid ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${isFormValid ? 'text-green-800' : 'text-orange-800'}`}>
                  Status: {isFormValid ? 'Pronto para enviar' : 'Pendências encontradas'}
                </h4>
                <p className={`text-sm ${isFormValid ? 'text-green-600' : 'text-orange-600'}`}>
                  {isFormValid 
                    ? `Todos os campos obrigatórios preenchidos (${requiredFields.length - missingFields.length}/${requiredFields.length})`
                    : `Faltam ${missingFields.length} campo(s) obrigatório(s) e ${mainFile ? '' : 'arquivo principal'}`
                  }
                </p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isFormValid ? 'bg-green-200 text-green-700' : 'bg-orange-200 text-orange-700'
              }`}>
                {isFormValid ? '✓' : '!'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de ação */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>

          <div className="flex gap-3">
            <div className="text-right text-sm text-gray-600">
              <p>Arquivo: {mainFile ? '✓' : '✗'} | Campos: {requiredFields.length - missingFields.length}/{requiredFields.length}</p>
              <p>Imagens: {additionalImages.length}</p>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isLoading}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Enviar Documento
                </div>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};