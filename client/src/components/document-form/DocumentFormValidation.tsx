/**
 * DocumentFormValidation - Seguindo SRP
 * Responsabilidade única: Validação e confirmação final do formulário
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Image, 
  User, 
  Building, 
  Calendar,
  Hash,
  Shield,
  Tag,
  Upload
} from 'lucide-react';

export interface DocumentFormValidationProps {
  formData: any;
  mainFile: File | null;
  additionalImages: File[];
  onSubmit: () => void;
  isLoading: boolean;
}

export const DocumentFormValidation: React.FC<DocumentFormValidationProps> = ({
  formData,
  mainFile,
  additionalImages,
  onSubmit,
  isLoading
}) => {

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const requiredFields = [
    { key: 'title', label: 'Título' },
    { key: 'documentType', label: 'Tipo de Documento' },
    { key: 'publicOrgan', label: 'Órgão Público' },
    { key: 'responsible', label: 'Responsável' },
    { key: 'mainSubject', label: 'Assunto Principal' },
    { key: 'description', label: 'Descrição' }
  ];

  const missingFields = requiredFields.filter(field => !formData[field.key] || formData[field.key].trim() === '');
  const isFormValid = missingFields.length === 0 && mainFile;

  const totalSize = (mainFile?.size || 0) + additionalImages.reduce((sum, img) => sum + img.size, 0);

  return (
    <div className="space-y-6">
      {/* Status de validação */}
      <Card className={`border-2 ${isFormValid ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isFormValid ? 'text-green-800' : 'text-orange-800'}`}>
            {isFormValid ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            Status da Validação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isFormValid ? (
            <p className="text-green-700 font-medium">
              ✅ Todos os campos obrigatórios preenchidos e arquivo selecionado
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-orange-700 font-medium">
                ⚠️ Pendências encontradas:
              </p>
              <ul className="text-orange-600 space-y-1">
                {!mainFile && <li>• Arquivo principal não selecionado</li>}
                {missingFields.map(field => (
                  <li key={field.key}>• {field.label} não preenchido</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo dos arquivos */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Upload className="h-5 w-5" />
            Resumo dos Arquivos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Arquivo principal */}
          {mainFile ? (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <FileText className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">{mainFile.name}</h4>
                <p className="text-sm text-blue-600">{formatFileSize(mainFile.size)}</p>
              </div>
              <Badge className="bg-blue-100 text-blue-700">Principal</Badge>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-red-700">Nenhum arquivo principal selecionado</p>
            </div>
          )}

          {/* Imagens adicionais */}
          {additionalImages.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-gray-700 flex items-center gap-2">
                <Image className="h-4 w-4" />
                Imagens Adicionais ({additionalImages.length})
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {additionalImages.map((image, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded border border-purple-200">
                    <Image className="h-4 w-4 text-purple-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-purple-900 truncate">{image.name}</p>
                      <p className="text-xs text-purple-600">{formatFileSize(image.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tamanho total */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="font-medium text-gray-700">Tamanho Total:</span>
            <span className="font-bold text-gray-900">{formatFileSize(totalSize)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Resumo dos metadados */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <FileText className="h-5 w-5" />
            Resumo dos Metadados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Identificação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="font-medium text-blue-700 flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Identificação
              </h5>
              <div className="space-y-1 text-sm">
                <p><strong>Título:</strong> {formData.title || 'Não informado'}</p>
                <p><strong>Tipo:</strong> {formData.documentType || 'Não informado'}</p>
                <p><strong>ID Digital:</strong> {formData.digitalId || 'Será gerado'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-medium text-green-700 flex items-center gap-1">
                <Building className="h-4 w-4" />
                Origem
              </h5>
              <div className="space-y-1 text-sm">
                <p><strong>Órgão:</strong> {formData.publicOrgan || 'Não informado'}</p>
                <p><strong>Responsável:</strong> {formData.responsible || 'Não informado'}</p>
                <p><strong>Setor:</strong> {formData.responsibleSector || 'Não informado'}</p>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="space-y-2">
            <h5 className="font-medium text-yellow-700 flex items-center gap-1">
              <Hash className="h-4 w-4" />
              Conteúdo
            </h5>
            <div className="space-y-1 text-sm">
              <p><strong>Assunto:</strong> {formData.mainSubject || 'Não informado'}</p>
              <p><strong>Descrição:</strong> {formData.description || 'Não informada'}</p>
              {formData.confidentialityLevel && (
                <p className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <strong>Confidencialidade:</strong> {formData.confidentialityLevel}
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          {formData.tags && formData.tags.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-purple-700 flex items-center gap-1">
                <Tag className="h-4 w-4" />
                Palavras-chave
              </h5>
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag: string, index: number) => (
                  <Badge key={index} className="bg-purple-100 text-purple-700 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Técnico */}
          {formData.digitalizationDate && (
            <div className="space-y-2">
              <h5 className="font-medium text-orange-700 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Digitalização
              </h5>
              <div className="space-y-1 text-sm">
                <p><strong>Data:</strong> {new Date(formData.digitalizationDate).toLocaleDateString('pt-BR')}</p>
                {formData.digitalizationLocation && (
                  <p><strong>Local:</strong> {formData.digitalizationLocation}</p>
                )}
                {formData.digitalizationResponsible && (
                  <p><strong>Responsável:</strong> {formData.digitalizationResponsible}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmação final */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-bold text-green-800 mb-4">
            Pronto para Enviar!
          </h3>
          <p className="text-green-700 mb-6">
            Revise as informações acima e clique em "Finalizar" para enviar o documento.
            Após o envio, será gerado automaticamente um hash de verificação para garantir a integridade do arquivo.
          </p>
          
          <div className="flex justify-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(mainFile ? 1 : 0) + additionalImages.length}
              </div>
              <div className="text-sm text-green-700">Arquivo(s)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {requiredFields.length - missingFields.length}/{requiredFields.length}
              </div>
              <div className="text-sm text-blue-700">Campos obrigatórios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formData.tags?.length || 0}
              </div>
              <div className="text-sm text-purple-700">Tags</div>
            </div>
          </div>

          <Button
            onClick={onSubmit}
            disabled={!isFormValid || isLoading}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enviando...
              </div>
            ) : (
              'Finalizar Envio'
            )}
          </Button>

          {!isFormValid && (
            <p className="text-orange-600 text-sm mt-3">
              Complete todos os campos obrigatórios para continuar
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};