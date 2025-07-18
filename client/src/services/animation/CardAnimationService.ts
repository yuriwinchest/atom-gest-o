// Single Responsibility Principle (SRP) - Serviço especializado em animações de card
import { ICardAnimationService } from './IAnimationService';

export class CardAnimationService implements ICardAnimationService {
  enterAnimation(): string {
    return "animate-in fade-in-0 slide-in-from-bottom-4 duration-400 ease-out";
  }

  hoverAnimation(): string {
    return "hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-out";
  }

  selectAnimation(): string {
    return "ring-2 ring-blue-500 ring-offset-2 scale-[1.02] shadow-xl transition-all duration-200 ease-out";
  }

  getNativeCardStyles(): Record<string, string> {
    return {
      // Base native card
      base: "bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-0 overflow-hidden backdrop-blur-sm",
      
      // Interactive card with native feel
      interactive: "bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-xl border border-gray-100/50 dark:border-gray-800/50 backdrop-blur-md overflow-hidden cursor-pointer",
      
      // iOS style card
      ios: "bg-white dark:bg-gray-900 rounded-3xl shadow-lg border-0 overflow-hidden",
      
      // Android Material Design card
      android: "bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden",
      
      // Card content
      content: "p-6 space-y-4",
      
      // Card header
      header: "border-b border-gray-100 dark:border-gray-800 pb-4 mb-4",
      
      // Card footer
      footer: "border-t border-gray-100 dark:border-gray-800 pt-4 mt-4"
    };
  }
}