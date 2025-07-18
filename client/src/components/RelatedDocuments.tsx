import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link2, Download, Trash2, FileText, Calendar, ArrowRight, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

import DocumentViewer from './DocumentViewer';
import RelatedDocumentViewer from './RelatedDocumentViewer';
import SimpleEditDocumentModal from './SimpleEditDocumentModal';
import type { Document, DocumentRelation } from '@shared/schema';

interface RelatedDocumentsProps {
  documentId: number;
  parentDocument?: Document; // Documento pai para verificar propriedade
}

export default function RelatedDocuments({ documentId, parentDocument }: RelatedDocumentsProps) {

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<Document | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Função para verificar se o usuário pode gerenciar documentos relacionados
  const canUserManageRelations = () => {
    if (!isAuthenticated || !user) return false;
    
    // Administradores podem gerenciar qualquer documento
    if (isAdmin) return true;
    
    // Verificar se o usuário é proprietário do documento pai
    if (parentDocument?.user_id) {
      return parentDocument.user_id === user.id;
    }
    
    // Para documentos sem user_id (legados), permitir apenas para administradores
    return false;
  };

  // Função para abrir o modal de edição do documento relacionado
  const handleEditDocument = (document: Document) => {
    setDocumentToEdit(document);
    setIsEditModalOpen(true);
  };

  // Função para baixar todo o conteúdo do documento relacionado (metadados + arquivos + fotos)
  const handleDownloadCompleteDocument = async (doc: Document) => {
    try {
      // Baixar o arquivo principal
      const response = await fetch(`/api/documents/${doc.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.title || 'document';
        a.click();
        window.URL.revokeObjectURL(url);
      }

      // Baixar metadados como PDF (HTML formatado)
      const metadata = doc.content ? JSON.parse(doc.content) : {};
      const metadataHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Metadados do Documento - ${doc.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .section { margin-bottom: 15px; }
            .section-title { font-weight: bold; color: #1e40af; margin-bottom: 8px; }
            .field { margin-bottom: 5px; }
            .field-label { font-weight: bold; color: #374151; }
            .field-value { color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Metadados do Documento</h1>
            <p><strong>Título:</strong> ${doc.title || 'Não informado'}</p>
            <p><strong>ID:</strong> ${doc.id}</p>
            <p><strong>Data:</strong> ${doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('pt-BR') : 'Não informada'}</p>
          </div>
          
          <div class="section">
            <div class="section-title">Identificação do Documento</div>
            <div class="field">
              <span class="field-label">Tipo:</span> 
              <span class="field-value">${metadata.documentType || 'Não informado'}</span>
            </div>
            <div class="field">
              <span class="field-label">Código:</span> 
              <span class="field-value">${metadata.documentCode || 'Não informado'}</span>
            </div>
            <div class="field">
              <span class="field-label">Identificação Digital:</span> 
              <span class="field-value">${metadata.digitalId || 'Não informado'}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Origem e Responsabilidade</div>
            <div class="field">
              <span class="field-label">Órgão Público:</span> 
              <span class="field-value">${metadata.publicOrgan || 'Não informado'}</span>
            </div>
            <div class="field">
              <span class="field-label">Setor:</span> 
              <span class="field-value">${metadata.responsibleSector || 'Não informado'}</span>
            </div>
            <div class="field">
              <span class="field-label">Responsável:</span> 
              <span class="field-value">${metadata.responsible || 'Não informado'}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Conteúdo e Classificação</div>
            <div class="field">
              <span class="field-label">Descrição:</span> 
              <span class="field-value">${metadata.description || 'Não informada'}</span>
            </div>
            <div class="field">
              <span class="field-label">Assunto Principal:</span> 
              <span class="field-value">${metadata.mainSubject || 'Não informado'}</span>
            </div>
            <div class="field">
              <span class="field-label">Palavras-chave:</span> 
              <span class="field-value">${metadata.keywords ? metadata.keywords.join(', ') : 'Não informadas'}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Informações Técnicas</div>
            <div class="field">
              <span class="field-label">Confidencialidade:</span> 
              <span class="field-value">${metadata.confidentialityLevel || 'Não informado'}</span>
            </div>
            <div class="field">
              <span class="field-label">Idioma:</span> 
              <span class="field-value">${metadata.language || 'Não informado'}</span>
            </div>
            <div class="field">
              <span class="field-label">Hash de Verificação:</span> 
              <span class="field-value">${metadata.verificationHash || 'Não informado'}</span>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Abrir HTML em nova aba e acionar impressão (salvar como PDF)
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(metadataHtml);
        newWindow.document.close();
        
        // Aguardar carregar e abrir janela de impressão
        setTimeout(() => {
          newWindow.print();
        }, 500);
      } else {
        // Fallback: baixar como HTML se popup foi bloqueado
        const metadataBlob = new Blob([metadataHtml], { type: 'text/html' });
        const metadataUrl = window.URL.createObjectURL(metadataBlob);
        const metadataLink = document.createElement('a');
        metadataLink.href = metadataUrl;
        metadataLink.download = `${doc.title || 'document'}-metadados.html`;
        metadataLink.click();
        window.URL.revokeObjectURL(metadataUrl);
      }

      // Baixar fotos anexadas se existirem
      if (metadata.additionalImages && metadata.additionalImages.length > 0) {
        for (const photo of metadata.additionalImages) {
          try {
            const photoResponse = await fetch(`/api/documents/photos/${photo.fileName}`);
            if (photoResponse.ok) {
              const photoBlob = await photoResponse.blob();
              const photoUrl = window.URL.createObjectURL(photoBlob);
              const photoLink = document.createElement('a');
              photoLink.href = photoUrl;
              photoLink.download = photo.originalName || photo.fileName;
              photoLink.click();
              window.URL.revokeObjectURL(photoUrl);
            }
          } catch (error) {
            console.error(`Erro ao baixar foto ${photo.fileName}:`, error);
          }
        }
      }

      toast({
        title: "Download iniciado!",
        description: "Arquivo principal e fotos baixados. Metadados abertos para salvar como PDF.",
      });
    } catch (error) {
      console.error('Erro ao baixar conteúdo completo:', error);
      toast({
        title: "Erro no download",
        description: "Erro ao baixar o conteúdo completo do documento.",
        variant: "destructive",
      });
    }
  };

  // Buscar documentos relacionados
  const { data: relatedDocuments = [], isLoading: isLoadingDocuments } = useQuery<Document[]>({
    queryKey: [`/api/documents/${documentId}/related`],
  });

  // Buscar relacionamentos (para obter metadados como tipo e descrição)
  const { data: relations = [], isLoading: isLoadingRelations } = useQuery<DocumentRelation[]>({
    queryKey: [`/api/documents/${documentId}/relations`],
  });

  const isLoading = isLoadingDocuments || isLoadingRelations;

  // Mutation para remover relacionamento
  const removeMutation = useMutation({
    mutationFn: async (relationId: number) => {
      const response = await fetch(`/api/document-relations/${relationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao remover relacionamento');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Relacionamento removido com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}/related`] });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}/relations`] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o relacionamento",
        variant: "destructive",
      });
    }
  });





  const getRelationTypeLabel = (type: string | null) => {
    switch (type) {
      case 'attached': return 'Anexado';
      case 'referenced': return 'Referenciado';
      case 'derived': return 'Derivado';
      default: return 'Relacionado';
    }
  };

  const getRelationTypeColor = (type: string | null) => {
    switch (type) {
      case 'attached': return 'bg-blue-100 text-blue-700';
      case 'referenced': return 'bg-green-100 text-green-700';
      case 'derived': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Combinar dados de documentos com metadados de relacionamento
  const documentsWithRelations = relatedDocuments.map(doc => {
    const relation = relations.find(rel => rel.childDocumentId === doc.id);
    return { document: doc, relation };
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-blue-600" />
          Documentos Relacionados
          {relatedDocuments.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {relatedDocuments.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            Carregando documentos relacionados...
          </div>
        ) : relatedDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Nenhum documento relacionado ainda.</p>
            <p className="text-xs text-gray-400 mt-1">
              Os documentos anexados aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {documentsWithRelations.map(({ document: doc, relation }, index) => {
              // Extrair metadados do documento relacionado
              let metadata = {};
              try {
                metadata = doc.content ? JSON.parse(doc.content) : {};
              } catch (e) {
                console.error('Erro ao parsear metadados do documento relacionado:', e);
              }

              return (
                <motion.div
                  key={`${doc.id}-${relation?.id || index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 sm:p-6 border border-blue-200 dark:border-gray-700 shadow-sm active:scale-[0.98] transition-transform duration-150"
                >
                  {/* Cabeçalho do Documento Relacionado - responsivo iOS/Android */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                        <h3 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
                          {doc.title}
                        </h3>
                        {relation && (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs sm:text-sm ${getRelationTypeColor(relation.relationType)} flex-shrink-0`}
                          >
                            {getRelationTypeLabel(relation.relationType)}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 break-words">
                        ID: {doc.id} • {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('pt-BR') : 'Data não informada'}
                      </p>
                    </div>

                    {/* Botões de ação - controle de acesso por autenticação */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      {/* Botão Editar - apenas para usuários autenticados */}
                      {isAuthenticated && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDocument(doc)}
                          className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400 active:scale-95 transition-transform duration-150 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span>Editar</span>
                        </Button>
                      )}
                      
                      {/* Botão Baixar - sempre visível para todos */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadCompleteDocument(doc)}
                        className="text-green-600 hover:text-green-700 border-green-300 hover:border-green-400 active:scale-95 transition-transform duration-150 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span>Baixar</span>
                      </Button>
                    </div>
                  </div>

                  {/* METADADOS COMPLETOS IGUAL AO DOCUMENTO PRINCIPAL - responsivo iOS/Android */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {/* Seção 1: Identificação do Documento */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 sm:p-4 border border-blue-200 dark:border-gray-600 shadow-sm active:scale-[0.98] transition-transform duration-150">
                      <h4 className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2 sm:mb-3 flex items-center gap-2">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">Identificação</span>
                      </h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Título:</span>
                          <p className="text-gray-600 dark:text-gray-400 mt-1 break-words">{metadata.titulo || doc.title}</p>
                        </div>
                        {metadata.documentType && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Tipo:</span>
                            <p className="text-gray-600 dark:text-gray-400 mt-1 break-words">{metadata.documentType}</p>
                          </div>
                        )}
                        {metadata.digitalId && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">ID Digital:</span>
                            <p className="text-gray-600 dark:text-gray-400 mt-1 font-mono text-xs break-all">{metadata.digitalId}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Seção 2: Origem e Responsabilidade - responsivo iOS/Android */}
                    {(metadata.publicOrgan || metadata.responsibleSector || metadata.responsible) && (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 sm:p-4 border border-green-200 dark:border-gray-600 shadow-sm active:scale-[0.98] transition-transform duration-150">
                        <h4 className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300 mb-2 sm:mb-3 flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">Origem</span>
                        </h4>
                        <div className="space-y-2 text-xs sm:text-sm">
                          {metadata.publicOrgan && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Órgão:</span>
                              <p className="text-gray-600 dark:text-gray-400 mt-1 break-words">{metadata.publicOrgan}</p>
                            </div>
                          )}
                          {metadata.responsibleSector && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Setor:</span>
                              <p className="text-gray-600 dark:text-gray-400 mt-1 break-words">{metadata.responsibleSector}</p>
                            </div>
                          )}
                          {metadata.responsible && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Responsável:</span>
                              <p className="text-gray-600 dark:text-gray-400 mt-1 break-words">{metadata.responsible}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Seção 3: Conteúdo e Classificação - responsivo iOS/Android */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 sm:p-4 border border-amber-200 dark:border-gray-600 shadow-sm active:scale-[0.98] transition-transform duration-150">
                      <h4 className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2 sm:mb-3 flex items-center gap-2">
                        <Badge className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">Conteúdo</span>
                      </h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Descrição:</span>
                          <p className="text-gray-600 dark:text-gray-400 mt-1 break-words">{metadata.description || doc.description || 'Não informada'}</p>
                        </div>
                        {metadata.mainSubject && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Assunto:</span>
                            <p className="text-gray-600 dark:text-gray-400 mt-1 break-words">{metadata.mainSubject}</p>
                          </div>
                        )}
                        {metadata.tags && metadata.tags.length > 0 && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Tags:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {metadata.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs rounded-full">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Informações do Arquivo - responsivo iOS/Android */}
                  {metadata.fileInfo && (
                    <div className="mt-3 sm:mt-4 bg-white dark:bg-gray-800 rounded-2xl p-3 sm:p-4 border border-gray-200 dark:border-gray-600 shadow-sm active:scale-[0.98] transition-transform duration-150">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Informações do Arquivo</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">Nome:</span>
                          <p className="text-gray-700 dark:text-gray-300 break-words mt-1">{metadata.fileInfo.originalName}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">Tamanho:</span>
                          <p className="text-gray-700 dark:text-gray-300 mt-1">{Math.round(metadata.fileInfo.fileSize / 1024)} KB</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">Tipo:</span>
                          <p className="text-gray-700 dark:text-gray-300 text-xs break-words mt-1">{metadata.fileInfo.mimeType}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">Categoria:</span>
                          <p className="text-gray-700 dark:text-gray-300 mt-1">{doc.category}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Relacionamento - responsivo iOS/Android */}
                  {relation && (
                    <div className="mt-3 sm:mt-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-3 sm:p-4 border border-blue-200 dark:border-blue-700 shadow-sm active:scale-[0.98] transition-transform duration-150">
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                        <span className="font-medium text-blue-700 dark:text-blue-300">
                          Relacionamento: {getRelationTypeLabel(relation.relationType)}
                        </span>
                        {relation.description && (
                          <span className="text-blue-600 dark:text-blue-400 italic break-words">
                            - "{relation.description}"
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PREVIEW DO DOCUMENTO RELACIONADO - responsivo iOS/Android */}
                  <div className="mt-4 sm:mt-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-600">
                      <h4 className="text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">Preview do Documento</span>
                      </h4>
                    </div>
                    <div className="p-0">
                      <RelatedDocumentViewer documentId={doc.id} />
                    </div>
                  </div>

                  {/* FOTOS ANEXADAS DO DOCUMENTO RELACIONADO - responsivo iOS/Android */}
                  {metadata.additionalImages && metadata.additionalImages.length > 0 && (
                    <div className="mt-4 sm:mt-6 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/30 dark:to-pink-900/30 p-3 sm:p-4 md:p-6 rounded-2xl border border-purple-200/30 dark:border-purple-700/30 shadow-sm">
                      <h4 className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3 sm:mb-4 flex items-center gap-2">
                        <svg className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">Fotos Anexadas ({metadata.additionalImages.length})</span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                        {metadata.additionalImages.map((photo, photoIndex) => (
                          <div key={photoIndex} className="relative group">
                            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm active:scale-95 transition-transform duration-150">
                              <img 
                                src={`/api/documents/photos/${photo.fileName}`}
                                alt={photo.originalName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBzdHJva2U9IiNkY2RjZGMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg==';
                                }}
                              />
                              
                              {/* Botões sobre as fotos - responsivos com feedback tátil */}
                              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1 sm:gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-white/90 hover:bg-white text-black border-white/20 backdrop-blur-sm active:scale-95 transition-transform duration-150 rounded-xl px-2 sm:px-3 py-1 sm:py-2 text-xs"
                                  onClick={() => window.open(`/api/documents/photos/${photo.fileName}`, '_blank')}
                                >
                                  <svg className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="hidden sm:inline">Abrir</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-white/90 hover:bg-white text-black border-white/20 backdrop-blur-sm active:scale-95 transition-transform duration-150 rounded-xl px-2 sm:px-3 py-1 sm:py-2 text-xs"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = `/api/documents/photos/${photo.fileName}`;
                                    link.download = photo.originalName;
                                    link.click();
                                  }}
                                >
                                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  <span className="hidden sm:inline">Baixar</span>
                                </Button>
                              </div>
                            </div>
                            
                            {/* Informações da foto - responsivas */}
                            <div className="mt-1 sm:mt-2">
                              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate">
                                {photo.originalName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {(photo.fileSize / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>



      {/* Modal de visualização de documento relacionado */}
      {selectedDocument && (
        <DocumentViewer
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
        />
      )}

      {/* Modal de edição de documento relacionado */}
      {documentToEdit && (
        <SimpleEditDocumentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setDocumentToEdit(null);
          }}
          document={documentToEdit}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setDocumentToEdit(null);
            // Invalidar cache para atualizar os dados
            queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}/related`] });
            queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}/relations`] });
          }}
        />
      )}
    </Card>
  );
}