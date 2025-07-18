// Componente de botão nativo seguindo SOLID principles
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useNativeAnimations } from '@/hooks/useNativeAnimations';
import { cn } from '@/lib/utils';

interface NativeButtonProps extends ButtonProps {
  nativeVariant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  withRipple?: boolean;
  withHaptic?: boolean;
  isLoading?: boolean;
}

export function NativeButton({ 
  children, 
  className,
  nativeVariant = 'primary',
  withRipple = true,
  withHaptic = true,
  isLoading = false,
  disabled,
  ...props 
}: NativeButtonProps) {
  const { button, interactions, utils, native } = useNativeAnimations();

  const getNativeButtonStyles = () => {
    const baseStyles = "font-semibold transition-all duration-200 ease-out rounded-2xl shadow-lg";
    
    switch (nativeVariant) {
      case 'primary':
        return cn(
          baseStyles,
          "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl",
          "px-6 py-3 text-base"
        );
      case 'secondary':
        return cn(
          baseStyles,
          "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700",
          "hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl",
          "px-6 py-3 text-base"
        );
      case 'ghost':
        return cn(
          "font-medium transition-all duration-200 ease-out rounded-xl",
          "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
          "px-4 py-2 text-sm"
        );
      case 'destructive':
        return cn(
          baseStyles,
          "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl",
          "px-6 py-3 text-base"
        );
      default:
        return baseStyles;
    }
  };

  const combinedClassName = cn(
    getNativeButtonStyles(),
    button.press,
    button.hover,
    withRipple && interactions.ripple,
    withHaptic && "active:scale-[0.96]",
    isLoading && button.loading,
    disabled && "opacity-50 cursor-not-allowed",
    className
  );

  return (
    <Button
      className={combinedClassName}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Carregando...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
}

// Variações específicas para facilitar uso
export function NativePrimaryButton(props: Omit<NativeButtonProps, 'nativeVariant'>) {
  return <NativeButton nativeVariant="primary" {...props} />;
}

export function NativeSecondaryButton(props: Omit<NativeButtonProps, 'nativeVariant'>) {
  return <NativeButton nativeVariant="secondary" {...props} />;
}

export function NativeGhostButton(props: Omit<NativeButtonProps, 'nativeVariant'>) {
  return <NativeButton nativeVariant="ghost" {...props} />;
}

export function NativeDestructiveButton(props: Omit<NativeButtonProps, 'nativeVariant'>) {
  return <NativeButton nativeVariant="destructive" {...props} />;
}