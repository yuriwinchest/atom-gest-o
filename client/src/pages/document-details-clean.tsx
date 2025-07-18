import { useParams, useLocation, Link } from "wouter";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ExternalLink, Edit, Trash2, Paperclip, HelpCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import DocumentViewer from "@/components/DocumentViewer/DocumentViewer";
import MetadataDisplay from "@/components/Metadata/MetadataDisplay";
import { ActionGroup } from "@/components/Actions/ActionGroup";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import EditDocumentModal from "@/components/EditDocumentModal";
import DocumentFormModal from "@/components/DocumentFormModal";
import RelatedDocuments from "@/components/RelatedDocuments";
import { useDocument } from "@/hooks/useDocument";
import { ActionService } from "@/services/ActionService";
import type { Document } from "@shared/schema";

export default function DocumentDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isAdmin } = useAuth();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const { document, isLoading, fileInfo } = useDocument({ documentId: Number(id) });
  const actionService = ActionService.getInstance();

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
            onClick={() => setLocation('/')} 
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

  const handleAttachSubmit = async (formData: any, attachedImages?: File[], mainFile?: File) => {
    try {
      // Lógica de anexar documento (similar à gestão de documentos)
      console.log('Anexando documento:', formData, attachedImages, mainFile);
      
      // Invalidar cache e fechar modal
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${id}/related`] });
      setShowAttachModal(false);
    } catch (error) {
      console.error('Erro ao anexar documento:', error);
    }
  };

  console.log('🔍 Document Details Component - Rendering botões');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation(isPublicUser ? '/documentos-publicos' : '/')}
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
        <div className="space-y-8">
          {/* Preview do documento */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Preview do Documento
              </h2>
              
              {/* Ações inline no header */}
              <div className="flex gap-2">
                <Button onClick={handleDownload} size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
                <Button onClick={() => setShowEditModal(true)} size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button onClick={() => setShowAttachModal(true)} size="sm" variant="outline">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Anexar
                </Button>
              </div>
            </div>
            <div className="p-1">
              <DocumentViewer 
                documentId={actualDocument.id}
                fileName={fileName}
                mimeType={fileType}
                onDownload={handleDownload}
              />
            </div>
          </div>

          {/* Metadados abaixo do preview */}
          <MetadataDisplay documentContent={actualDocument?.content || ''} />

          {/* Documentos relacionados */}
          <RelatedDocuments documentId={actualDocument.id} />
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showEditModal && (
          <EditDocumentModal
            document={actualDocument}
            onClose={() => setShowEditModal(false)}
            onSave={() => {
              setShowEditModal(false);
              queryClient.invalidateQueries({ queryKey: [`/api/documents/${id}`] });
            }}
          />
        )}
        
        {showAttachModal && (
          <DocumentFormModal
            isOpen={showAttachModal}
            onClose={() => setShowAttachModal(false)}
            onSubmit={handleAttachSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}