/**
 * DocumentValidationService - Seguindo SRP (Single Responsibility Principle)
 * Responsabilidade única: Validar dados de documentos
 */

export interface IDocumentValidationService {
  validateFormData(data: any): ValidationResult;
  validateFileType(file: File): boolean;
  validateFileSize(file: File): boolean;
  validateRequiredFields(data: any): string[];
  generateDigitalId(): string;
  calculateFileHash(file: File): Promise<string>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class DocumentValidationService implements IDocumentValidationService {

  private readonly REQUIRED_FIELDS = [
    'title',
    'documentType',
    'publicOrgan',
    'responsible',
    'mainSubject',
    'description'
  ];

  private readonly SUPPORTED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];

  validateFormData(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar campos obrigatórios
    const missingFields = this.validateRequiredFields(data);
    errors.push(...missingFields);

    // Validar comprimento de campos
    if (data.title && data.title.length > 200) {
      errors.push('Título deve ter no máximo 200 caracteres');
    }

    if (data.description && data.description.length > 1000) {
      warnings.push('Descrição muito longa pode afetar a performance');
    }

    // Validar formato de datas
    if (data.digitalizationDate && !this.isValidDate(data.digitalizationDate)) {
      errors.push('Data de digitalização inválida');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateFileType(file: File): boolean {
    return this.SUPPORTED_FILE_TYPES.includes(file.type);
  }

  validateFileSize(file: File): boolean {
    // Sem limite conforme especificação do usuário
    return true;
  }

  validateRequiredFields(data: any): string[] {
    const missing: string[] = [];

    for (const field of this.REQUIRED_FIELDS) {
      if (!data[field] || data[field].toString().trim() === '') {
        missing.push(`Campo obrigatório: ${this.getFieldDisplayName(field)}`);
      }
    }

    return missing;
  }

  generateDigitalId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `DOC-${timestamp}-${random}`.toUpperCase();
  }

  async calculateFileHash(file: File): Promise<string> {
    try {
      // Verificar se o arquivo é válido
      if (!file || !(file instanceof File)) {
        console.warn('Arquivo inválido para cálculo de hash:', file);
        return 'INVALID_FILE_HASH';
      }

      // Verificar se o arquivo tem o método arrayBuffer
      if (typeof file.arrayBuffer !== 'function') {
        console.warn('Arquivo não tem método arrayBuffer:', file);
        return 'NO_ARRAYBUFFER_HASH';
      }

      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Erro ao calcular hash SHA-256:', error);
      return 'HASH_CALCULATION_ERROR';
    }
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  private getFieldDisplayName(field: string): string {
    const fieldNames: Record<string, string> = {
      title: 'Título',
      documentType: 'Tipo de Documento',
      publicOrgan: 'Órgão Público',
      responsible: 'Responsável',
      mainSubject: 'Assunto Principal',
      description: 'Descrição'
    };

    return fieldNames[field] || field;
  }
}

// Singleton instance
export const documentValidationService = new DocumentValidationService();