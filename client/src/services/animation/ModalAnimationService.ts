// Single Responsibility Principle (SRP) - Serviço especializado em animações de modal
import { IModalAnimationService } from './IAnimationService';

export class ModalAnimationService implements IModalAnimationService {
  enterAnimation(): string {
    return "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out";
  }

  exitAnimation(): string {
    return "animate-out fade-out-0 zoom-out-95 slide-out-to-bottom-4 duration-200 ease-in";
  }

  scaleAnimation(): string {
    return "transform transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]";
  }

  getNativeModalStyles(): Record<string, string> {
    return {
      backdrop: "backdrop-blur-sm bg-black/20 dark:bg-black/40",
      container: "fixed inset-0 z-50 flex items-center justify-center p-4",
      content: "relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-0 max-w-[95vw] max-h-[90vh] overflow-hidden",
      header: "sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 px-6 py-4",
      body: "px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]",
      footer: "sticky bottom-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800 px-6 py-4"
    };
  }
}