import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Option {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

interface SelectWithAddDBProps {
  value: string;
  onValueChange: (value: string) => void;
  apiEndpoint: string; // ex: "/api/confidentiality-levels"
  label: string; // ex: "Nível de Confidencialidade"
  placeholder?: string;
  className?: string;
}

export function SelectWithAddDB({
  value,
  onValueChange,
  apiEndpoint,
  label,
  placeholder = "Selecione uma opção",
  className
}: SelectWithAddDBProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newOption, setNewOption] = useState('');
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

  // Converter para array de strings (compatível com SelectWithAdd original)
  const optionNames = options.map(opt => opt.name);

  // Auto-select newly added option
  useEffect(() => {
    if (lastAddedOption && optionNames.includes(lastAddedOption)) {
      onValueChange(lastAddedOption);
      setLastAddedOption(null);
    }
  }, [optionNames, lastAddedOption, onValueChange]);

  // Mutation para criar nova opção
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Erro ao criar opção");
      return response.json();
    },
    onSuccess: (newOption) => {
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      setLastAddedOption(newOption.name);
      setNewOption('');
      setIsAdding(false);
      toast({
        title: "Sucesso!",
        description: `${label} "${newOption.name}" criado com sucesso.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Erro ao criar ${label}: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleAddOption = () => {
    if (newOption.trim() && !optionNames.includes(newOption.trim())) {
      const trimmedOption = newOption.trim();
      createMutation.mutate({
        name: trimmedOption,
        description: undefined
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOption();
    }
  };

  if (isAdding) {
    return (
      <div className="flex gap-2">
        <Input
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite nova opção..."
          className={cn("flex-1", className)}
          autoFocus
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddOption}
          disabled={!newOption.trim() || createMutation.isPending}
        >
          {createMutation.isPending ? "..." : <Plus className="h-4 w-4" />}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setIsAdding(false);
            setNewOption('');
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn("flex-1", className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {optionNames.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsAdding(true)}
        title="Adicionar nova opção"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}