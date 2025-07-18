import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectWithAddProps {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  onAddOption: (newOption: string) => void;
  placeholder?: string;
  className?: string;
}

export function SelectWithAdd({ 
  value, 
  onValueChange, 
  options, 
  onAddOption, 
  placeholder = "Selecione uma opção",
  className 
}: SelectWithAddProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newOption, setNewOption] = useState('');
  const [lastAddedOption, setLastAddedOption] = useState<string | null>(null);

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      const trimmedOption = newOption.trim();
      
      // Primeiro adiciona a opção à lista
      onAddOption(trimmedOption);
      
      // Marca a opção como recém-adicionada para seleção automática
      setLastAddedOption(trimmedOption);
      
      setNewOption('');
      setIsAdding(false);
    }
  };

  // Efeito para selecionar automaticamente a nova opção quando ela estiver disponível
  useEffect(() => {
    if (lastAddedOption && options.includes(lastAddedOption)) {
      onValueChange(lastAddedOption);
      setLastAddedOption(null);
    }
  }, [options, lastAddedOption, onValueChange]);

  // Efeito para selecionar automaticamente a nova opção quando ela estiver disponível
  useEffect(() => {
    if (lastAddedOption && options.includes(lastAddedOption)) {
      onValueChange(lastAddedOption);
      setLastAddedOption(null);
    }
  }, [options, lastAddedOption, onValueChange]);

  const handleCancelAdd = () => {
    setNewOption('');
    setIsAdding(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
          {!isAdding && (
            <div className="border-t border-gray-200 pt-1 mt-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar nova opção
              </Button>
            </div>
          )}
        </SelectContent>
      </Select>

      {isAdding && (
        <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-md bg-gray-50">
          <Input
            placeholder="Digite a nova opção"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddOption();
              } else if (e.key === 'Escape') {
                handleCancelAdd();
              }
            }}
            className="flex-1"
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleAddOption}
            disabled={!newOption.trim() || options.includes(newOption.trim())}
            className="px-2"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancelAdd}
            className="px-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}