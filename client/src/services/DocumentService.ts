// Service Layer - Lógica de negócio para documentos
export interface Document {
  id: number;
  title: string;
  description?: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentMetadata {
  title: string;
  documentType: string;
  referenceCode: string;
  publicOrgan: string;
  responsibleSector: string;
  responsible: string;
  period: string;
  mainSubject: string;
  confidentialityLevel: string;
  legalBase: string;
  relatedProcess: string;
  description: string;
  availability: string;
  language: string;
  rights: string;
  tags: string[];
  digitalizationDate: string;
  digitalizationLocation: string;
  digitalId: string;
  digitalizationResponsible: string;
  documentAuthority: string;
  verificationHash: string;
}

export class DocumentService {
  private static instance: DocumentService;
  private cache = new Map<number, Document>();

  static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  async fetchDocument(id: number): Promise<Document> {
    // Verifica cache primeiro
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }

    const response = await fetch(`/api/documents/${id}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar documento: ${response.statusText}`);
    }

    const document = await response.json();
    this.cache.set(id, document);
    return document;
  }

  parseMetadata(content: string): DocumentMetadata | null {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  getFileInfo(document: Document) {
    const metadata = this.parseMetadata(document.content);
    return {
      fileName: metadata?.originalName || 'documento.pdf',
      fileType: metadata?.mimeType || 'application/pdf',
      fileSize: metadata?.fileSize || 0,
      supabaseUrl: metadata?.supabaseUrl || ''
    };
  }

  generateDownloadUrl(id: number): string {
    return `/api/documents/${id}/download`;
  }

  generateViewUrl(id: number): string {
    return `/api/documents/${id}/view`;
  }
}