import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export function TestCreateType() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleCreate = async () => {
    console.log("🚀 TESTE: Iniciando criação com nome:", name);
    setLoading(true);
    
    try {
      const payload = { name: name.trim() };
      console.log("📦 TESTE: Payload:", payload);
      
      const response = await fetch('/api/document-types', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      
      console.log("📡 TESTE: Response status:", response.status);
      const text = await response.text();
      console.log("📥 TESTE: Response text:", text);
      
      if (!response.ok) {
        throw new Error(text);
      }
      
      const result = JSON.parse(text);
      console.log("✅ TESTE: Sucesso!", result);
      
      toast({
        title: "Sucesso!",
        description: `Tipo criado com ID: ${result.id}`
      });
      
      setName('');
    } catch (error) {
      console.error("❌ TESTE: Erro completo:", error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border">
      <h3 className="font-bold mb-2">Teste de Criação de Tipo</h3>
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do tipo"
          className="w-48"
        />
        <Button 
          onClick={handleCreate}
          disabled={!name.trim() || loading}
        >
          {loading ? 'Criando...' : 'Criar'}
        </Button>
      </div>
    </div>
  );
}