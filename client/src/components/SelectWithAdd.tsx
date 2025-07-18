import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectWithAddProps {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  onAddOption: (option: string) => void;
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

  // Auto-select newly added option
  useEffect(() => {
    if (lastAddedOption && options.includes(lastAddedOption)) {
      onValueChange(lastAddedOption);
      setLastAddedOption(null);
    }
  }, [options, lastAddedOption, onValueChange]);

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      const trimmedOption = newOption.trim();
      onAddOption(trimmedOption);
      setLastAddedOption(trimmedOption);
      setNewOption('');
      setIsAdding(false);
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
          disabled={!newOption.trim()}
        >
          <Plus className="h-4 w-4" />
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
          {options.map((option) => (
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