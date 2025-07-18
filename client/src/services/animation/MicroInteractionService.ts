// Single Responsibility Principle (SRP) - Serviço especializado em micro-interações
import { IMicroInteractionService } from './IAnimationService';

export class MicroInteractionService implements IMicroInteractionService {
  rippleEffect(): string {
    return "relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:scale-0 before:opacity-0 hover:before:scale-100 hover:before:opacity-100 before:transition-all before:duration-300 before:ease-out before:rounded-full";
  }

  pulseEffect(): string {
    return "animate-pulse";
  }

  bounceEffect(): string {
    return "hover:animate-bounce";
  }

  slideEffect(): string {
    return "transform transition-transform duration-300 ease-out hover:translate-x-1";
  }

  getAdvancedMicroInteractions(): Record<string, string> {
    return {
      // Feedback tátil visual
      tactileFeedback: "active:scale-95 active:brightness-90 transition-all duration-75 ease-out",
      
      // Efeito de ondulação (ripple)
      ripple: "relative overflow-hidden before:absolute before:inset-0 before:bg-current before:opacity-0 before:scale-0 active:before:opacity-20 active:before:scale-100 before:transition-all before:duration-300 before:ease-out",
      
      // Highlight suave
      highlight: "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 ease-out",
      
      // Elevação (elevation)
      elevation: "hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/20 transition-all duration-300 ease-out",
      
      // Glow effect
      glow: "hover:shadow-lg hover:shadow-current/20 transition-all duration-300 ease-out",
      
      // Morphing borders
      morphBorder: "border-2 border-transparent hover:border-gradient-to-r hover:from-blue-500 hover:to-purple-500 transition-all duration-300 ease-out",
      
      // Floating effect
      floating: "hover:-translate-y-2 hover:shadow-xl transition-all duration-300 ease-out"
    };
  }

  // Micro-interações específicas para elementos nativos
  getNativeMicroInteractions(): Record<string, string> {
    return {
      // iOS haptic feedback simulation
      iOSPress: "active:scale-[0.97] active:opacity-80 transition-all duration-100 ease-out",
      
      // Android Material ripple
      materialRipple: "relative overflow-hidden after:absolute after:inset-0 after:bg-current after:opacity-0 after:scale-0 active:after:opacity-10 active:after:scale-100 after:transition-all after:duration-200 after:ease-out",
      
      // Native selection
      nativeSelect: "ring-2 ring-blue-500 ring-offset-2 bg-blue-50 dark:bg-blue-900/20 transition-all duration-200 ease-out",
      
      // Native focus
      nativeFocus: "outline-none ring-2 ring-blue-500 ring-offset-2 transition-all duration-200 ease-out",
      
      // Native hover
      nativeHover: "hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 ease-out"
    };
  }
}