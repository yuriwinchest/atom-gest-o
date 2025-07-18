/**
 * Services Index - Arquitetura SOLID
 * Centraliza todos os serviços seguindo princípios de engenharia de software
 */

// Document Services - SRP (Single Responsibility Principle)
export { DocumentService } from './document/DocumentService';
export { DocumentValidationService } from './document/DocumentValidationService';
export { DocumentSearchService } from './document/DocumentSearchService';
export { DocumentCacheService } from './document/DocumentCacheService';

// User Services - SRP
export { UserService } from './user/UserService';
export { AuthenticationService } from './user/AuthenticationService';
export { PermissionService } from './user/PermissionService';

// Storage Services - SRP
export { StorageService } from './storage/StorageService';
export { FileUploadService } from './storage/FileUploadService';
export { FileDownloadService } from './storage/FileDownloadService';

// UI Services - SRP
export { NotificationService } from './ui/NotificationService';
export { ModalService } from './ui/ModalService';
export { FormValidationService } from './ui/FormValidationService';

// Monitoring Services - SRP
export { MonitoringService } from './monitoring/MonitoringService';
export { LoggingService } from './monitoring/LoggingService';
export { ErrorTrackingService } from './monitoring/ErrorTrackingService';

// Configuration Services - SRP
export { ConfigurationService } from './config/ConfigurationService';
export { EnvironmentService } from './config/EnvironmentService';