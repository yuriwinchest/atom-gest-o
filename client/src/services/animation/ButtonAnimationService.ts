// Single Responsibility Principle (SRP) - Serviço especializado em animações de botão
import { IButtonAnimationService } from './IAnimationService';

export class ButtonAnimationService implements IButtonAnimationService {
  pressAnimation(): string {
    return "active:scale-[0.96] active:brightness-90 transition-all duration-100 ease-out";
  }

  hoverAnimation(): string {
    return "hover:scale-[1.02] hover:shadow-lg hover:brightness-110 transition-all duration-200 ease-out";
  }

  loadingAnimation(): string {
    return "animate-pulse pointer-events-none opacity-80";
  }

  getNativeButtonStyles(): Record<string, string> {
    return {
      // iOS style buttons
      ios: "rounded-2xl px-6 py-3 font-semibold text-base shadow-sm border-0",
      iosPrimary: "bg-blue-500 text-white shadow-lg hover:bg-blue-600",
      iosSecondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
      
      // Android Material Design style
      android: "rounded-lg px-4 py-2.5 font-medium text-sm uppercase tracking-wide",
      androidPrimary: "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg",
      androidSecondary: "bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50",
      
      // Universal native feel
      native: "rounded-xl px-5 py-3 font-medium shadow-sm transition-all duration-200 ease-out",
      nativePrimary: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700",
      nativeSecondary: "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-800"
    };
  }
}