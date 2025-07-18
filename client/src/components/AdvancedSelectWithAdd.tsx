import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Option {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

interface AdvancedSelectWithAddProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  apiEndpoint: string; // ex: "/api/confidentiality-levels"
  label: string; // ex: "Nível de Confidencialidade"
  className?: string;
}

export function AdvancedSelectWithAdd({
  value,
  onValueChange,
  placeholder = "Selecione uma opção...",
  apiEndpoint,
  label,
  className = ""
}: AdvancedSelectWithAddProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionDescription, setNewOptionDescription] = useState("");

  const [lastAddedOption, setLastAddedOption] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar opções existentes
  const { data: options = [], isLoading } = useQuery({
    queryKey: [apiEndpoint],
    queryFn: async () => {
      const response = await fetch(apiEndpoint);
      if (!response.ok) throw new Error("Erro ao buscar opções");
      return response.json() as Option[];
    }
  });

  // Efeito para selecionar automaticamente a nova opção quando ela estiver disponível
  useEffect(() => {
    if (lastAddedOption && options.length > 0) {
      const newOption = options.find(option => option.name === lastAddedOption);
      if (newOption) {
        console.log(`✅ Selecionando automaticamente: ${lastAddedOption}`);
        onValueChange(lastAddedOption);
        setLastAddedOption(null); // Limpar após selecionar
      }
    }
  }, [options, lastAddedOption, onValueChange]);

  // Mutation para criar nova opção
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      try {
        console.log("🔥 INICIANDO CRIAÇÃO", { label, apiEndpoint, data });
        
        // Verificar se o endpoint não suporta description
        const noDescriptionEndpoints = [
          "/api/document-types",
          "/api/public-organs",
          "/api/responsible-sectors",
          "/api/main-subjects",
          "/api/confidentiality-levels",
          "/api/availability-options",
          "/api/language-options",
          "/api/rights-options",
          "/api/document-authorities"
        ];
        
        const payloadData = noDescriptionEndpoints.includes(apiEndpoint) 
          ? { name: data.name } 
          : data;
        
        console.log(`📤 Enviando para ${apiEndpoint}:`, payloadData);
        console.log("📦 JSON sendo enviado:", JSON.stringify(payloadData));
        alert(`🚀 Criando ${label}: "${payloadData.name}" em ${apiEndpoint}`);
        
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(payloadData)
        });
        
        console.log("📡 Response status:", response.status);
        console.log("📡 Response headers:", response.headers);
        
        const responseText = await response.text();
        console.log(`📥 Resposta de ${apiEndpoint}:`, response.status, responseText);
        
        if (!response.ok) {
          console.error("❌ ERRO NA RESPOSTA:", response.status, responseText);
          let errorMessage = "Erro desconhecido";
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (e) {
            errorMessage = responseText || errorMessage;
          }
          alert(`❌ Erro: ${errorMessage}`);
          throw new Error(errorMessage);
        }
        
        console.log("✅ ANTES DO PARSE:", responseText);
        const result = JSON.parse(responseText);
        console.log("✅ DEPOIS DO PARSE:", result);
        alert(`✅ Sucesso! Criado com ID: ${result.id}`);
        return result;
      } catch (error) {
        console.error("💥 ERRO COMPLETO NO CATCH:", error);
        console.error("💥 Stack trace:", error.stack);
        alert(`💥 Erro crítico: ${error.message}`);
        throw error;
      }
    },
    onSuccess: (newOption) => {
      console.log(`✅ Sucesso ao criar ${label}:`, newOption);
      
      // Invalidar query com força
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      
      // Forçar refetch imediato
      queryClient.refetchQueries({ queryKey: [apiEndpoint] });
      
      setIsDialogOpen(false);
      setNewOptionName("");
      setNewOptionDescription("");
      // Marcar para seleção automática quando estiver disponível na lista
      setLastAddedOption(newOption.name);
      toast({
        title: "Sucesso!",
        description: `${label} "${newOption.name}" criado com sucesso.`
      });
    },
    onError: (error: any) => {
      console.error(`❌ Erro ao criar ${label}:`, error);
      toast({
        title: "Erro",
        description: `Erro ao criar ${label}: ${error.message}`,
        variant: "destructive"
      });
    }
  });



  const handleCreate = () => {
    console.log("🎯 handleCreate CHAMADO!");
    console.log("🎯 newOptionName:", newOptionName);
    console.log("🎯 newOptionDescription:", newOptionDescription);
    console.log("🎯 apiEndpoint:", apiEndpoint);
    console.log("🎯 label:", label);
    
    if (!newOptionName.trim()) {
      console.error("❌ Nome vazio, retornando...");
      return;
    }
    
    console.log("🚀 Chamando mutation.mutate com:", {
      name: newOptionName.trim(),
      description: newOptionDescription.trim() || undefined
    });
    
    createMutation.mutate({
      name: newOptionName.trim(),
      description: newOptionDescription.trim() || undefined
    });
  };



  // Separar opções originais (IDs 1-6) das criadas pelo usuário (ID > 6)
  const originalOptions = options.filter(opt => opt.id <= 6);
  const userCreatedOptions = options.filter(opt => opt.id > 6);

  return (
    <div className={className}>
      <div className="flex gap-2">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {/* Opções originais (não editáveis) */}
            {originalOptions.map((option) => (
              <SelectItem key={option.id} value={option.name}>
                {option.name}
              </SelectItem>
            ))}
            
            {/* Separador se houver opções criadas pelo usuário */}
            {userCreatedOptions.length > 0 && originalOptions.length > 0 && (
              <div className="border-t my-1" />
            )}
            
            {/* Opções criadas pelo usuário */}
            {userCreatedOptions.map((option) => (
              <SelectItem key={option.id} value={option.name}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="px-3">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar {label}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  placeholder={`Nome do ${label.toLowerCase()}`}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  value={newOptionDescription}
                  onChange={(e) => setNewOptionDescription(e.target.value)}
                  placeholder="Descrição opcional"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={!newOptionName.trim() || createMutation.isPending}
                >
                  {createMutation.isPending ? "Criando..." : "Criar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>


    </div>
  );
}