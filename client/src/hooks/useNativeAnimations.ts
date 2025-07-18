// Hook customizado seguindo SOLID - Single Responsibility para gerenciar animações
import { useMemo } from 'react';
import { AnimationServiceFactory } from '@/services/animation/AnimationServiceFactory';
import { 
  IModalAnimationService, 
  IButtonAnimationService, 
  ICardAnimationService,
  IMicroInteractionService,
  INativeStyleService
} from '@/services/animation/IAnimationService';

export function useNativeAnimations() {
  // Dependency Injection - Injeção de dependências via factory
  const modalAnimations = useMemo<IModalAnimationService>(() => 
    AnimationServiceFactory.createService<IModalAnimationService>('modal'), []
  );
  
  const buttonAnimations = useMemo<IButtonAnimationService>(() => 
    AnimationServiceFactory.createService<IButtonAnimationService>('button'), []
  );
  
  const cardAnimations = useMemo<ICardAnimationService>(() => 
    AnimationServiceFactory.createService<ICardAnimationService>('card'), []
  );
  
  const microInteractions = useMemo<IMicroInteractionService>(() => 
    AnimationServiceFactory.createService<IMicroInteractionService>('microInteraction'), []
  );
  
  const nativeStyles = useMemo<INativeStyleService>(() => 
    AnimationServiceFactory.createService<INativeStyleService>('nativeStyle'), []
  );

  // Interface simplificada para componentes
  return useMemo(() => ({
    // Modal animations
    modal: {
      enter: modalAnimations.enterAnimation(),
      exit: modalAnimations.exitAnimation(),
      scale: modalAnimations.scaleAnimation(),
    },
    
    // Button animations
    button: {
      press: buttonAnimations.pressAnimation(),
      hover: buttonAnimations.hoverAnimation(),
      loading: buttonAnimations.loadingAnimation(),
    },
    
    // Card animations
    card: {
      enter: cardAnimations.enterAnimation(),
      hover: cardAnimations.hoverAnimation(),
      select: cardAnimations.selectAnimation(),
    },
    
    // Micro interactions
    interactions: {
      ripple: microInteractions.rippleEffect(),
      pulse: microInteractions.pulseEffect(),
      bounce: microInteractions.bounceEffect(),
      slide: microInteractions.slideEffect(),
    },
    
    // Native styles
    native: nativeStyles.getCurrentPlatformStyles(),
    
    // Utility functions
    utils: {
      combineClasses: (...classes: string[]) => classes.filter(Boolean).join(' '),
      getResponsiveClass: (mobile: string, desktop: string) => `${mobile} md:${desktop}`,
      getNativeButton: (variant: 'primary' | 'secondary' = 'primary') => 
        `${buttonAnimations.pressAnimation()} ${buttonAnimations.hoverAnimation()} ${
          variant === 'primary' 
            ? nativeStyles.getCurrentPlatformStyles().primaryButton 
            : nativeStyles.getCurrentPlatformStyles().secondaryButton
        }`,
      getNativeCard: () => 
        `${cardAnimations.enterAnimation()} ${cardAnimations.hoverAnimation()} ${nativeStyles.getCurrentPlatformStyles().card}`,
      getNativeModal: () => 
        `${modalAnimations.enterAnimation()} ${nativeStyles.getCurrentPlatformStyles().modal}`
    }
  }), [modalAnimations, buttonAnimations, cardAnimations, microInteractions, nativeStyles]);
}

// Hook especializado para responsividade nativa
export function useNativeResponsive() {
  return useMemo(() => ({
    // Breakpoints nativos
    mobile: 'sm:hidden',
    tablet: 'hidden sm:block lg:hidden',
    desktop: 'hidden lg:block',
    
    // Containers responsivos
    container: 'container mx-auto px-3 sm:px-6 lg:px-8',
    
    // Grid responsivo nativo
    grid: {
      mobile: 'grid grid-cols-1 gap-3',
      tablet: 'grid grid-cols-2 gap-4',
      desktop: 'grid grid-cols-3 gap-6',
      responsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6'
    },
    
    // Espaçamentos nativos
    spacing: {
      xs: 'space-y-2 sm:space-y-3',
      sm: 'space-y-3 sm:space-y-4',
      md: 'space-y-4 sm:space-y-6',
      lg: 'space-y-6 sm:space-y-8',
      xl: 'space-y-8 sm:space-y-12'
    },
    
    // Padding responsivo
    padding: {
      xs: 'p-2 sm:p-3',
      sm: 'p-3 sm:p-4',
      md: 'p-4 sm:p-6',
      lg: 'p-6 sm:p-8',
      xl: 'p-8 sm:p-12'
    },
    
    // Tipografia responsiva
    text: {
      xs: 'text-xs sm:text-sm',
      sm: 'text-sm sm:text-base',
      base: 'text-base sm:text-lg',
      lg: 'text-lg sm:text-xl',
      xl: 'text-xl sm:text-2xl',
      '2xl': 'text-2xl sm:text-3xl'
    }
  }), []);
}