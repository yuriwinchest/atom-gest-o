/**
 * Storage System - Arquivo Principal
 *
 * Este arquivo foi refatorado para usar uma estrutura modular.
 * Todas as funcionalidades foram movidas para:
 * - server/storage/types.ts - Interfaces e tipos
 * - server/storage/utils.ts - Funções utilitárias
 * - server/storage/HybridStorage.ts - Implementação principal
 * - server/storage/index.ts - Exportações e instância
 */

// Re-export everything from the new modular structure
export * from './storage/index';

// Keep the original export for backward compatibility
export { storage } from './storage/index';
