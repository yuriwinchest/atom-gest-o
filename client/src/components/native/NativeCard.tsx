// Componente de card nativo seguindo SOLID principles
import React from 'react';
import { Card, CardProps } from '@/components/ui/card';
import { useNativeAnimations } from '@/hooks/useNativeAnimations';
import { cn } from '@/lib/utils';

interface NativeCardProps extends CardProps {
  nativeVariant?: 'default' | 'interactive' | 'elevated' | 'glassmorphism';
  withHover?: boolean;
  withPress?: boolean;
  isSelected?: boolean;
  children: React.ReactNode;
}

export function NativeCard({ 
  children, 
  className,
  nativeVariant = 'default',
  withHover = true,
  withPress = false,
  isSelected = false,
  ...props 
}: NativeCardProps) {
  const { card, interactions, native } = useNativeAnimations();

  const getNativeCardStyles = () => {
    const baseStyles = "transition-all duration-300 ease-out overflow-hidden";
    
    switch (nativeVariant) {
      case 'default':
        return cn(
          baseStyles,
          "bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-800/50"
        );
      case 'interactive':
        return cn(
          baseStyles,
          "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/50 dark:border-gray-800/50 cursor-pointer"
        );
      case 'elevated':
        return cn(
          baseStyles,
          "bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-0"
        );
      case 'glassmorphism':
        return cn(
          baseStyles,
          "bg-white/10 dark:bg-gray-900/10 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-gray-800/20 shadow-2xl"
        );
      default:
        return baseStyles;
    }
  };

  const combinedClassName = cn(
    getNativeCardStyles(),
    card.enter,
    withHover && card.hover,
    withPress && "active:scale-[0.98] active:shadow-lg",
    isSelected && card.select,
    className
  );

  return (
    <Card className={combinedClassName} {...props}>
      {children}
    </Card>
  );
}

// Variações específicas para facilitar uso
export function NativeInteractiveCard(props: Omit<NativeCardProps, 'nativeVariant'>) {
  return <NativeCard nativeVariant="interactive" withHover withPress {...props} />;
}

export function NativeElevatedCard(props: Omit<NativeCardProps, 'nativeVariant'>) {
  return <NativeCard nativeVariant="elevated" {...props} />;
}

export function NativeGlassmorphismCard(props: Omit<NativeCardProps, 'nativeVariant'>) {
  return <NativeCard nativeVariant="glassmorphism" {...props} />;
}