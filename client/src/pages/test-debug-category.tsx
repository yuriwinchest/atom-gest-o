import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DocumentFormModal from "@/components/DocumentFormModal";
import { useToast } from "@/hooks/use-toast";

export default function TestDebugCategory() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`🔍 ${message}`);
  };

  const handleDocumentSubmit = async (
    formData: any,
    mainFile: File | null,
    additionalImages: File[]
  ) => {
    addLog("=== INICIANDO SUBMIT DO FORMULÁRIO ===");
    addLog(`Dados recebidos: ${JSON.stringify(formData, null, 2)}`);
    
    try {
      // Verificar campos críticos
      addLog(`documentType: "${formData.documentType}"`);
      addLog(`publicOrgan: "${formData.publicOrgan}"`);
      addLog(`mainSubject: "${formData.mainSubject}"`);
      
      // Simular envio para API
      if (!mainFile) {
        throw new Error("Arquivo principal não selecionado");
      }

      const uploadFormData = new FormData();
      uploadFormData.append("documentData", JSON.stringify(formData));
      uploadFormData.append("file", mainFile);
      
      additionalImages.forEach((img, index) => {
        uploadFormData.append(`additionalImage${index}`, img);
      });

      addLog("Enviando para API...");
      
      const response = await fetch("/api/supabase-upload-formdata", {
        method: "POST",
        credentials: "same-origin",
        body: uploadFormData,
      });

      const result = await response.json();
      
      if (result.success) {
        addLog(`✅ SUCESSO! Documento criado com ID: ${result.documentId}`);
        
        // Verificar o documento salvo
        const docResponse = await fetch(`/api/documents/${result.documentId}`);
        const savedDoc = await docResponse.json();
        const content = JSON.parse(savedDoc.content || "{}");
        
        addLog("=== DADOS SALVOS NO BANCO ===");
        addLog(`documentType salvo: "${content.documentType}"`);
        addLog(`publicOrgan salvo: "${content.publicOrgan}"`);
        
        toast({
          title: "Documento criado!",
          description: `ID: ${result.documentId}`,
        });
      } else {
        throw new Error(result.error || "Erro desconhecido");
      }
      
    } catch (error: any) {
      addLog(`❌ ERRO: ${error.message}`);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">🧪 Debug de Categorias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={() => setIsModalOpen(true)}>
              Abrir Formulário
            </Button>
            <Button variant="outline" onClick={clearLogs}>
              Limpar Logs
            </Button>
          </div>

          <Card className="bg-gray-900 text-gray-100">
            <CardHeader>
              <CardTitle className="text-lg">Console de Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-gray-500">Aguardando ações...</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">📋 Instruções</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>1. Clique em "Abrir Formulário"</p>
              <p>2. Em qualquer campo com "+", clique no botão "+"</p>
              <p>3. Digite um nome único (ex: "TESTE_DEBUG_123")</p>
              <p>4. Clique em "Salvar" (botão verde)</p>
              <p>5. Preencha os campos obrigatórios e envie</p>
              <p>6. Observe os logs abaixo e no console (F12)</p>
            </CardContent>
          </Card>
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