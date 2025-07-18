/**
 * NotificationService - Seguindo SRP (Single Responsibility Principle)
 * Responsabilidade única: Gerenciar notificações do sistema
 */

export interface INotificationService {
  showSuccess(title: string, description?: string): void;
  showError(title: string, description?: string): void;
  showWarning(title: string, description?: string): void;
  showInfo(title: string, description?: string): void;
}

export type NotificationVariant = 'default' | 'destructive' | 'success' | 'warning';

export interface NotificationOptions {
  title: string;
  description?: string;
  variant?: NotificationVariant;
  duration?: number;
}

export class NotificationService implements INotificationService {
  private toastFunction: ((options: NotificationOptions) => void) | null = null;

  // Injeção de dependência - DIP (Dependency Inversion Principle)
  setToastFunction(toastFn: (options: NotificationOptions) => void): void {
    this.toastFunction = toastFn;
  }

  showSuccess(title: string, description?: string): void {
    this.show({
      title,
      description,
      variant: 'success'
    });
  }

  showError(title: string, description?: string): void {
    this.show({
      title,
      description,
      variant: 'destructive'
    });
  }

  showWarning(title: string, description?: string): void {
    this.show({
      title,
      description,
      variant: 'warning'
    });
  }

  showInfo(title: string, description?: string): void {
    this.show({
      title,
      description,
      variant: 'default'
    });
  }

  private show(options: NotificationOptions): void {
    if (!this.toastFunction) {
      console.warn('Toast function not initialized. Using fallback alert.');
      alert(`${options.title}${options.description ? ': ' + options.description : ''}`);
      return;
    }

    this.toastFunction(options);
  }

  // Factory methods para situações específicas
  documentSaved(title: string, attachedImages?: number): void {
    const imageText = attachedImages && attachedImages > 0 
      ? ` ${attachedImages} imagem(ns) adicional(is) anexada(s).` 
      : '';
    
    this.showSuccess(
      'Documento Salvo', 
      `${title} foi cadastrado com sucesso!${imageText}`
    );
  }

  documentDeleted(title: string): void {
    this.showSuccess('Documento Excluído', `${title} foi removido com sucesso.`);
  }

  uploadProgress(stage: string, progress: number): void {
    this.showInfo('Upload em Progresso', `${stage} (${progress}%)`);
  }

  validationError(errors: string[]): void {
    const errorList = errors.slice(0, 3).join(', ');
    const moreErrors = errors.length > 3 ? ` e mais ${errors.length - 3}` : '';
    
    this.showError(
      'Erro de Validação',
      `${errorList}${moreErrors}`
    );
  }
}

// Singleton instance
export const notificationService = new NotificationService();