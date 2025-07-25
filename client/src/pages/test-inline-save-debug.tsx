import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SelectWithInlineEdit } from '@/components/SelectWithInlineEdit';
import { useToast } from '@/hooks/use-toast';

export function TestInlineSaveDebug() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    documentType: '',
    publicOrgan: '',
    responsibleSector: '',
    mainSubject: '',
    confidentialityLevel: ''
  });

  const updateField = (field: string, value: string) => {
    console.log(`🔵 Atualizando campo ${field} com valor:`, value);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('🔵 Novo estado do formulário:', newData);
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 SUBMIT - Dados do formulário:', formData);
    
    // Simular salvamento
    const payload = {
      title: 'Documento de teste',
      content: JSON.stringify({
        documentType: formData.documentType,
        publicOrgan: formData.publicOrgan,
        responsibleSector: formData.responsibleSector,
        mainSubject: formData.mainSubject,
        confidentialityLevel: formData.confidentialityLevel
      })
    };
    
    console.log('📦 Payload enviado:', payload);
    
    toast({
      title: "Dados do formulário",
      description: `Tipo: ${formData.documentType}, Órgão: ${formData.publicOrgan}`
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug - Salvamento de Campos Inline</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tipo do Documento (valor atual: {formData.documentType || 'vazio'})
            </label>
            <SelectWithInlineEdit
              value={formData.documentType}
              onValueChange={(value) => updateField('documentType', value)}
              placeholder="Selecione o tipo"
              apiEndpoint="/api/document-types"
              label="Tipo de Documento"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Órgão Público (valor atual: {formData.publicOrgan || 'vazio'})
            </label>
            <SelectWithInlineEdit
              value={formData.publicOrgan}
              onValueChange={(value) => updateField('publicOrgan', value)}
              placeholder="Selecione o órgão"
              apiEndpoint="/api/public-organs"
              label="Órgão Público"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Setor Responsável (valor atual: {formData.responsibleSector || 'vazio'})
            </label>
            <SelectWithInlineEdit
              value={formData.responsibleSector}
              onValueChange={(value) => updateField('responsibleSector', value)}
              placeholder="Selecione o setor"
              apiEndpoint="/api/responsible-sectors"
              label="Setor Responsável"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Assunto Principal (valor atual: {formData.mainSubject || 'vazio'})
            </label>
            <SelectWithInlineEdit
              value={formData.mainSubject}
              onValueChange={(value) => updateField('mainSubject', value)}
              placeholder="Selecione o assunto"
              apiEndpoint="/api/main-subjects"
              label="Assunto Principal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Nível de Confidencialidade (valor atual: {formData.confidentialityLevel || 'vazio'})
            </label>
            <SelectWithInlineEdit
              value={formData.confidentialityLevel}
              onValueChange={(value) => updateField('confidentialityLevel', value)}
              placeholder="Selecione o nível"
              apiEndpoint="/api/confidentiality-levels"
              label="Nível de Confidencialidade"
            />
          </div>

          <div className="pt-4 border-t">
            <Button type="submit" className="w-full">
              Submeter Formulário
            </Button>
          </div>

          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Estado atual do formulário:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </form>
      </Card>
    </div>
  );
}