import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Upload, X, Plus, FileText, Camera, Settings } from 'lucide-react';
import { SelectWithAddInline } from '@/components/SelectWithAddInline';
import { useQuery } from '@tanstack/react-query';
import { generateDigitalId, calculateHash } from '@/lib/documentUtils';
import { useToast } from '@/hooks/use-toast';

interface DocumentFormInlineProps {
  onSubmit: (formData: any, file: File, additionalImages?: File[]) => void;
  onCancel: () => void;
}

export default function DocumentFormInline({ onSubmit, onCancel }: DocumentFormInlineProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    code: '',
    publicOrgan: '',
    sector: '',
    responsible: '',
    period: '',
    mainSubject: '',
    confidentiality: '',
    legalBase: '',
    relatedProcess: '',
    description: '',
    availability: '',
    language: '',
    rights: '',
    keywords: '',
    digitizationDate: '',
    digitizationLocation: '',
    digitalId: '',
    digitizationResponsible: '',
    documentAuthority: '',
    verificationHash: ''
  });

  const [mainFile, setMainFile] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [openSections, setOpenSections] = useState({
    identification: true,
    origin: true,
    classification: true,
    additional: false,
    technical: false
  });

  // Generate automatic fields when the form loads or mainFile changes
  useEffect(() => {
    // Generate digital ID if empty
    if (!formData.digitalId) {
      const newDigitalId = generateDigitalId();
      setFormData(prev => ({ ...prev, digitalId: newDigitalId }));
    }
    
    // Generate hash when file is selected
    if (mainFile && !formData.verificationHash) {
      calculateHash(mainFile).then(hash => {
        setFormData(prev => ({ ...prev, verificationHash: hash }));
      });
    }
  }, [mainFile]);

  const handleInputChange = (field: string, value: string) => {
    // Se for campo obrigatório e contém apenas espaços, não atualizar
    const requiredFields = ['title', 'type', 'publicOrgan', 'responsible', 'mainSubject', 'description'];
    if (requiredFields.includes(field) && value.trim() === '' && value !== '') {
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainFile(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAdditionalImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de campos obrigatórios
    const requiredFields = [
      { field: 'title', label: 'Título' },
      { field: 'type', label: 'Tipo de Documento' },
      { field: 'publicOrgan', label: 'Órgão Público' },
      { field: 'responsible', label: 'Responsável' },
      { field: 'mainSubject', label: 'Assunto Principal' },
      { field: 'description', label: 'Descrição' }
    ];
    
    const missingFields = requiredFields.filter(({ field }) => {
      const value = formData[field as keyof typeof formData];
      return !value || value.toString().trim() === '';
    });
    
    if (missingFields.length > 0) {
      toast({
        title: 'Campos obrigatórios',
        description: `Por favor, preencha: ${missingFields.map(f => f.label).join(', ')}`,
        variant: 'destructive'
      });
      return;
    }
    
    if (!mainFile) {
      toast({
        title: 'Arquivo obrigatório',
        description: 'Por favor, selecione um arquivo principal',
        variant: 'destructive'
      });
      return;
    }
    
    // Limpar espaços em branco antes de enviar
    const cleanedFormData = Object.entries(formData).reduce((acc, [key, value]) => {
      acc[key as keyof typeof formData] = typeof value === 'string' ? value.trim() : value;
      return acc;
    }, {} as typeof formData);
    
    onSubmit(cleanedFormData, mainFile, additionalImages);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gray-50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Novo Documento</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seção 1: Identificação do Documento */}
          <Collapsible open={openSections.identification} onOpenChange={() => toggleSection('identification')}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-blue-500 text-white hover:bg-blue-600">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Cadastro de Documento
                </div>
                {openSections.identification ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ex: Decreto nº 001/2024"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    placeholder="Ex: DEZ-001/2024"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <SelectWithAddInline
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                    apiEndpoint="/api/document-types"
                    label="Tipo de Documento"
                    placeholder="Digite ou selecione..."
                  />
                </div>
                <div>
                  <Label htmlFor="publicOrgan">Órgão Público *</Label>
                  <SelectWithAddInline
                    value={formData.publicOrgan}
                    onValueChange={(value) => handleInputChange('publicOrgan', value)}
                    apiEndpoint="/api/public-organs"
                    label="Órgão Público"
                    placeholder="Digite ou selecione..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sector">Setor</Label>
                  <SelectWithAddInline
                    value={formData.sector}
                    onValueChange={(value) => handleInputChange('sector', value)}
                    apiEndpoint="/api/responsible-sectors"
                    label="Setor"
                    placeholder="Digite ou selecione..."
                  />
                </div>
                <div>
                  <Label htmlFor="responsible">Responsável *</Label>
                  <Input
                    id="responsible"
                    value={formData.responsible}
                    onChange={(e) => handleInputChange('responsible', e.target.value)}
                    placeholder="Nome do responsável"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="period">Período</Label>
                <Input
                  id="period"
                  value={formData.period}
                  onChange={(e) => handleInputChange('period', e.target.value)}
                  placeholder="Ex: 2024"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Seção 2: Origem e Responsabilidade */}
          <Collapsible open={openSections.origin} onOpenChange={() => toggleSection('origin')}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-green-500 text-white hover:bg-green-600">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Origem e Responsabilidade
                </div>
                {openSections.origin ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mainSubject">Assunto Principal *</Label>
                  <SelectWithAddInline
                    value={formData.mainSubject}
                    onValueChange={(value) => handleInputChange('mainSubject', value)}
                    apiEndpoint="/api/main-subjects"
                    label="Assunto Principal"
                    placeholder="Digite ou selecione..."
                  />
                </div>
                <div>
                  <Label htmlFor="confidentiality">Confidencialidade</Label>
                  <SelectWithAddInline
                    value={formData.confidentiality}
                    onValueChange={(value) => handleInputChange('confidentiality', value)}
                    apiEndpoint="/api/confidentiality-levels"
                    label="Nível de Confidencialidade"
                    placeholder="Digite ou selecione..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="legalBase">Base Legal</Label>
                  <Input
                    id="legalBase"
                    value={formData.legalBase}
                    onChange={(e) => handleInputChange('legalBase', e.target.value)}
                    placeholder="Ex: Lei nº 8.666/93"
                  />
                </div>
                <div>
                  <Label htmlFor="relatedProcess">Processo</Label>
                  <Input
                    id="relatedProcess"
                    value={formData.relatedProcess}
                    onChange={(e) => handleInputChange('relatedProcess', e.target.value)}
                    placeholder="Ex: Processo nº 001/2024"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Seção 3: Conteúdo e Classificação */}
          <Collapsible open={openSections.classification} onOpenChange={() => toggleSection('classification')}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-yellow-500 text-white hover:bg-yellow-600">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Conteúdo e Classificação
                </div>
                {openSections.classification ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva o documento..."
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="availability">Disponibilidade</Label>
                  <SelectWithAddInline
                    value={formData.availability}
                    onValueChange={(value) => handleInputChange('availability', value)}
                    apiEndpoint="/api/availability-options"
                    label="Disponibilidade"
                    placeholder="Digite ou selecione..."
                  />
                </div>
                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <SelectWithAddInline
                    value={formData.language}
                    onValueChange={(value) => handleInputChange('language', value)}
                    apiEndpoint="/api/language-options"
                    label="Idioma"
                    placeholder="Digite ou selecione..."
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="rights">Direitos</Label>
                <SelectWithAddInline
                  value={formData.rights}
                  onValueChange={(value) => handleInputChange('rights', value)}
                  apiEndpoint="/api/rights-options"
                  label="Direitos"
                  placeholder="Digite ou selecione..."
                />
              </div>
              <div>
                <Label htmlFor="keywords">Palavras-chave</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => handleInputChange('keywords', e.target.value)}
                  placeholder="Digite as palavras-chave separadas por vírgula"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Upload de Arquivo Principal */}
          <div className="space-y-4">
            <Label htmlFor="mainFile">Upload de Arquivo Principal *</Label>
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" asChild>
                <label htmlFor="mainFile" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Arquivo
                </label>
              </Button>
              <input
                id="mainFile"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
              />
              {mainFile && (
                <span className="text-sm text-gray-600">
                  {mainFile.name} ({Math.round(mainFile.size / 1024)} KB)
                </span>
              )}
            </div>
          </div>

          {/* Seção 4: Anexar Imagens Adicionais */}
          <Collapsible open={openSections.additional} onOpenChange={() => toggleSection('additional')}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-purple-500 text-white hover:bg-purple-600">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Anexar Imagens Adicionais
                </div>
                {openSections.additional ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" asChild>
                  <label htmlFor="additionalImages" className="cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Imagens
                  </label>
                </Button>
                <input
                  id="additionalImages"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  accept=".jpg,.jpeg,.png,.gif,.bmp,.webp"
                />
              </div>
              {additionalImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {additionalImages.map((image, index) => (
                    <div key={index} className="relative bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-sm truncate">{image.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(image.size / 1024)} KB
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Seção 5: Digitalização e Metadados Técnicos */}
          <Collapsible open={openSections.technical} onOpenChange={() => toggleSection('technical')}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-orange-500 text-white hover:bg-orange-600">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Digitalização e Metadados Técnicos
                </div>
                {openSections.technical ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="digitizationDate">Data de Digitalização</Label>
                  <Input
                    id="digitizationDate"
                    type="date"
                    value={formData.digitizationDate}
                    onChange={(e) => handleInputChange('digitizationDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="digitizationLocation">Local de Digitalização</Label>
                  <Input
                    id="digitizationLocation"
                    value={formData.digitizationLocation}
                    onChange={(e) => handleInputChange('digitizationLocation', e.target.value)}
                    placeholder="Ex: Secretaria Municipal"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="digitalId">Identificação Digital</Label>
                  <Input
                    id="digitalId"
                    value={formData.digitalId}
                    onChange={(e) => handleInputChange('digitalId', e.target.value)}
                    placeholder="Será gerado automaticamente"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="digitizationResponsible">Responsável pela Digitalização</Label>
                  <Input
                    id="digitizationResponsible"
                    value={formData.digitizationResponsible}
                    onChange={(e) => handleInputChange('digitizationResponsible', e.target.value)}
                    placeholder="Nome do responsável"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentAuthority">Autoridade do Documento</Label>
                  <SelectWithAddInline
                    value={formData.documentAuthority}
                    onValueChange={(value) => handleInputChange('documentAuthority', value)}
                    apiEndpoint="/api/document-authorities"
                    label="Autoridade do Documento"
                    placeholder="Digite ou selecione..."
                  />
                </div>
                <div>
                  <Label htmlFor="verificationHash">Hash de Verificação</Label>
                  <Input
                    id="verificationHash"
                    value={formData.verificationHash}
                    onChange={(e) => handleInputChange('verificationHash', e.target.value)}
                    placeholder="Será gerado automaticamente"
                    disabled
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Salvar Documento
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}