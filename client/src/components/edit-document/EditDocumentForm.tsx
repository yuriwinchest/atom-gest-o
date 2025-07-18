/**
 * EditDocumentForm - Seguindo SRP
 * Responsabilidade única: Formulário de edição de metadados
 */

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AdvancedSelectWithAdd } from '@/components/AdvancedSelectWithAdd';
import { SelectWithAdd } from '@/components/SelectWithAdd';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface EditDocumentFormProps {
  formData: any;
  onFormDataChange: (data: any) => void;
  isLoading: boolean;
}

export const EditDocumentForm: React.FC<EditDocumentFormProps> = ({
  formData,
  onFormDataChange,
  isLoading
}) => {

  const [openSections, setOpenSections] = useState({
    identification: true,
    origin: true,
    classification: true,
    complementary: false,
    technical: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const updateField = (field: string, value: any) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags?.includes(tag)) {
      updateField('tags', [...(formData.tags || []), tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField('tags', formData.tags?.filter((tag: string) => tag !== tagToRemove) || []);
  };

  const handleTagsInput = (value: string) => {
    if (value.includes(',')) {
      const newTags = value.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag && !formData.tags?.includes(tag));
      
      updateField('tags', [...(formData.tags || []), ...newTags]);
      return '';
    }
    return value;
  };

  return (
    <div className="space-y-6">
      {/* Seção 1: Identificação do Documento */}
      <Card className="border-blue-200">
        <Collapsible 
          open={openSections.identification} 
          onOpenChange={() => toggleSection('identification')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-blue-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-blue-800">
                <span className="flex items-center gap-2">
                  📋 Identificação do Documento
                </span>
                {openSections.identification ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Digite o título do documento"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tipo de Documento <span className="text-red-500">*</span>
                  </label>
                  <AdvancedSelectWithAdd
                    value={formData.documentType || ''}
                    onValueChange={(value) => updateField('documentType', value)}
                    placeholder="Selecione o tipo"
                    apiEndpoint="/api/document-types"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Identificação Digital
                    <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">Automático</Badge>
                  </label>
                  <Input
                    value={formData.digitalId || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Seção 2: Origem e Responsabilidade */}
      <Card className="border-green-200">
        <Collapsible 
          open={openSections.origin} 
          onOpenChange={() => toggleSection('origin')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-green-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-green-800">
                <span className="flex items-center gap-2">
                  🏛️ Origem e Responsabilidade
                </span>
                {openSections.origin ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Órgão Público <span className="text-red-500">*</span>
                  </label>
                  <AdvancedSelectWithAdd
                    value={formData.publicOrgan || ''}
                    onValueChange={(value) => updateField('publicOrgan', value)}
                    placeholder="Selecione o órgão"
                    apiEndpoint="/api/public-organs"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Setor Responsável</label>
                  <AdvancedSelectWithAdd
                    value={formData.responsibleSector || ''}
                    onValueChange={(value) => updateField('responsibleSector', value)}
                    placeholder="Selecione o setor"
                    apiEndpoint="/api/responsible-sectors"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Responsável <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.responsible || ''}
                    onChange={(e) => updateField('responsible', e.target.value)}
                    placeholder="Nome do responsável"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Período</label>
                  <Input
                    value={formData.period || ''}
                    onChange={(e) => updateField('period', e.target.value)}
                    placeholder="Ex: 2024, Janeiro/2024"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Seção 3: Conteúdo e Classificação */}
      <Card className="border-yellow-200">
        <Collapsible 
          open={openSections.classification} 
          onOpenChange={() => toggleSection('classification')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-yellow-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-yellow-800">
                <span className="flex items-center gap-2">
                  📊 Conteúdo e Classificação
                </span>
                {openSections.classification ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Assunto Principal <span className="text-red-500">*</span>
                </label>
                <AdvancedSelectWithAdd
                  value={formData.mainSubject || ''}
                  onValueChange={(value) => updateField('mainSubject', value)}
                  placeholder="Selecione o assunto"
                  apiEndpoint="/api/main-subjects"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nível de Confidencialidade</label>
                  <SelectWithAdd
                    value={formData.confidentialityLevel || ''}
                    onValueChange={(value) => updateField('confidentialityLevel', value)}
                    placeholder="Selecione o nível"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Base Legal</label>
                  <Input
                    value={formData.legalBasis || ''}
                    onChange={(e) => updateField('legalBasis', e.target.value)}
                    placeholder="Lei, decreto, portaria..."
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Processo Relacionado</label>
                <Input
                  value={formData.relatedProcess || ''}
                  onChange={(e) => updateField('relatedProcess', e.target.value)}
                  placeholder="Número do processo"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Descrição <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Descreva o conteúdo do documento..."
                  rows={4}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Seção 4: Informações Complementares */}
      <Card className="border-purple-200">
        <Collapsible 
          open={openSections.complementary} 
          onOpenChange={() => toggleSection('complementary')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-purple-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-purple-800">
                <span className="flex items-center gap-2">
                  📚 Informações Complementares
                </span>
                {openSections.complementary ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Disponibilidade</label>
                  <SelectWithAdd
                    value={formData.availability || ''}
                    onValueChange={(value) => updateField('availability', value)}
                    placeholder="Selecione"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Idioma</label>
                  <SelectWithAdd
                    value={formData.language || ''}
                    onValueChange={(value) => updateField('language', value)}
                    placeholder="Selecione"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Direitos</label>
                  <SelectWithAdd
                    value={formData.rights || ''}
                    onValueChange={(value) => updateField('rights', value)}
                    placeholder="Selecione"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Palavras-chave</label>
                <div className="space-y-2">
                  <Input
                    placeholder="Digite palavras-chave separadas por vírgula..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value) {
                          const processed = handleTagsInput(value);
                          if (processed === '') {
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }
                    }}
                    disabled={isLoading}
                  />
                  <div className="flex flex-wrap gap-2">
                    {formData.tags?.map((tag: string, index: number) => (
                      <Badge 
                        key={index} 
                        className="bg-purple-100 text-purple-800 border-purple-200"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-purple-600"
                          disabled={isLoading}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Seção 5: Digitalização e Metadados Técnicos */}
      <Card className="border-orange-200">
        <Collapsible 
          open={openSections.technical} 
          onOpenChange={() => toggleSection('technical')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-orange-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-orange-800">
                <span className="flex items-center gap-2">
                  🔧 Digitalização e Metadados Técnicos
                </span>
                {openSections.technical ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Data de Digitalização</label>
                  <Input
                    type="date"
                    value={formData.digitalizationDate || ''}
                    onChange={(e) => updateField('digitalizationDate', e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Local de Digitalização</label>
                  <Input
                    value={formData.digitalizationLocation || ''}
                    onChange={(e) => updateField('digitalizationLocation', e.target.value)}
                    placeholder="Ex: Arquivo Central"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Responsável pela Digitalização</label>
                  <Input
                    value={formData.digitalizationResponsible || ''}
                    onChange={(e) => updateField('digitalizationResponsible', e.target.value)}
                    placeholder="Nome do responsável"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Autoridade do Documento</label>
                  <SelectWithAdd
                    value={formData.documentAuthority || ''}
                    onValueChange={(value) => updateField('documentAuthority', value)}
                    placeholder="Selecione"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Hash de Verificação
                    <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">Automático</Badge>
                  </label>
                  <Input
                    value={formData.verificationHash || ''}
                    disabled
                    className="bg-gray-50 text-xs font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};