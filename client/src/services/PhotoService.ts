// Service Layer - Lógica de negócio para fotos anexadas
export interface PhotoData {
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadPath: string;
  supabaseId: string;
}

export class PhotoService {
  private static instance: PhotoService;

  static getInstance(): PhotoService {
    if (!PhotoService.instance) {
      PhotoService.instance = new PhotoService();
    }
    return PhotoService.instance;
  }

  extractPhotos(documentContent: string): PhotoData[] {
    try {
      const data = JSON.parse(documentContent);
      return data.additionalImages || [];
    } catch {
      return [];
    }
  }

  generatePhotoUrl(photo: PhotoData): string {
    // URL da API interna para desenvolvimento
    const apiUrl = `/api/documents/photos/${photo.fileName}`;
    
    // Para produção, usar URL pública direta do Supabase como fallback
    const directUrl = `https://fbqocpozjmuzrdeacktb.supabase.co/storage/v1/object/public/images/${photo.fileName}`;
    
    // Detectar se é produção (domínio .replit.app ou custom domain)
    const isProduction = window.location.hostname.includes('.replit.app') || 
                        !window.location.hostname.includes('localhost');
    
    // Em produção, tentar primeiro a API, mas ter fallback direto
    return isProduction ? directUrl : apiUrl;
  }

  generatePhotoUrlWithFallback(photo: PhotoData): { primary: string; fallback: string } {
    const apiUrl = `/api/documents/photos/${photo.fileName}`;
    const directUrl = `https://fbqocpozjmuzrdeacktb.supabase.co/storage/v1/object/public/images/${photo.fileName}`;
    
    return {
      primary: apiUrl,
      fallback: directUrl
    };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getImageAlt(photo: PhotoData): string {
    return `Imagem anexada: ${photo.originalName}`;
  }
}