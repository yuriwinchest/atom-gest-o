/**
 * InlineFormSections - Seguindo SRP
 * Responsabilidade única: Seções organizadas do formulário inline
 */

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SelectWithAddDB } from '../SelectWithAddDB';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface InlineFormSectionsProps {
  formData: any;
  onFormDataChange: (data: any) => void;
  isLoading: boolean;
}

export const InlineFormSections: React.FC<InlineFormSectionsProps> = ({
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

  const [newTag, setNewTag] = useState('');

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

  const addTag = () => {
    if (newTag.trim()) {
      const newTags = newTag
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .filter(tag => !formData.tags?.includes(tag));
      
      if (newTags.length > 0) {
        updateField('tags', [...(formData.tags || []), ...newTags]);
        setNewTag('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField('tags', formData.tags?.filter((tag: string) => tag !== tagToRemove) || []);
  };

  const requiredFields = ['title', 'documentType', 'publicOrgan', 'responsible', 'mainSubject', 'description'];
  const isFieldRequired = (field: string) => requiredFields.includes(field);

  return (
    <div className="space-y-4">
      {/* Seção 1: Identificação */}
      <Card className="border-blue-200">
        <Collapsible 
          open={openSections.identification} 
          onOpenChange={() => toggleSection('identification')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-blue-50 transition-colors py-3">
              <CardTitle className="flex items-center justify-between text-blue-800 text-base">
                <span>📋 Identificação</span>
                {openSections.identification ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Título {isFieldRequired('title') && <span className="text-red-500">*</span>}
                  </label>
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Digite o título"
                    disabled={isLoading}
                    className="h-8 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Tipo {isFieldRequired('documentType') && <span className="text-red-500">*</span>}
                  </label>
                  <SelectWithAddDB
                    value={formData.documentType || ''}
                    onValueChange={(value) => updateField('documentType', value)}
                    placeholder="Selecione"
                    apiEndpoint="/api/document-types"
                    disabled={isLoading}
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    ID Digital
                    <Badge className="ml-1 bg-blue-100 text-blue-800 text-xs px-1 py-0">Auto</Badge>
                  </label>
                  <Input
                    value={formData.digitalId || ''}
                    disabled
                    className="h-8 text-xs font-mono bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Seção 2: Origem */}
      <Card className="border-green-200">
        <Collapsible 
          open={openSections.origin} 
          onOpenChange={() => toggleSection('origin')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-green-50 transition-colors py-3">
              <CardTitle className="flex items-center justify-between text-green-800 text-base">
                <span>🏛️ Origem</span>
                {openSections.origin ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Órgão {isFieldRequired('publicOrgan') && <span className="text-red-500">*</span>}
                  </label>
                  <SelectWithAddDB
                    value={formData.publicOrgan || ''}
                    onValueChange={(value) => updateField('publicOrgan', value)}
                    placeholder="Selecione"
                    apiEndpoint="/api/public-organs"
                    disabled={isLoading}
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Setor</label>
                  <SelectWithAddDB
                    value={formData.responsibleSector || ''}
                    onValueChange={(value) => updateField('responsibleSector', value)}
                    placeholder="Selecione"
                    apiEndpoint="/api/responsible-sectors"
                    disabled={isLoading}
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Responsável {isFieldRequired('responsible') && <span className="text-red-500">*</span>}
                  </label>
                  <Input
                    value={formData.responsible || ''}
                    onChange={(e) => updateField('responsible', e.target.value)}
                    placeholder="Nome"
                    disabled={isLoading}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Seção 3: Classificação */}
      <Card className="border-yellow-200">
        <Collapsible 
          open={openSections.classification} 
          onOpenChange={() => toggleSection('classification')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-yellow-50 transition-colors py-3">
              <CardTitle className="flex items-center justify-between text-yellow-800 text-base">
                <span>📊 Classificação</span>
                {openSections.classification ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Assunto {isFieldRequired('mainSubject') && <span className="text-red-500">*</span>}
                </label>
                <SelectWithAddDB
                  value={formData.mainSubject || ''}
                  onValueChange={(value) => updateField('mainSubject', value)}
                  placeholder="Selecione"
                  apiEndpoint="/api/main-subjects"
                  disabled={isLoading}
                  className="h-8 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Confidencialidade</label>
                  <SelectWithAddDB
                    value={formData.confidentialityLevel || ''}
                    onValueChange={(value) => updateField('confidentialityLevel', value)}
                    placeholder="Selecione"
                    apiEndpoint="/api/confidentiality-levels"
                    disabled={isLoading}
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Base Legal</label>
                  <Input
                    value={formData.legalBase || ''}
                    onChange={(e) => updateField('legalBase', e.target.value)}
                    placeholder="Lei, decreto..."
                    disabled={isLoading}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Descrição {isFieldRequired('description') && <span className="text-red-500">*</span>}
                </label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Descreva o documento..."
                  rows={3}
                  disabled={isLoading}
                  className="text-sm"
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
            <CardHeader className="cursor-pointer hover:bg-purple-50 transition-colors py-3">
              <CardTitle className="flex items-center justify-between text-purple-800 text-base">
                <span>📚 Complementares</span>
                {openSections.complementary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Disponibilidade</label>
                  <SelectWithAddDB
                    value={formData.availability || ''}
                    onValueChange={(value) => updateField('availability', value)}
                    placeholder="Selecione"
                    apiEndpoint="/api/availability-options"
                    disabled={isLoading}
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Idioma</label>
                  <SelectWithAddDB
                    value={formData.language || ''}
                    onValueChange={(value) => updateField('language', value)}
                    placeholder="Selecione"
                    apiEndpoint="/api/language-options"
                    disabled={isLoading}
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Direitos</label>
                  <SelectWithAddDB
                    value={formData.rights || ''}
                    onValueChange={(value) => updateField('rights', value)}
                    placeholder="Selecione"
                    apiEndpoint="/api/rights-options"
                    disabled={isLoading}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Palavras-chave</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Digite e pressione Enter..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      disabled={isLoading}
                      className="h-8 text-sm"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={isLoading || !newTag.trim()}
                      className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formData.tags?.map((tag: string, index: number) => (
                      <Badge key={index} className="bg-purple-100 text-purple-800 text-xs">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-purple-600"
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

      {/* Seção 5: Técnicos */}
      <Card className="border-orange-200">
        <Collapsible 
          open={openSections.technical} 
          onOpenChange={() => toggleSection('technical')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-orange-50 transition-colors py-3">
              <CardTitle className="flex items-center justify-between text-orange-800 text-base">
                <span>🔧 Técnicos</span>
                {openSections.technical ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Data Digitalização</label>
                  <Input
                    type="date"
                    value={formData.digitalizationDate || ''}
                    onChange={(e) => updateField('digitalizationDate', e.target.value)}
                    disabled={isLoading}
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Local</label>
                  <Input
                    value={formData.digitalizationLocation || ''}
                    onChange={(e) => updateField('digitalizationLocation', e.target.value)}
                    placeholder="Ex: Arquivo Central"
                    disabled={isLoading}
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Autoridade</label>
                  <SelectWithAddDB
                    value={formData.documentAuthority || ''}
                    onValueChange={(value) => updateField('documentAuthority', value)}
                    placeholder="Selecione"
                    apiEndpoint="/api/document-authorities"
                    disabled={isLoading}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Hash de Verificação
                  <Badge className="ml-1 bg-blue-100 text-blue-800 text-xs px-1 py-0">Auto</Badge>
                </label>
                <Input
                  value={formData.verificationHash || 'Será gerado automaticamente'}
                  disabled
                  className="h-8 text-xs font-mono bg-gray-50"
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};