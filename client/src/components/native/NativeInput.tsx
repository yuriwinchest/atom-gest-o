// Componente de input nativo seguindo SOLID principles
import React from 'react';
import { Input, InputProps } from '@/components/ui/input';
import { useNativeAnimations } from '@/hooks/useNativeAnimations';
import { cn } from '@/lib/utils';

interface NativeInputProps extends InputProps {
  nativeVariant?: 'default' | 'search' | 'floating' | 'rounded';
  withFocus?: boolean;
  withBorder?: boolean;
}

export function NativeInput({ 
  className,
  nativeVariant = 'default',
  withFocus = true,
  withBorder = true,
  ...props 
}: NativeInputProps) {
  const { native, utils } = useNativeAnimations();

  const getNativeInputStyles = () => {
    const baseStyles = "transition-all duration-200 ease-out";
    
    switch (nativeVariant) {
      case 'search':
        return cn(
          baseStyles,
          "rounded-xl border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm",
          withFocus && "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500"
        );
      case 'floating':
        return cn(
          baseStyles,
          "rounded-2xl border-0 bg-gray-100 dark:bg-gray-800 shadow-inner",
          withFocus && "focus:ring-2 focus:ring-blue-500 focus:shadow-lg focus:bg-white dark:focus:bg-gray-700"
        );
      case 'rounded':
        return cn(
          baseStyles,
          "rounded-full border-gray-300 dark:border-gray-600",
          withFocus && "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        );
      default:
        return cn(
          baseStyles,
          "rounded-xl",
          withBorder && "border-gray-200 dark:border-gray-700",
          withFocus && "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        );
    }
  };

  return (
    <Input
      className={cn(getNativeInputStyles(), className)}
      {...props}
    />
  );
}