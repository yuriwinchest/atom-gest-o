// Export the main storage instance
export { HybridStorage } from './HybridStorage';

// Export types and interfaces
export * from './types';
export * from './utils';

// Create and export the main storage instance
import { HybridStorage } from './HybridStorage';
export const storage = new HybridStorage();
