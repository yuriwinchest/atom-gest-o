import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SelectWithAddDB } from '@/components/SelectWithAddDB';
import { SelectWithInlineEdit } from '@/components/SelectWithInlineEdit';
import { X, Upload, Image as ImageIcon, FileText, Hash, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any, file: File, images?: File[]) => void;
  fileName?: string;
  selectedFile?: File | null;
  selectedFileCategory?: string;
}

export default function DocumentFormModal({
  isOpen,
  onClose,
  onSubmit,
  fileName = '',
  selectedFile,
  selectedFileCategory = ''
}: DocumentFormModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    documentType: '',
    referenceCode: '',
    publicOrgan: '',
    responsibleSector: '',
    responsible: '',
    period: '',
    mainSubject: '',
    confidentialityLevel: 'Público',
    legalBase: '',
    relatedProcess: '',
    description: '',
    availability: 'Disponível online',
    language: 'Português',
    rights: 'Domínio público',
    tags: [] as string[],
    digitalizationDate: new Date().toISOString().split('T')[0],
    digitalizationLocation: '',
    digitalId: '',
    digitalizationResponsible: '',
    documentAuthority: '',
    verificationHash: 'Calculado automaticamente'
  });

  const [mainFile, setMainFile] = useState<File | null>(selectedFile || null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [openSections, setOpenSections] = useState({
    document: true,
    images: true,
    metadata: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateField = (field: string, value: any) => {
    console.log(`📝 [DocumentFormModal] Atualizando campo ${field}:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMainFile(file);
      // Auto-fill title if empty
      if (!formData.title) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({ ...prev, title: nameWithoutExtension }));
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAdditionalImages(prev => [...prev, ...files]);
  };

  const removeImage = (indexToRemove: number) => {
    setAdditionalImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mainFile) {
      alert('Por favor, selecione um arquivo para upload!');
      return;
    }

    // Validação completa dos campos obrigatórios
    const requiredFields = [
      { field: 'title', label: 'Título' },
      { field: 'documentType', label: 'Tipo do Documento' },
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
      alert(`Por favor, preencha os campos obrigatórios: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setIsLoading(true);

    try {
      // Generate automatic fields
      const digitalId = `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const finalData = {
        ...formData,
        digitalId,
        fileName: mainFile.name,
        fileSize: mainFile.size,
        category: selectedFileCategory || 'Documentos'
      };

      // LOG TEMPORÁRIO PARA DEBUG
      console.log('🔍 [DocumentFormModal] Dados sendo enviados:', {
        documentType: finalData.documentType,
        publicOrgan: finalData.publicOrgan,
        responsibleSector: finalData.responsibleSector,
        mainSubject: finalData.mainSubject,
        confidentialityLevel: finalData.confidentialityLevel
      });

      // LOG COMPLETO DOS DADOS
      console.log('📦 [DocumentFormModal] DADOS COMPLETOS:', finalData);

      await onSubmit(finalData, mainFile, additionalImages);

      // Reset form
      setFormData({
        title: '',
        documentType: '',
        referenceCode: '',
        publicOrgan: '',
        responsibleSector: '',
        responsible: '',
        period: '',
        mainSubject: '',
        confidentialityLevel: 'Público',
        legalBase: '',
        relatedProcess: '',
        description: '',
        availability: 'Disponível online',
        language: 'Português',
        rights: 'Domínio público',
        tags: [],
        digitalizationDate: new Date().toISOString().split('T')[0],
        digitalizationLocation: '',
        digitalId: '',
        digitalizationResponsible: '',
        documentAuthority: '',
        verificationHash: 'Calculado automaticamente'
      });
      setMainFile(null);
      setAdditionalImages([]);
      onClose();

    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      alert('Erro ao enviar documento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const addTagsFromComma = () => {
    if (newTag.trim()) {
      // Separar por vírgula e limpar espaços
      const tags = newTag
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Adicionar apenas tags únicas que não existem
      const uniqueTags = tags.filter(tag => !formData.tags.includes(tag));

      if (uniqueTags.length > 0) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, ...uniqueTags]
        }));
      }

      setNewTag('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-600">
            Novo Documento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seção 1: Cadastro de Documento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white bg-blue-600 px-4 py-2 rounded-t-lg -mx-6 -mt-6">
                <FileText className="h-5 w-5" />
                Cadastro de Documento
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('document')}
                  className="ml-auto text-white hover:bg-blue-700"
                >
                  {openSections.document ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <Collapsible open={openSections.document} onOpenChange={() => toggleSection('document')}>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {/* Upload de Arquivo Principal */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="mb-4">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {mainFile ? mainFile.name : 'Upload de Arquivo Principal'}
                      </p>
                      {mainFile && (
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round(mainFile.size / 1024)} KB
                        </p>
                      )}
                    </div>
                    <input
                      type="file"
                      id="mainFile"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="*/*"
                      aria-label="Selecionar arquivo principal"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('mainFile')?.click()}
                      className="bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                    >
                      Selecionar Arquivo
                    </Button>
                  </div>

                  {/* Campos básicos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Título do Documento *</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        placeholder="Digite o título do documento"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tipo do Documento *</label>
                      <SelectWithInlineEdit
                        value={formData.documentType}
                        onValueChange={(value) => updateField('documentType', value)}
                        placeholder="Selecione o tipo"
                        apiEndpoint="/api/document-types"
                        label="Tipo de Documento"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Órgão Público *</label>
                      <SelectWithInlineEdit
                        value={formData.publicOrgan}
                        onValueChange={(value) => updateField('publicOrgan', value)}
                        placeholder="Selecione o órgão"
                        apiEndpoint="/api/public-organs"
                        label="Órgão Público"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Setor Responsável</label>
                      <SelectWithInlineEdit
                        value={formData.responsibleSector}
                        onValueChange={(value) => updateField('responsibleSector', value)}
                        placeholder="Selecione o setor"
                        apiEndpoint="/api/responsible-sectors"
                        label="Setor Responsável"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Descreva o documento"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Assunto Principal</label>
                    <SelectWithInlineEdit
                      value={formData.mainSubject}
                      onValueChange={(value) => updateField('mainSubject', value)}
                      placeholder="Selecione o assunto"
                      apiEndpoint="/api/main-subjects"
                      label="Assunto Principal"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Palavras-chave</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Digite as palavras-chave separadas por vírgula"
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTagsFromComma();
                          }
                        }}
                      />
                      <Button type="button" onClick={addTagsFromComma} variant="outline">
                        Adicionar
                      </Button>
                    </div>

                    {/* Exibir tags separadas */}
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 text-purple-500 hover:text-purple-700"
                              aria-label={`Remover tag ${tag}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Texto de ajuda */}
                    <p className="text-xs text-gray-500">
                      Digite as palavras-chave separadas por vírgula e clique em "Adicionar" ou pressione Enter
                    </p>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Seção 2: Anexar Imagens Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white bg-purple-600 px-4 py-2 rounded-t-lg -mx-6 -mt-6">
                <ImageIcon className="h-5 w-5" />
                Anexar Imagens Adicionais
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('images')}
                  className="ml-auto text-white hover:bg-purple-700"
                >
                  {openSections.images ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <Collapsible open={openSections.images} onOpenChange={() => toggleSection('images')}>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center">
                    <ImageIcon className="h-10 w-10 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-4">
                      Clique para anexar imagens (JPG, PNG)
                    </p>
                    <input
                      type="file"
                      id="additionalImages"
                      onChange={handleImageUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                      aria-label="Selecionar imagens adicionais"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('additionalImages')?.click()}
                      className="bg-purple-50 border-purple-300 text-purple-600 hover:bg-purple-100"
                    >
                      Selecionar Imagens
                    </Button>
                  </div>

                  {additionalImages.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Imagens anexadas:</p>
                      {additionalImages.map((image, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                          <span className="text-sm truncate">{image.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {Math.round(image.size / 1024)} KB
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImage(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Seção 3: Digitalização e Metadados Técnicos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white bg-orange-600 px-4 py-2 rounded-t-lg -mx-6 -mt-6">
                <Hash className="h-5 w-5" />
                Digitalização e Metadados Técnicos
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('metadata')}
                  className="ml-auto text-white hover:bg-orange-700"
                >
                  {openSections.metadata ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <Collapsible open={openSections.metadata} onOpenChange={() => toggleSection('metadata')}>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Data de Digitalização</label>
                      <Input
                        type="date"
                        value={formData.digitalizationDate}
                        onChange={(e) => updateField('digitalizationDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Local da Digitalização</label>
                      <Input
                        value={formData.digitalizationLocation}
                        onChange={(e) => updateField('digitalizationLocation', e.target.value)}
                        placeholder="Ex: Sede da Prefeitura"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Responsável pela Digitalização</label>
                      <Input
                        value={formData.digitalizationResponsible}
                        onChange={(e) => updateField('digitalizationResponsible', e.target.value)}
                        placeholder="Nome do responsável"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Autoridade do Documento</label>
                      <Input
                        value={formData.documentAuthority}
                        onChange={(e) => updateField('documentAuthority', e.target.value)}
                        placeholder="Ex: Prefeito, Secretário"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nível de Confidencialidade</label>
                      <SelectWithInlineEdit
                        value={formData.confidentialityLevel}
                        onValueChange={(value) => updateField('confidentialityLevel', value)}
                        placeholder="Selecione o nível"
                        apiEndpoint="/api/confidentiality-levels"
                        label="Nível de Confidencialidade"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Idioma</label>
                      <select
                        value={formData.language}
                        onChange={(e) => updateField('language', e.target.value)}
                        className="w-full p-2 border rounded-md"
                        aria-label="Selecionar idioma do documento"
                      >
                        <option value="Português">Português</option>
                        <option value="Inglês">Inglês</option>
                        <option value="Espanhol">Espanhol</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Botões de ação */}
          <div className="flex gap-4 pt-6 border-t">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Salvando...' : 'Salvar Documento'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-8"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}