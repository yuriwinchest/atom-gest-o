// Componente de modal nativo seguindo SOLID principles
import React from 'react';
import { Dialog, DialogContent, DialogContentProps, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useNativeAnimations } from '@/hooks/useNativeAnimations';
import { cn } from '@/lib/utils';

interface NativeModalProps extends DialogContentProps {
  isOpen: boolean;
  onClose: () => void;
  nativeVariant?: 'default' | 'fullscreen' | 'bottom-sheet' | 'center-sheet';
  withBlur?: boolean;
  children: React.ReactNode;
}

export function NativeModal({ 
  children, 
  className,
  isOpen,
  onClose,
  nativeVariant = 'default',
  withBlur = true,
  ...props 
}: NativeModalProps) {
  const { modal, native } = useNativeAnimations();

  const getNativeModalStyles = () => {
    const baseStyles = "relative overflow-hidden border-0 transition-all duration-300 ease-out";
    
    switch (nativeVariant) {
      case 'default':
        return cn(
          baseStyles,
          "bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl max-w-[95vw] max-h-[90vh]",
          withBlur && "backdrop-blur-lg"
        );
      case 'fullscreen':
        return cn(
          baseStyles,
          "bg-white dark:bg-gray-900 rounded-none w-screen h-screen max-w-none max-h-none"
        );
      case 'bottom-sheet':
        return cn(
          baseStyles,
          "bg-white/95 dark:bg-gray-900/95 rounded-t-3xl shadow-2xl w-full max-w-none",
          "fixed bottom-0 left-0 right-0 max-h-[90vh]",
          withBlur && "backdrop-blur-lg"
        );
      case 'center-sheet':
        return cn(
          baseStyles,
          "bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl max-w-2xl w-full mx-auto",
          "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
          withBlur && "backdrop-blur-lg"
        );
      default:
        return baseStyles;
    }
  };

  const getBackdropStyles = () => {
    return cn(
      "fixed inset-0 z-50",
      withBlur ? "backdrop-blur-sm bg-black/20 dark:bg-black/40" : "bg-black/50"
    );
  };

  const combinedClassName = cn(
    getNativeModalStyles(),
    modal.enter,
    className
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={combinedClassName}
        onEscapeKeyDown={onClose}
        onPointerDownOutside={onClose}
        {...props}
      >
        <div className="sr-only">
          <DialogTitle>Modal Dialog</DialogTitle>
          <DialogDescription>Modal content</DialogDescription>
        </div>
        {children}
      </DialogContent>
    </Dialog>
  );
}

// Header nativo para modal
export function NativeModalHeader({ 
  children, 
  className,
  withBorder = true 
}: { 
  children: React.ReactNode; 
  className?: string;
  withBorder?: boolean;
}) {
  return (
    <div className={cn(
      "sticky top-0 z-10 px-6 py-4",
      "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm",
      withBorder && "border-b border-gray-100 dark:border-gray-800",
      className
    )}>
      {children}
    </div>
  );
}

// Body nativo para modal
export function NativeModalBody({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn(
      "flex-1 px-6 py-4 overflow-y-auto",
      "max-h-[calc(90vh-120px)]",
      className
    )}>
      {children}
    </div>
  );
}

// Footer nativo para modal
export function NativeModalFooter({ 
  children, 
  className,
  withBorder = true 
}: { 
  children: React.ReactNode; 
  className?: string;
  withBorder?: boolean;
}) {
  return (
    <div className={cn(
      "sticky bottom-0 z-10 px-6 py-4",
      "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm",
      withBorder && "border-t border-gray-100 dark:border-gray-800",
      className
    )}>
      {children}
    </div>
  );
}

// Variações específicas para facilitar uso
export function NativeBottomSheetModal(props: Omit<NativeModalProps, 'nativeVariant'>) {
  return <NativeModal nativeVariant="bottom-sheet" {...props} />;
}

export function NativeCenterSheetModal(props: Omit<NativeModalProps, 'nativeVariant'>) {
  return <NativeModal nativeVariant="center-sheet" {...props} />;
}

export function NativeFullscreenModal(props: Omit<NativeModalProps, 'nativeVariant'>) {
  return <NativeModal nativeVariant="fullscreen" withBlur={false} {...props} />;
}