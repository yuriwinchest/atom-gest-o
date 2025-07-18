import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SelectWithAddInlineProps {
  value: string;
  onValueChange: (value: string) => void;
  apiEndpoint: string;
  label: string;
  placeholder?: string;
  className?: string;
}

export function SelectWithAddInline({
  value,
  onValueChange,
  apiEndpoint,
  label,
  placeholder = "Digite ou selecione...",
  className
}: SelectWithAddInlineProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(value || '');
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch options from API
  const { data: options = [], isLoading } = useQuery({
    queryKey: [apiEndpoint],
    queryFn: async () => {
      const response = await fetch(apiEndpoint, {
        credentials: 'same-origin'
      });
      if (!response.ok) throw new Error('Failed to fetch options');
      return response.json();
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (newValue: string) => {
      return apiRequest(`${apiEndpoint}`, {
        method: 'POST',
        body: JSON.stringify({ name: newValue })
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      onValueChange(data.name);
      setInputValue(data.name);
      setIsExpanded(false);
      setIsTyping(false);
      toast({
        title: 'Opção adicionada',
        description: `"${data.name}" foi adicionado com sucesso.`
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Falha ao adicionar nova opção.',
        variant: 'destructive'
      });
    }
  });

  // Sync input value with prop value
  useEffect(() => {
    if (!isTyping) {
      setInputValue(value || '');
    }
  }, [value, isTyping]);

  // Filter options based on input
  const filteredOptions = options.filter((opt: any) =>
    opt.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setIsTyping(false);
        setCurrentIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    setCurrentIndex(-1);
    if (!isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isExpanded) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsExpanded(true);
        setCurrentIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setCurrentIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setCurrentIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (currentIndex >= 0 && currentIndex < filteredOptions.length) {
          selectOption(filteredOptions[currentIndex]);
        } else {
          handleAddNew();
        }
        break;
      case 'Escape':
        setIsExpanded(false);
        setIsTyping(false);
        setCurrentIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const selectOption = (option: any) => {
    onValueChange(option.name);
    setInputValue(option.name);
    setIsExpanded(false);
    setIsTyping(false);
    setCurrentIndex(-1);
  };

  const handleAddNew = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !options.find((opt: any) => 
      opt.name.toLowerCase() === trimmedValue.toLowerCase())
    ) {
      createMutation.mutate(trimmedValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsTyping(true);
    setCurrentIndex(-1);
  };

  const handleInputFocus = () => {
    // Não expandir automaticamente no foco
  };

  const displayValue = isExpanded && currentIndex >= 0 && currentIndex < filteredOptions.length
    ? filteredOptions[currentIndex].name
    : inputValue;

  return (
    <div className="space-y-1" ref={containerRef}>
      <div className="flex gap-1">
        <Input
          ref={inputRef}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={isExpanded ? "Digite para buscar ou criar..." : placeholder}
          className={cn(
            "flex-1",
            isExpanded && "border-blue-500 ring-1 ring-blue-500",
            className
          )}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExpand}
          className="px-2"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (inputValue.trim()) {
              handleAddNew();
            } else {
              inputRef.current?.focus();
            }
          }}
          disabled={createMutation.isPending}
          title={inputValue.trim() ? `Adicionar "${inputValue}" como nova opção` : "Digite algo para criar"}
          className="px-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isExpanded && (
        <div className="bg-gray-50 border rounded-md p-2 space-y-1 max-h-32 overflow-y-auto">
          {isLoading ? (
            <div className="text-sm text-gray-500 px-2 py-1">Carregando opções...</div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((option: any, index: number) => (
              <button
                key={option.id}
                type="button"
                className={cn(
                  "w-full text-left px-2 py-1 rounded text-sm transition-colors",
                  currentIndex === index
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-200"
                )}
                onClick={() => selectOption(option)}
                onMouseEnter={() => setCurrentIndex(index)}
              >
                {option.name}
              </button>
            ))
          ) : (
            <div className="text-sm text-gray-500 px-2 py-1">
              {inputValue.trim() ? 
                `Pressione "+" para criar "${inputValue}"` : 
                'Digite para buscar opções'
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}