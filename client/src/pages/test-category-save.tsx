import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DocumentFormModal from '@/components/DocumentFormModal';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

export default function TestCategorySave() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] = useState<any>(null);
  const { toast } = useToast();

  const handleDocumentSubmit = async (
    formData: any,
    mainFile: File,
    additionalImages: File[]
  ) => {
    console.log('🎯 TESTE COMPLETO - Dados recebidos no submit:', {
      formData,
      mainFile: mainFile?.name,
      additionalImages: additionalImages.length,
      // Verificações específicas dos campos com SelectWithInlineEdit
      documentType: formData.documentType,
      publicOrgan: formData.publicOrgan,
      responsibleSector: formData.responsibleSector,
      mainSubject: formData.mainSubject,
      confidentialityLevel: formData.confidentialityLevel
    });

    // Salvar dados para exibição
    setLastSubmittedData({
      timestamp: new Date().toISOString(),
      formData,
      mainFile: mainFile?.name,
      additionalImages: additionalImages.length
    });

    // Simular sucesso
    toast({
      title: "Teste Concluído!",
      description: "Verifique os dados abaixo para confirmar se as categorias foram salvas.",
    });

    // Fechar modal
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-purple-700">
            <Shield className="h-8 w-8" />
            Teste Definitivo - Salvamento de Categorias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Instruções do Teste:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Clique em "Abrir Formulário"</li>
              <li>Em qualquer campo com "+", clique no "+" para adicionar uma nova categoria</li>
              <li>Digite um nome único (ex: "TESTE_CATEGORIA_2025")</li>
              <li>Clique no ✓ para salvar</li>
              <li>Preencha os campos obrigatórios e envie o formulário</li>
              <li>Verifique abaixo se a categoria aparece nos dados enviados</li>
            </ol>
          </div>

          <Button 
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Abrir Formulário de Teste
          </Button>

          {lastSubmittedData && (
            <div className="mt-8 bg-gray-100 p-6 rounded-lg">
              <h3 className="font-bold text-xl mb-4 text-green-700">
                ✅ Dados Recebidos no Submit:
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded shadow">
                  <h4 className="font-bold text-blue-600 mb-2">Timestamp:</h4>
                  <p>{lastSubmittedData.timestamp}</p>
                </div>

                <div className="bg-white p-4 rounded shadow">
                  <h4 className="font-bold text-blue-600 mb-2">Campos com SelectWithInlineEdit:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">Tipo do Documento:</span>
                      <span className={lastSubmittedData.formData.documentType ? 'text-green-600 font-bold' : 'text-red-600'}>
                        {lastSubmittedData.formData.documentType || 'NÃO SALVOU ❌'}
                      </span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">Órgão Público:</span>
                      <span className={lastSubmittedData.formData.publicOrgan ? 'text-green-600 font-bold' : 'text-red-600'}>
                        {lastSubmittedData.formData.publicOrgan || 'NÃO SALVOU ❌'}
                      </span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">Setor Responsável:</span>
                      <span className={lastSubmittedData.formData.responsibleSector ? 'text-green-600 font-bold' : 'text-red-600'}>
                        {lastSubmittedData.formData.responsibleSector || 'NÃO SALVOU ❌'}
                      </span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">Assunto Principal:</span>
                      <span className={lastSubmittedData.formData.mainSubject ? 'text-green-600 font-bold' : 'text-red-600'}>
                        {lastSubmittedData.formData.mainSubject || 'NÃO SALVOU ❌'}
                      </span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">Nível de Confidencialidade:</span>
                      <span className={lastSubmittedData.formData.confidentialityLevel ? 'text-green-600 font-bold' : 'text-red-600'}>
                        {lastSubmittedData.formData.confidentialityLevel || 'NÃO SALVOU ❌'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded shadow">
                  <h4 className="font-bold text-blue-600 mb-2">Dados Completos (JSON):</h4>
                  <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                    {JSON.stringify(lastSubmittedData.formData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <DocumentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleDocumentSubmit}
      />
    </div>
  );
}