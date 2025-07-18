// Single Responsibility Principle (SRP) - Serviço especializado em estilos nativos
import { INativeStyleService } from './IAnimationService';

export class NativeStyleService implements INativeStyleService {
  getIOSStyles(): Record<string, string> {
    return {
      // Containers
      container: "bg-gray-50 dark:bg-gray-900",
      card: "bg-white dark:bg-gray-800 rounded-3xl shadow-lg border-0",
      modal: "bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-0",
      
      // Typography
      title: "text-2xl font-bold text-gray-900 dark:text-white",
      subtitle: "text-lg font-semibold text-gray-700 dark:text-gray-300",
      body: "text-base text-gray-600 dark:text-gray-400",
      caption: "text-sm text-gray-500 dark:text-gray-500",
      
      // Buttons
      primaryButton: "bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg transition-all duration-200 ease-out",
      secondaryButton: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 ease-out",
      
      // Inputs
      input: "bg-gray-100 dark:bg-gray-800 border-0 rounded-2xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-out",
      
      // Navigation
      navbar: "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800",
      tabbar: "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800"
    };
  }

  getAndroidStyles(): Record<string, string> {
    return {
      // Containers
      container: "bg-gray-100 dark:bg-gray-900",
      card: "bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700",
      modal: "bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700",
      
      // Typography
      title: "text-2xl font-bold text-gray-900 dark:text-white",
      subtitle: "text-lg font-medium text-gray-700 dark:text-gray-300",
      body: "text-base text-gray-600 dark:text-gray-400",
      caption: "text-sm font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide",
      
      // Buttons
      primaryButton: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-md uppercase tracking-wide transition-all duration-200 ease-out",
      secondaryButton: "bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium py-2.5 px-4 rounded-lg border border-blue-600 dark:border-blue-400 uppercase tracking-wide transition-all duration-200 ease-out",
      
      // Inputs
      input: "bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-400 px-0 py-2 text-base transition-all duration-200 ease-out",
      
      // Navigation
      navbar: "bg-blue-600 dark:bg-blue-700 text-white shadow-lg",
      tabbar: "bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg"
    };
  }

  getCurrentPlatformStyles(): Record<string, string> {
    // Detecção simplificada de plataforma
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    if (isIOS) {
      return this.getIOSStyles();
    } else if (isAndroid) {
      return this.getAndroidStyles();
    }
    
    // Híbrido para desktop/web
    return this.getUniversalNativeStyles();
  }

  private getUniversalNativeStyles(): Record<string, string> {
    return {
      // Híbrido entre iOS e Android com foco em sensação nativa
      container: "bg-gray-50 dark:bg-gray-900",
      card: "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100/50 dark:border-gray-800/50",
      modal: "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-100/50 dark:border-gray-800/50",
      
      // Typography
      title: "text-2xl font-bold text-gray-900 dark:text-white",
      subtitle: "text-lg font-semibold text-gray-700 dark:text-gray-300",
      body: "text-base text-gray-600 dark:text-gray-400",
      caption: "text-sm font-medium text-gray-500 dark:text-gray-500",
      
      // Buttons
      primaryButton: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 ease-out",
      secondaryButton: "bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200 ease-out",
      
      // Inputs
      input: "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-out",
      
      // Navigation
      navbar: "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm",
      tabbar: "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 shadow-lg"
    };
  }
}