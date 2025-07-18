import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Option {
  id: number;
  name: string;
  created_at: string;
}

interface SelectWithInlineEditProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  apiEndpoint: string;
  label: string;
  className?: string;
}

export function SelectWithInlineEdit({
  value,
  onValueChange,
  placeholder = "Selecione uma opção...",
  apiEndpoint,
  label,
  className = ""
}: SelectWithInlineEditProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [newValue, setNewValue] = useState("");
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
        onValueChange(lastAddedOption);
        setLastAddedOption(null);
      }
    }
  }, [options, lastAddedOption, onValueChange]);

  // Mutation para criar nova opção
  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Erro ao criar opção";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sucesso!",
        description: `${label} "${data.name}" criado com sucesso!`,
      });
      
      // Definir como última opção adicionada
      setLastAddedOption(data.name);
      
      // Limpar campo e sair do modo de edição
      setNewValue("");
      setIsEditMode(false);
      
      // Invalidar cache para atualizar lista
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    if (newValue.trim()) {
      createMutation.mutate(newValue.trim());
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setNewValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newValue.trim()) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditMode) {
    return (
      <div className="flex gap-2 flex-1">
        <Input
          placeholder={`Digite ou cole o novo ${label.toLowerCase()}...`}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={handleKeyPress}
          autoFocus
          className="flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={!newValue.trim() || createMutation.isPending}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          Salvar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
        >
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Select 
        value={value} 
        onValueChange={onValueChange}
        disabled={isLoading}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.name}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEditMode(true)}
        className="bg-green-500 hover:bg-green-600 text-white"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}