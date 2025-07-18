/**
 * DocumentService - Seguindo SRP (Single Responsibility Principle)
 * Responsabilidade única: Gerenciar operações CRUD de documentos
 */

import { apiRequest } from '@/lib/queryClient';
import type { Document } from '@shared/schema';

export interface IDocumentService {
  create(data: any): Promise<Document>;
  update(id: number, data: any): Promise<Document>;
  delete(id: number): Promise<void>;
  getById(id: number): Promise<Document>;
  getAll(): Promise<Document[]>;
  search(query: string): Promise<Document[]>;
}

export class DocumentService implements IDocumentService {
  
  async create(data: any): Promise<Document> {
    const response = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao criar documento: ${response.status}`);
    }
    
    return response.json();
  }

  async update(id: number, data: any): Promise<Document> {
    const response = await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao atualizar documento: ${response.status}`);
    }
    
    return response.json();
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`/api/documents/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao deletar documento: ${response.status}`);
    }
  }

  async getById(id: number): Promise<Document> {
    const response = await fetch(`/api/documents/${id}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar documento: ${response.status}`);
    }
    
    return response.json();
  }

  async getAll(): Promise<Document[]> {
    const response = await fetch('/api/documents');
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar documentos: ${response.status}`);
    }
    
    return response.json();
  }

  async search(query: string): Promise<Document[]> {
    const response = await fetch('/api/documents/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`Erro na busca: ${response.status}`);
    }
    
    return response.json();
  }

  async attachRelated(parentId: number, childData: any): Promise<Document> {
    const response = await fetch(`/api/documents/${parentId}/attach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(childData)
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao anexar documento: ${response.status}`);
    }
    
    return response.json();
  }
}

// Singleton instance - DIP (Dependency Inversion Principle)
export const documentService = new DocumentService();