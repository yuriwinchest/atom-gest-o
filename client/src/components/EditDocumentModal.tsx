import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectWithAdd } from "@/components/ui/select-with-add";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, FileText, Building2, User, Calendar, Tag, Shield, Globe, Hash, MapPin, UserCheck, Building } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Document } from "@shared/schema";

interface EditDocumentModalProps {
  document: Document;
  onClose: () => void;
  onSave: (updatedData: any) => void;
}

interface EditDocumentData {
  title: string;
  documentType: string;
  referenceCode: string;
  publicOrgan: string;
  responsibleSector: string;
  responsible: string;
  period: string;
  mainSubject: string;
  confidentialityLevel: string;
  legalBase: string;
  relatedProcess: string;
  description: string;
  availability: string;
  language: string;
  rights: string;
  tags: string[];
  digitalizationDate: string;
  digitalizationLocation: string;
  digitalId: string;
  digitalizationResponsible: string;
  documentAuthority: string;
  verificationHash: string;
}

export default function EditDocumentModal({ document, onClose, onSave }: EditDocumentModalProps) {
  const [formData, setFormData] = useState<EditDocumentData>({
    title: "",
    documentType: "",
    referenceCode: "",
    publicOrgan: "",
    responsibleSector: "",
    responsible: "",
    period: "",
    mainSubject: "",
    confidentialityLevel: "Público",
    legalBase: "",
    relatedProcess: "",
    description: "",
    availability: "Disponível online",
    language: "Português",
    rights: "Domínio público",
    tags: [],
    digitalizationDate: new Date().toISOString().split('T')[0],
    digitalizationLocation: "",
    digitalId: "",
    digitalizationResponsible: "",
    documentAuthority: "",
    verificationHash: "Calculado automaticamente"
  });

  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  // Listas de opções para os campos select
  const [documentTypes, setDocumentTypes] = useState([
    "Decreto", "Lei", "Portaria", "Resolução", "Instrução Normativa", "Memorando",
    "Ofício", "Relatório", "Ata", "Contrato", "Convênio", "Edital"
  ]);
  
  const [publicOrgans, setPublicOrgans] = useState([
    "Prefeitura Municipal", "Governo do Estado", "Ministério da Saúde", 
    "Ministério da Educação", "Secretaria de Estado", "Autarquia Municipal",
    "Empresa Pública", "Fundação Pública"
  ]);
  
  const [confidentialityLevels, setConfidentialityLevels] = useState([
    "Público", "Restrito", "Confidencial", "Secreto", "Ultra-secreto"
  ]);
  
  const [availabilityOptions, setAvailabilityOptions] = useState([
    "Disponível online", "Disponível fisicamente", "Acesso restrito", 
    "Sob consulta", "Temporariamente indisponível"
  ]);
  
  const [languageOptions, setLanguageOptions] = useState([
    "Português", "Inglês", "Espanhol", "Francês", "Alemão", "Italiano"
  ]);
  
  const [rightsOptions, setRightsOptions] = useState([
    "Domínio público", "Direitos autorais reservados", "Creative Commons", 
    "Uso restrito", "Propriedade intelectual protegida"
  ]);

  const [responsibleSectors, setResponsibleSectors] = useState([
    "Gabinete do Prefeito", "Secretaria de Administração", "Secretaria de Saúde",
    "Secretaria de Educação", "Secretaria de Obras", "Secretaria de Finanças",
    "Secretaria de Meio Ambiente", "Procuradoria Jurídica", "Controladoria"
  ]);

  const [mainSubjects, setMainSubjects] = useState([
    "Administração Pública", "Educação", "Saúde", "Infraestrutura", "Meio Ambiente",
    "Finanças Públicas", "Legislação", "Recursos Humanos", "Planejamento Urbano",
    "Assistência Social", "Cultura", "Esporte"
  ]);

  const [documentAuthorities, setDocumentAuthorities] = useState([
    "Prefeito Municipal", "Secretário Municipal", "Diretor de Departamento",
    "Coordenador", "Chefe de Divisão", "Procurador Jurídico", "Controlador",
    "Presidente da Câmara", "Vereador"
  ]);

  // Preencher formulário com dados do documento quando abrir
  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title || "",
        documentType: document.category || "",
        referenceCode: `ATOM-${document.id}`,
        publicOrgan: "Secretaria de Meio Ambiente",
        responsibleSector: "Departamento de Saúde",
        responsible: document.author || "",
        period: new Date().getFullYear().toString(),
        mainSubject: "Meio Ambiente",
        confidentialityLevel: "Público",
        legalBase: document.title || "",
        relatedProcess: "",
        description: document.description || document.content || "",
        availability: "Disponível online",
        language: "Português",
        rights: "Domínio público",
        tags: document.tags || [],
        digitalizationDate: document.createdAt ? new Date(document.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        digitalizationLocation: document.title || "",
        digitalId: `ATOM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        digitalizationResponsible: document.author || "",
        documentAuthority: "Prefeitura Municipal",
        verificationHash: "637794426ddf26779568674269565642e2a1b2e616e5f2e623547579"
      });
    }
  }, [document]);

  const requiredFields = [
    'title', 'documentType', 'publicOrgan', 'mainSubject', 
    'digitalizationDate', 'digitalizationLocation', 'digitalizationResponsible'
  ];

  const validateForm = () => {
    const missingFields = requiredFields.filter(field => !formData[field as keyof EditDocumentData]);
    setErrors(missingFields);
    return missingFields.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const updateField = (field: keyof EditDocumentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors.includes(field)) {
      setErrors(prev => prev.filter(error => error !== field));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Editar Documento: {document?.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Formulário para edição dos metadados e informações do documento {document?.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Identificação */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Identificação</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="title">Título do Documento *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className={cn(errors.includes('title') && "border-red-500")}
                />
              </div>
              <div>
                <Label htmlFor="referenceCode">Código de Referência</Label>
                <Input
                  id="referenceCode"
                  value={formData.referenceCode}
                  onChange={(e) => updateField('referenceCode', e.target.value)}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="documentType">Tipo de Documento *</Label>
                <SelectWithAdd
                  value={formData.documentType}
                  onValueChange={(value) => updateField('documentType', value)}
                  options={documentTypes}
                  onAddOption={(newOption) => setDocumentTypes([...documentTypes, newOption])}
                  placeholder="Selecione o tipo"
                  className={cn(errors.includes('documentType') && "border-red-500")}
                />
              </div>
              <div>
                <Label htmlFor="period">Período</Label>
                <Input
                  id="period"
                  value={formData.period}
                  onChange={(e) => updateField('period', e.target.value)}
                  placeholder="Ex: 2024"
                />
              </div>
            </div>
          </div>

          {/* Origem e Responsabilidade */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Origem e Responsabilidade</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="publicOrgan">Órgão Público *</Label>
                <SelectWithAdd
                  value={formData.publicOrgan}
                  onValueChange={(value) => updateField('publicOrgan', value)}
                  options={publicOrgans}
                  onAddOption={(newOption) => setPublicOrgans([...publicOrgans, newOption])}
                  placeholder="Selecione o órgão"
                  className={cn(errors.includes('publicOrgan') && "border-red-500")}
                />
              </div>
              
              <div>
                <Label htmlFor="responsibleSector">Setor Responsável</Label>
                <SelectWithAdd
                  value={formData.responsibleSector}
                  onValueChange={(value) => updateField('responsibleSector', value)}
                  options={responsibleSectors}
                  onAddOption={(newOption) => setResponsibleSectors([...responsibleSectors, newOption])}
                  placeholder="Selecione o setor"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responsible">Responsável</Label>
                <Input
                  id="responsible"
                  value={formData.responsible}
                  onChange={(e) => updateField('responsible', e.target.value)}
                  placeholder="Nome do responsável"
                />
              </div>
            </div>
          </div>

          {/* Conteúdo e Classificação */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-800">Conteúdo e Classificação</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="mainSubject">Assunto Principal *</Label>
                <SelectWithAdd
                  value={formData.mainSubject}
                  onValueChange={(value) => updateField('mainSubject', value)}
                  options={mainSubjects}
                  onAddOption={(newOption) => setMainSubjects([...mainSubjects, newOption])}
                  placeholder="Selecione o assunto"
                  className={cn(errors.includes('mainSubject') && "border-red-500")}
                />
              </div>
              
              <div>
                <Label htmlFor="confidentialityLevel">Nível de Confidencialidade</Label>
                <SelectWithAdd
                  value={formData.confidentialityLevel}
                  onValueChange={(value) => updateField('confidentialityLevel', value)}
                  options={confidentialityLevels}
                  onAddOption={(newOption) => setConfidentialityLevels([...confidentialityLevels, newOption])}
                  placeholder="Selecione o nível"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                  placeholder="Descrição detalhada do documento"
                />
              </div>
              
              <div>
                <Label htmlFor="legalBase">Base Legal</Label>
                <Input
                  id="legalBase"
                  value={formData.legalBase}
                  onChange={(e) => updateField('legalBase', e.target.value)}
                  placeholder="Fundamento legal"
                />
              </div>
            </div>
          </div>

          {/* Informações Complementares */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">Informações Complementares</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="availability">Disponibilidade</Label>
                <SelectWithAdd
                  value={formData.availability}
                  onValueChange={(value) => updateField('availability', value)}
                  options={availabilityOptions}
                  onAddOption={(newOption) => setAvailabilityOptions([...availabilityOptions, newOption])}
                  placeholder="Selecione a disponibilidade"
                />
              </div>
              
              <div>
                <Label htmlFor="language">Idioma</Label>
                <SelectWithAdd
                  value={formData.language}
                  onValueChange={(value) => updateField('language', value)}
                  options={languageOptions}
                  onAddOption={(newOption) => setLanguageOptions([...languageOptions, newOption])}
                  placeholder="Selecione o idioma"
                />
              </div>
              
              <div>
                <Label htmlFor="rights">Direitos</Label>
                <SelectWithAdd
                  value={formData.rights}
                  onValueChange={(value) => updateField('rights', value)}
                  options={rightsOptions}
                  onAddOption={(newOption) => setRightsOptions([...rightsOptions, newOption])}
                  placeholder="Selecione os direitos"
                />
              </div>
            </div>
            
            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex items-center gap-2 mb-2">
                <Input
                  placeholder="Adicionar tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Digitalização */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Digitalização</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="digitalizationDate">Data da Digitalização *</Label>
                <Input
                  id="digitalizationDate"
                  type="date"
                  value={formData.digitalizationDate}
                  onChange={(e) => updateField('digitalizationDate', e.target.value)}
                  className={cn(errors.includes('digitalizationDate') && "border-red-500")}
                />
              </div>
              
              <div>
                <Label htmlFor="digitalizationLocation">Local da Digitalização *</Label>
                <Input
                  id="digitalizationLocation"
                  value={formData.digitalizationLocation}
                  onChange={(e) => updateField('digitalizationLocation', e.target.value)}
                  className={cn(errors.includes('digitalizationLocation') && "border-red-500")}
                />
              </div>
              
              <div>
                <Label htmlFor="digitalizationResponsible">Responsável pela Digitalização *</Label>
                <Input
                  id="digitalizationResponsible"
                  value={formData.digitalizationResponsible}
                  onChange={(e) => updateField('digitalizationResponsible', e.target.value)}
                  className={cn(errors.includes('digitalizationResponsible') && "border-red-500")}
                />
              </div>
              
              <div>
                <Label htmlFor="documentAuthority">Autoridade do Documento</Label>
                <SelectWithAdd
                  value={formData.documentAuthority}
                  onValueChange={(value) => updateField('documentAuthority', value)}
                  options={documentAuthorities}
                  onAddOption={(newOption) => setDocumentAuthorities([...documentAuthorities, newOption])}
                  placeholder="Selecione a autoridade"
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              * Campos obrigatórios
            </div>
            
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}