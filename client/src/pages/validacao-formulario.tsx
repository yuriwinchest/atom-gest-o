import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Save, Eye, Building2, User, Calendar, Tag, Shield, Globe, Hash, MapPin, UserCheck, Building, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface FormValidation {
  id: number;
  field_name: string;
  annotation: string;
  created_at: string;
  updated_at: string;
}

export default function ValidacaoFormulario() {
  const [annotations, setAnnotations] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  // Carregar anotações existentes
  const { data: validations = [], isLoading } = useQuery<FormValidation[]>({
    queryKey: ['/api/form-validations'],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Salvar anotação
  const saveMutation = useMutation({
    mutationFn: (data: { field_name: string; annotation: string }) =>
      apiRequest('POST', '/api/form-validations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/form-validations'] });
    },
  });

  const handleAnnotationChange = (fieldName: string, value: string) => {
    setAnnotations(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSaveAnnotation = async (fieldName: string) => {
    const annotation = annotations[fieldName];
    if (!annotation?.trim()) {
      alert('Por favor, digite uma anotação antes de salvar.');
      return;
    }

    try {
      console.log('💾 Salvando anotação:', { field_name: fieldName, annotation: annotation.trim() });
      
      await saveMutation.mutateAsync({
        field_name: fieldName,
        annotation: annotation.trim()
      });

      console.log('✅ Anotação salva com sucesso!');
      alert(`✅ Anotação salva com sucesso para o campo "${fieldName}"!`);

      // Limpar o campo após salvar
      setAnnotations(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    } catch (error) {
      console.error('❌ Erro ao salvar anotação:', error);
      alert(`❌ Erro ao salvar anotação para "${fieldName}". Tente novamente.`);
    }
  };

  const getExistingAnnotation = (fieldName: string) => {
    return validations.find(v => v.field_name === fieldName)?.annotation || '';
  };

  const renderAnnotationSection = (fieldName: string) => (
    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-2">
      <Label className="text-xs font-medium text-yellow-700">Anotação:</Label>
      <Textarea
        placeholder="Deixe sua anotação sobre este campo..."
        className="mt-1 text-sm"
        rows={2}
        value={annotations[fieldName] || ''}
        onChange={(e) => handleAnnotationChange(fieldName, e.target.value)}
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-yellow-600">
          {getExistingAnnotation(fieldName) && `Anotação salva: "${getExistingAnnotation(fieldName)}"`}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleSaveAnnotation(fieldName)}
          disabled={!annotations[fieldName]?.trim() || saveMutation.isPending}
        >
          <Save className="h-3 w-3 mr-1" />
          Salvar
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Carregando formulário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Validação de Formulário</h1>
          </div>
          <p className="text-gray-600">
            Teste o formulário completo de cadastro de documentos e deixe suas anotações para melhorias
          </p>
        </div>

        {/* Modal simulado */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Cadastro de Documento Público
            </CardTitle>
            <CardDescription className="text-blue-100">
              Arquivo: Plano de Desenvolvimento de Projeto.pdf
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Identificação do Documento */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Identificação do Documento</h3>
              </div>
              
              <div className="space-y-4">
                {/* Título do Documento */}
                <div>
                  <Label htmlFor="title" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Título do Documento *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Decreto nº 001/2024 - Regulamentação do Horário de Funcionamento"
                    className="w-full"
                  />
                  {renderAnnotationSection('title')}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Tipo de Documento */}
                  <div>
                    <Label htmlFor="documentType">Tipo de Documento *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="decreto">Decreto</SelectItem>
                        <SelectItem value="lei">Lei</SelectItem>
                        <SelectItem value="portaria">Portaria</SelectItem>
                        <SelectItem value="resolucao">Resolução</SelectItem>
                        <SelectItem value="instrucao">Instrução Normativa</SelectItem>
                        <SelectItem value="memorando">Memorando</SelectItem>
                        <SelectItem value="oficio">Ofício</SelectItem>
                        <SelectItem value="relatorio">Relatório</SelectItem>
                        <SelectItem value="ata">Ata</SelectItem>
                        <SelectItem value="contrato">Contrato</SelectItem>
                        <SelectItem value="convenio">Convênio</SelectItem>
                        <SelectItem value="edital">Edital</SelectItem>
                      </SelectContent>
                    </Select>
                    {renderAnnotationSection('documentType')}
                  </div>
                  
                  {/* Código de Referência */}
                  <div>
                    <Label htmlFor="referenceCode" className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Código de Referência
                    </Label>
                    <Input
                      id="referenceCode"
                      placeholder="Ex: DEZ-001/2024"
                      className="w-full"
                    />
                    {renderAnnotationSection('referenceCode')}
                  </div>
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
                {/* Órgão Público */}
                <div>
                  <Label htmlFor="publicOrgan" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Órgão Público *
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o órgão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prefeitura">Prefeitura Municipal</SelectItem>
                      <SelectItem value="governo">Governo do Estado</SelectItem>
                      <SelectItem value="saude">Ministério da Saúde</SelectItem>
                      <SelectItem value="educacao">Ministério da Educação</SelectItem>
                      <SelectItem value="secretaria">Secretaria de Estado</SelectItem>
                      <SelectItem value="autarquia">Autarquia Municipal</SelectItem>
                      <SelectItem value="empresa">Empresa Pública</SelectItem>
                      <SelectItem value="fundacao">Fundação Pública</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderAnnotationSection('publicOrgan')}
                </div>
                
                {/* Setor Responsável */}
                <div>
                  <Label htmlFor="responsibleSector" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Setor Responsável
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o setor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gabinete">Gabinete do Prefeito</SelectItem>
                      <SelectItem value="administracao">Secretaria de Administração</SelectItem>
                      <SelectItem value="saude">Secretaria de Saúde</SelectItem>
                      <SelectItem value="educacao">Secretaria de Educação</SelectItem>
                      <SelectItem value="obras">Secretaria de Obras</SelectItem>
                      <SelectItem value="financas">Secretaria de Finanças</SelectItem>
                      <SelectItem value="meio-ambiente">Secretaria de Meio Ambiente</SelectItem>
                      <SelectItem value="juridica">Procuradoria Jurídica</SelectItem>
                      <SelectItem value="controladoria">Controladoria</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderAnnotationSection('responsibleSector')}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Responsável/Autor */}
                <div>
                  <Label htmlFor="responsible" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Responsável/Autor
                  </Label>
                  <Input
                    id="responsible"
                    placeholder="Ex: João Silva - Secretário de Administração"
                  />
                  {renderAnnotationSection('responsible')}
                </div>
                
                {/* Período/Data */}
                <div>
                  <Label htmlFor="period" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Período/Data
                  </Label>
                  <Input
                    id="period"
                    placeholder="Ex: Janeiro/2024 ou 15/01/2024"
                  />
                  {renderAnnotationSection('period')}
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
                {/* Assunto Principal */}
                <div>
                  <Label htmlFor="mainSubject" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Assunto Principal *
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o assunto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administracao">Administração Pública</SelectItem>
                      <SelectItem value="educacao">Educação</SelectItem>
                      <SelectItem value="saude">Saúde</SelectItem>
                      <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                      <SelectItem value="meio-ambiente">Meio Ambiente</SelectItem>
                      <SelectItem value="financas">Finanças Públicas</SelectItem>
                      <SelectItem value="legislacao">Legislação</SelectItem>
                      <SelectItem value="recursos-humanos">Recursos Humanos</SelectItem>
                      <SelectItem value="planejamento">Planejamento Urbano</SelectItem>
                      <SelectItem value="assistencia">Assistência Social</SelectItem>
                      <SelectItem value="cultura">Cultura</SelectItem>
                      <SelectItem value="esporte">Esporte</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderAnnotationSection('mainSubject')}
                </div>
                
                {/* Nível de Confidencialidade */}
                <div>
                  <Label htmlFor="confidentialityLevel" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Nível de Confidencialidade
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publico">Público</SelectItem>
                      <SelectItem value="restrito">Restrito</SelectItem>
                      <SelectItem value="confidencial">Confidencial</SelectItem>
                      <SelectItem value="secreto">Secreto</SelectItem>
                      <SelectItem value="ultra-secreto">Ultra-secreto</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderAnnotationSection('confidentialityLevel')}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Base Legal */}
                <div>
                  <Label htmlFor="legalBase">Base Legal</Label>
                  <Input
                    id="legalBase"
                    placeholder="Ex: Lei nº 8.666/93, Art. 15"
                  />
                  {renderAnnotationSection('legalBase')}
                </div>
                
                {/* Processo Relacionado */}
                <div>
                  <Label htmlFor="relatedProcess">Processo Relacionado</Label>
                  <Input
                    id="relatedProcess"
                    placeholder="Ex: Processo nº 001/2024"
                  />
                  {renderAnnotationSection('relatedProcess')}
                </div>
              </div>
              
              {/* Descrição */}
              <div>
                <Label htmlFor="description">Descrição do Documento</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o conteúdo, objetivo e importância do documento..."
                  rows={4}
                />
                {renderAnnotationSection('description')}
              </div>
            </div>

            {/* Informações Complementares */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">Informações Complementares</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Disponibilidade */}
                <div>
                  <Label htmlFor="availability" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Disponibilidade
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a disponibilidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Disponível online</SelectItem>
                      <SelectItem value="fisico">Disponível fisicamente</SelectItem>
                      <SelectItem value="restrito">Acesso restrito</SelectItem>
                      <SelectItem value="consulta">Sob consulta</SelectItem>
                      <SelectItem value="indisponivel">Temporariamente indisponível</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderAnnotationSection('availability')}
                </div>
                
                {/* Idioma */}
                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portugues">Português</SelectItem>
                      <SelectItem value="ingles">Inglês</SelectItem>
                      <SelectItem value="espanhol">Espanhol</SelectItem>
                      <SelectItem value="frances">Francês</SelectItem>
                      <SelectItem value="alemao">Alemão</SelectItem>
                      <SelectItem value="italiano">Italiano</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderAnnotationSection('language')}
                </div>
                
                {/* Direitos */}
                <div>
                  <Label htmlFor="rights">Direitos</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione os direitos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dominio-publico">Domínio público</SelectItem>
                      <SelectItem value="direitos-autorais">Direitos autorais reservados</SelectItem>
                      <SelectItem value="creative-commons">Creative Commons</SelectItem>
                      <SelectItem value="uso-restrito">Uso restrito</SelectItem>
                      <SelectItem value="propriedade-intelectual">Propriedade intelectual protegida</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderAnnotationSection('rights')}
                </div>
              </div>
              
              {/* Palavras-chave */}
              <div>
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Palavras-chave
                </Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Digite uma palavra-chave"
                  />
                  <Button type="button">Adicionar</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                    decreto
                    <X className="h-3 w-3" />
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                    administração
                    <X className="h-3 w-3" />
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                    projeto
                    <X className="h-3 w-3" />
                  </span>
                </div>
                {renderAnnotationSection('tags')}
              </div>
            </div>

            {/* Digitalização e Metadados Técnicos */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-800">Digitalização e Metadados Técnicos</h3>
              </div>
              <div className="text-sm text-orange-600 mb-4 bg-orange-100 p-2 rounded">
                <FileText className="h-4 w-4 inline mr-1" />
                Campos obrigatórios conforme normas internacionais de arquivos
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Data da Digitalização */}
                <div>
                  <Label htmlFor="digitalizationDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data da Digitalização *
                  </Label>
                  <Input
                    id="digitalizationDate"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                  {renderAnnotationSection('digitalizationDate')}
                </div>
                
                {/* Local da Digitalização */}
                <div>
                  <Label htmlFor="digitalizationLocation" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Local da Digitalização *
                  </Label>
                  <Input
                    id="digitalizationLocation"
                    placeholder="Ex: CBA, IMPL, Cuiabá-MT"
                  />
                  {renderAnnotationSection('digitalizationLocation')}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Identificador Digital */}
                <div>
                  <Label htmlFor="digitalId" className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Identificador Digital *
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Automático</span>
                  </Label>
                  <Input
                    id="digitalId"
                    defaultValue={`ATOM-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`}
                    readOnly
                    disabled
                    className="bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Gerado automaticamente pelo sistema</p>
                  {renderAnnotationSection('digitalId')}
                </div>
                
                {/* Responsável pela Digitalização */}
                <div>
                  <Label htmlFor="digitalizationResponsible" className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Responsável pela Digitalização *
                  </Label>
                  <Input
                    id="digitalizationResponsible"
                    placeholder="Ex: CARDOSO SILVA & CIA LTDA"
                  />
                  {renderAnnotationSection('digitalizationResponsible')}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Autoridade do Documento */}
                <div>
                  <Label htmlFor="documentAuthority" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Autoridade do Documento *
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a autoridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prefeito">Prefeito Municipal</SelectItem>
                      <SelectItem value="secretario">Secretário Municipal</SelectItem>
                      <SelectItem value="diretor">Diretor de Departamento</SelectItem>
                      <SelectItem value="coordenador">Coordenador</SelectItem>
                      <SelectItem value="chefe-divisao">Chefe de Divisão</SelectItem>
                      <SelectItem value="procurador">Procurador Jurídico</SelectItem>
                      <SelectItem value="controlador">Controlador</SelectItem>
                      <SelectItem value="presidente-camara">Presidente da Câmara</SelectItem>
                      <SelectItem value="vereador">Vereador</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderAnnotationSection('documentAuthority')}
                </div>
                
                {/* Soma de verificação */}
                <div>
                  <Label htmlFor="verificationHash" className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Hash de Verificação
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Automático</span>
                  </Label>
                  <Input
                    id="verificationHash"
                    value="Será gerado automaticamente"
                    readOnly
                    disabled
                    className="bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-green-600 mt-1">
                    <Shield className="h-3 w-3 inline mr-1" />
                    Hash SHA-256 gerado automaticamente para verificação de integridade
                  </p>
                  {renderAnnotationSection('verificationHash')}
                </div>
              </div>
            </div>

            {/* Botões do rodapé */}
            <div className="border-t bg-gray-50 p-4 flex justify-between">
              <Button variant="outline">
                Cancelar
              </Button>
              <div className="flex gap-2">
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Salvar Documento
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open('/validacao-anotacoes', '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Anotações
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}