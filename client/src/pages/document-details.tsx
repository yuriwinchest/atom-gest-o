import { useParams, useLocation, Link } from "wouter";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Edit, Paperclip, HelpCircle } from "lucide-react";
import { formatDate, calculateFileHash } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import DocumentViewer from "@/components/DocumentViewer/DocumentViewer";
import MetadataDisplay from "@/components/Metadata/MetadataDisplay";
import { ActionGroup } from "@/components/Actions/ActionGroup";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import SimpleEditDocumentModal from "@/components/SimpleEditDocumentModal";
import DocumentFormModal from "@/components/DocumentFormModal";
import RelatedDocuments from "@/components/RelatedDocuments";
import { useDocument } from "@/hooks/useDocument";
import { ActionService } from "@/services/ActionService";
import { useToast } from "@/hooks/use-toast";
import { supabaseStorageService } from "@/services/supabaseStorageService";
import type { Document } from "@shared/schema";

export default function DocumentDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDocumentFormModal, setShowDocumentFormModal] = useState(false);

  const { document, isLoading, fileInfo } = useDocument({ documentId: Number(id) });
  const actionService = ActionService.getInstance();
  
  // STATE PARA FORÇAR REFRESH DO PREVIEW
  const [previewRefreshKey, setPreviewRefreshKey] = useState(Date.now());

  // Detectar se é usuário público
  const urlParams = new URLSearchParams(window.location.search);
  const isPublicUser = urlParams.get('public') === 'true';

  // Legacy query para compatibilidade
  const { data: legacyDocument } = useQuery<Document>({
    queryKey: [`/api/documents/${id}`],
    enabled: !!id
  });

  const actualDocument = Array.isArray(legacyDocument) ? legacyDocument[0] : legacyDocument;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando documento...</p>
        </div>
      </div>
    );
  }

  if (!actualDocument) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Documento não encontrado</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">O documento solicitado não existe.</p>
          <Button 
            onClick={() => setLocation('/gestao-documentos')} 
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const fileName = fileInfo?.fileName || 'documento.pdf';
  const fileType = fileInfo?.fileType || 'application/pdf';

  const handleDownload = () => {
    window.open(`/api/documents/${actualDocument.id}/download`, '_blank');
  };

  // Implementar a função handleDocumentFormSubmit baseada nas implementações funcionais
  const handleDocumentFormSubmit = async (formData: any, attachedImages?: File[], mainFile?: File) => {
    try {
      console.log('📎 [DocumentDetails] Iniciando anexação de documento');
      
      if (!mainFile) {
        console.error('❌ Nenhum arquivo fornecido para anexação');
        return;
      }

      // 1. Calcular hash do arquivo
      const fileHash = await calculateFileHash(mainFile);

      // 2. Upload do arquivo para Supabase Storage
      const uploadedFile = await supabaseStorageService.uploadFileToSupabase(
        mainFile,
        {
          description: formData.description,
          tags: formData.tags || [],
          category: 'documents'
        }
      );

      // 3. Upload das imagens adicionais se fornecidas
      let imagesUploadResults = [];
      if (attachedImages && attachedImages.length > 0) {
        try {
          const imageUploadFiles = await supabaseStorageService.uploadMultipleFiles(attachedImages, {
            category: 'images',
            description: `Imagens adicionais para ${formData.title}`,
            tags: formData.tags || []
          });
          
          if (imageUploadFiles.length > 0) {
            imagesUploadResults = imageUploadFiles;
            console.log(`✅ Upload de ${imagesUploadResults.length} imagens adicionais realizado`);
          }
        } catch (error) {
          console.warn('⚠️ Erro no upload das imagens adicionais:', error);
        }
      }

      // 4. Criar documento com dados completos
      const documentData = {
        title: formData.title,
        description: formData.description,
        content: JSON.stringify({
          // Dados principais
          description: formData.description,
          
          // Identificação do Documento
          documentType: formData.documentType,
          referenceCode: formData.referenceCode,
          digitalId: formData.digitalId,
          
          // Origem e Responsabilidade
          publicOrgan: formData.publicOrgan,
          responsibleSector: formData.responsibleSector,
          responsible: formData.responsible,
          documentAuthority: formData.documentAuthority,
          
          // Conteúdo e Classificação
          mainSubject: formData.mainSubject,
          confidentialityLevel: formData.confidentialityLevel,
          legalBase: formData.legalBase,
          relatedProcess: formData.relatedProcess,
          
          // Informações Complementares
          availability: formData.availability,
          language: formData.language,
          rights: formData.rights,
          period: formData.period,
          tags: formData.tags,
          
          // Digitalização e Metadados Técnicos
          digitalizationDate: formData.digitalizationDate,
          digitalizationLocation: formData.digitalizationLocation,
          digitalizationResponsible: formData.digitalizationResponsible,
          verificationHash: fileHash,
          
          // Dados do arquivo físico no Supabase Storage
          fileInfo: {
            originalName: uploadedFile.original_name,
            fileName: uploadedFile.filename,
            fileSize: uploadedFile.file_size,
            mimeType: uploadedFile.mime_type,
            uploadPath: uploadedFile.file_path,
            supabaseUrl: uploadedFile.file_path, // URL do Supabase Storage
            supabaseId: uploadedFile.id
          },
          
          // Imagens adicionais se houver
          additionalImages: imagesUploadResults.map(img => ({
            originalName: img.original_name,
            fileName: img.filename,
            fileSize: img.file_size,
            mimeType: img.mime_type,
            uploadPath: img.file_path,
            supabaseId: img.id
          }))
        }),
        category: 'documents',
        author: formData.responsible || formData.digitalizationResponsible || 'Sistema',
        tags: formData.tags || []
      };

      console.log('📤 Criando documento com dados completos:', documentData);

      // 5. Salvar documento no PostgreSQL
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentData)
      });

      if (!response.ok) {
        throw new Error('Erro ao criar documento anexado');
      }

      const newDocument = await response.json();
      console.log('✅ Documento anexado criado:', newDocument.id);

      // 6. Criar relacionamento entre documentos
      const relationResponse = await fetch(`/api/documents/${id}/relate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childDocumentId: newDocument.id,
          relationType: 'anexo',
          description: `Documento anexado: ${newDocument.title}`
        })
      });

      if (!relationResponse.ok) {
        console.warn('⚠️ Erro ao criar relacionamento, mas documento foi criado');
      } else {
        console.log('✅ Relacionamento criado entre documentos');
      }

      // 7. Invalidar cache para atualizar interface
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [`/api/documents/${id}/related`] }),
        queryClient.invalidateQueries({ queryKey: [`/api/documents/${id}`] }),
        queryClient.invalidateQueries({ queryKey: ['/api/documents'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/documents-with-related'] }),
        queryClient.refetchQueries({ queryKey: [`/api/documents/${id}/related`] })
      ]);

      console.log('🎯 Sistema de anexação funcionando - arquivo salvo no Supabase Storage e metadados no PostgreSQL');
      
      toast({
        title: "Sucesso!",
        description: "Documento anexado com sucesso",
      });
      
      setShowDocumentFormModal(false);
      
    } catch (error) {
      console.error('❌ Erro ao anexar documento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível anexar o documento",
        variant: "destructive",
      });
    }
  };

  // Criar ações baseadas no contexto do usuário
  const documentActions = [
    actionService.createDownloadAction(handleDownload),
  ];

  if (isAuthenticated && !isPublicUser) {
    documentActions.push(
      actionService.createEditAction(() => setShowEditModal(true)),
      actionService.createAttachAction(() => setShowDocumentFormModal(true))
    );
  }



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation(isPublicUser ? '/documentos-publicos' : '/gestao-documentos')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                  {actualDocument.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Documento ID: {actualDocument.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Preview do documento */}
          <div className="xl:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Preview do Documento
                </h2>
              </div>
              <div className="p-2">
                <DocumentViewer 
                  documentId={actualDocument.id}
                  fileName={fileName}
                  mimeType={fileType}
                  onDownload={handleDownload}
                  key={`preview-${previewRefreshKey}`}
                />
              </div>
            </div>
          </div>

          {/* Sidebar com metadados e ações */}
          <div className="xl:col-span-1 space-y-6">
            {/* Ações */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <ActionGroup 
                actions={documentActions}
                title="Ações do Documento"
                layout="grid"
                size="md"
              />
            </div>

            {/* Metadados */}
            <MetadataDisplay documentContent={actualDocument?.content || ''} />
          </div>
        </div>

        {/* DOCUMENTOS RELACIONADOS ABAIXO DO DOCUMENTO PRINCIPAL */}
        <div className="mt-8">
          <RelatedDocuments 
            documentId={actualDocument.id} 
            parentDocument={actualDocument}
          />
        </div>
      </div>

      {/* Modais */}
      <AnimatePresence>
        {/* Modal de Edição */}
        {showEditModal && actualDocument && (
          <SimpleEditDocumentModal
            document={actualDocument}
            onClose={() => setShowEditModal(false)}
            onSave={async (updatedData) => {
              try {
                const response = await fetch(`/api/documents/${actualDocument.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updatedData),
                });
                
                if (response.ok) {
                  await queryClient.invalidateQueries({ queryKey: [`/api/documents/${id}`] });
                  setShowEditModal(false);
                }
              } catch (error) {
                console.error('Erro ao atualizar documento:', error);
              }
            }}
          />
        )}

        {/* Modal de Anexar Documento */}
        {showDocumentFormModal && (
          <DocumentFormModal
            isOpen={showDocumentFormModal}
            onClose={() => setShowDocumentFormModal(false)}
            onSubmit={handleDocumentFormSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}