/**
 * DocumentFormWizard - Seguindo SRP
 * Responsabilidade única: Formulário de metadados com campos exatos das fotos
 */

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SelectWithAddDB } from '../SelectWithAddDB';
import { Calendar, Hash, Upload } from 'lucide-react';

export interface DocumentFormWizardProps {
  formData: any;
  onFormDataChange: (data: any) => void;
  isLoading: boolean;
}

export const DocumentFormWizard: React.FC<DocumentFormWizardProps> = ({
  formData,
  onFormDataChange,
  isLoading
}) => {
  const updateField = (field: string, value: any) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  const requiredFields = ['title', 'documentType', 'publicOrgan', 'responsible', 'mainSubject', 'description'];
  const isFieldRequired = (field: string) => requiredFields.includes(field);

  return (
    <div className="space-y-6">
      {/* Seção 1: Informações do Documento */}
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            📄 Informações do Documento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Proveniência
              </label>
              <Input
                value={formData.provenience || ''}
                onChange={(e) => updateField('provenience', e.target.value)}
                placeholder="Ex: Assembleia Legislativa, Gabinete..."
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de Documento {isFieldRequired('documentType') && <span className="text-red-500">*</span>}
              </label>
              <SelectWithAddDB
                value={formData.documentType || ''}
                onValueChange={(value) => updateField('documentType', value)}
                placeholder="Selecione o tipo de documento"
                apiEndpoint="/api/document-types"
                label="Tipo de Documento"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Título {isFieldRequired('title') && <span className="text-red-500">*</span>}
              </label>
              <Input
                value={formData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Digite o título completo do documento"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Órgão Público {isFieldRequired('publicOrgan') && <span className="text-red-500">*</span>}
              </label>
              <SelectWithAddDB
                value={formData.publicOrgan || ''}
                onValueChange={(value) => updateField('publicOrgan', value)}
                placeholder="Selecione o órgão público"
                apiEndpoint="/api/public-organs"
                label="Órgão Público"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Assunto Principal {isFieldRequired('mainSubject') && <span className="text-red-500">*</span>}
              </label>
              <SelectWithAddDB
                value={formData.mainSubject || ''}
                onValueChange={(value) => updateField('mainSubject', value)}
                placeholder="Selecione o assunto principal"
                apiEndpoint="/api/main-subjects"
                label="Assunto Principal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Responsável {isFieldRequired('responsible') && <span className="text-red-500">*</span>}
              </label>
              <Input
                value={formData.responsible || ''}
                onChange={(e) => updateField('responsible', e.target.value)}
                placeholder="Nome do responsável pelo documento"
                disabled={isLoading}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Descrição {isFieldRequired('description') && <span className="text-red-500">*</span>}
              </label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Descreva o conteúdo e contexto do documento"
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Nome do(s) Parlamentares e/ou principais autoridades nominadas
              </label>
              <Input
                value={formData.authorities || ''}
                onChange={(e) => updateField('authorities', e.target.value)}
                placeholder="Ex: Deputado João Silva, Senador Maria Santos..."
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 2: Informações Técnicas */}
      <Card className="border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center justify-between text-green-800">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informações Técnicas
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data da digitalização</label>
              <Input
                type="date"
                value={formData.digitalizationDate || ''}
                onChange={(e) => updateField('digitalizationDate', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Data de inserção no ATOM
                <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">Automático</Badge>
              </label>
              <Input
                value={formData.insertionDate || '04/08/2025'}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Identificador digital
                <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">Automático</Badge>
              </label>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-blue-600" />
                <Input
                  value="Será gerado automaticamente"
                  disabled
                  className="bg-gray-50 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Hash (checksum) da imagem
                <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">Automático</Badge>
              </label>
              <Input
                value="Será calculado automaticamente"
                disabled
                className="bg-gray-50 font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Palavras-chave</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={formData.keywords || ''}
                onChange={(e) => updateField('keywords', e.target.value)}
                placeholder="Digite palavras-chave separadas por vírgula (ex: administração, legislação, política)"
                className="flex-1"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (formData.keywords?.trim()) {
                      const keywords = formData.keywords
                        .split(',')
                        .map(k => k.trim())
                        .filter(k => k.length > 0);
                      updateField('keywords', keywords.join(', '));
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (formData.keywords?.trim()) {
                    const keywords = formData.keywords
                      .split(',')
                      .map(k => k.trim())
                      .filter(k => k.length > 0);
                    updateField('keywords', keywords.join(', '));
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={isLoading}
              >
                Adicionar
              </button>
            </div>

            {/* Exibir tags separadas */}
            {formData.keywords && formData.keywords.includes(',') && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.keywords
                  .split(',')
                  .map((keyword, index) => keyword.trim())
                  .filter(keyword => keyword.length > 0)
                  .map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => {
                          const keywords = formData.keywords
                            .split(',')
                            .map(k => k.trim())
                            .filter(k => k.length > 0 && k !== keyword);
                          updateField('keywords', keywords.join(', '));
                        }}
                        className="ml-1 text-blue-600 hover:text-blue-800 font-bold"
                        title="Remover palavra-chave"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-1">
              Digite as palavras-chave e clique em "Adicionar" ou pressione Enter para separá-las
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Anotações</label>
            <Textarea
              value={formData.annotations || ''}
              onChange={(e) => updateField('annotations', e.target.value)}
              placeholder="Digite suas anotações..."
              rows={4}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Validação em tempo real */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-700 mb-2">Campos obrigatórios:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {requiredFields.map(field => {
              const fieldValue = formData[field];
              const isCompleted = fieldValue && fieldValue.length > 0;
              const fieldLabels: Record<string, string> = {
                title: 'Título',
                documentType: 'Tipo de Documento',
                publicOrgan: 'Órgão Público',
                responsible: 'Responsável',
                mainSubject: 'Assunto Principal',
                description: 'Descrição'
              };

              return (
                <div key={field} className={`flex items-center gap-2 ${isCompleted ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-red-500'}`} />
                  {fieldLabels[field]}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};