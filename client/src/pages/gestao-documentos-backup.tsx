import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  Grid3X3, 
  List, 
  Folder,
  FileText,
  Image,
  Zap,
  Video,
  Music,
  Archive,
  Link2,
  File,
  FileSpreadsheet,
  Presentation,
  BookOpen,
  Calendar
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { Document, SystemStats } from '@shared/schema';

// Interface para documento com relacionados (estilo Windows Explorer)
interface DocumentWithRelated extends Document {
  relatedDocuments?: Document[];
}
import FileUploadModal from '@/components/FileUploadModal';
import DocumentFormModal from '@/components/DocumentFormModal';
import DigitalizationWizard from '@/components/DigitalizationWizard';
import AttachDocumentModal from '@/components/AttachDocumentModal';

import { supabaseStorageService } from '@/services/supabaseStorageService';

// Categorias disponíveis no sistema
const categories = [
  { name: 'Todos os arquivos', icon: Folder, count: 0, type: 'all' },
  { name: 'Documentos', icon: FileText, count: 0, type: 'Documentos' },
  { name: 'Imagens', icon: Image, count: 0, type: 'Imagens' },
  { name: 'Vídeos', icon: Video, count: 0, type: 'Vídeos' },
  { name: 'Áudio', icon: Music, count: 0, type: 'Áudio' },
  { name: 'Arquivos', icon: Archive, count: 0, type: 'Arquivos' },
  { name: 'Outros', icon: Archive, count: 0, type: 'Outros' },
];

export default function GestaoDocumentos() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDocumentFormOpen, setIsDocumentFormOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [selectedDocumentForAttach, setSelectedDocumentForAttach] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileCategory, setSelectedFileCategory] = useState('');

  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Buscar estatísticas do sistema
  const { data: stats } = useQuery<SystemStats>({
    queryKey: ['/api/stats'],
  });

  // Buscar documentos
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  // Buscar documentos relacionados para cada documento (para estilo Windows Explorer)
  const { data: documentsWithRelated = [], isLoading: isLoadingRelated } = useQuery<DocumentWithRelated[]>({
    queryKey: ['/api/documents-with-related'],
    queryFn: async (): Promise<DocumentWithRelated[]> => {
      if (!documents.length) return [];
      
      const documentsWithRelations = await Promise.all(
        documents.map(async (doc): Promise<DocumentWithRelated> => {
          try {
            const relatedResponse = await fetch(`/api/documents/${doc.id}/related`);
            const related: Document[] = relatedResponse.ok ? await relatedResponse.json() : [];
            return { ...doc, relatedDocuments: related };
          } catch (error) {
            console.error(`Erro ao buscar relacionados para ${doc.id}:`, error);
            return { ...doc, relatedDocuments: [] };
          }
        })
      );
      
      return documentsWithRelations;
    },
    enabled: !!documents.length
  });

  // Filtrar documentos baseado na categoria e busca (usar documentsWithRelated)
  // Remover documentos que já estão anexados dentro de outros documentos
  const allDocumentsWithRelated: DocumentWithRelated[] = documentsWithRelated.length > 0 ? documentsWithRelated : documents.map(doc => ({ ...doc, relatedDocuments: [] }));
  
  // Criar lista de IDs de documentos que são anexados (para remover da lista principal)
  const attachedDocumentIds = new Set<number>();
  allDocumentsWithRelated.forEach(doc => {
    if (doc.relatedDocuments) {
      doc.relatedDocuments.forEach(relatedDoc => {
        attachedDocumentIds.add(relatedDoc.id);
      });
    }
  });

  const filteredDocuments: DocumentWithRelated[] = allDocumentsWithRelated.filter(doc => {
    // Não mostrar documentos que já estão anexados em outros documentos
    if (attachedDocumentIds.has(doc.id)) {
      return false;
    }

    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Contar documentos por categoria (apenas documentos principais, não anexados)
  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    count: cat.type === 'all' 
      ? filteredDocuments.length 
      : filteredDocuments.filter(doc => doc.category === cat.type).length
  }));

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Função melhorada para detectar tipo de arquivo baseado no conteúdo real
  const getFileIcon = (document: Document) => {
    try {
      // Tentar extrair informações do conteúdo do documento
      const documentDetails = JSON.parse(document.content || '{}');
      const fileType = documentDetails?.fileType || documentDetails?.fileInfo?.mimeType || '';
      const fileName = documentDetails?.fileName || documentDetails?.fileInfo?.originalName || document.title;
      
      // Detectar por MIME type primeiro
      if (fileType.includes('pdf') || fileName.toLowerCase().includes('.pdf')) {
        return File;
      }
      if (fileType.includes('word') || fileType.includes('document') || fileName.toLowerCase().includes('.doc')) {
        return BookOpen;
      }
      if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileName.toLowerCase().includes('.xls')) {
        return FileSpreadsheet;
      }
      if (fileType.includes('presentation') || fileType.includes('powerpoint') || fileName.toLowerCase().includes('.ppt')) {
        return Presentation;
      }
      if (fileType.includes('image') || fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) {
        return Image;
      }
      if (fileType.includes('video') || fileName.toLowerCase().match(/\.(mp4|avi|mov|wmv|flv|webm)$/)) {
        return Video;
      }
      if (fileType.includes('audio') || fileName.toLowerCase().match(/\.(mp3|wav|ogg|flac|aac)$/)) {
        return Music;
      }
      
      // Fallback baseado na categoria
      switch (document.category) {
        case 'Imagens': return Image;
        case 'Vídeos': return Video;
        case 'Áudio': return Music;
        case 'Arquivos': return Archive;
        default: return FileText;
      }
    } catch (error) {
      // Se não conseguir parsear o conteúdo, usar categoria padrão
      switch (document.category) {
        case 'Imagens': return Image;
        case 'Vídeos': return Video;
        case 'Áudio': return Music;
        case 'Arquivos': return Archive;
        default: return FileText;
      }
    }
  };

  // Função para obter ícone colorido por tipo de arquivo (estilo Windows Explorer)
  const getFileIconWithColor = (document: Document) => {
    try {
      // Tentar extrair informações do conteúdo do documento
      const documentDetails = JSON.parse(document.content || '{}');
      const fileType = documentDetails?.fileType || documentDetails?.fileInfo?.mimeType || '';
      const fileName = documentDetails?.fileName || documentDetails?.fileInfo?.originalName || document.title;
      
      // Detectar por MIME type primeiro e retornar ícone com cor
      if (fileType.includes('pdf') || fileName.toLowerCase().includes('.pdf')) {
        return { icon: File, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', type: 'PDF', accent: 'bg-red-500' };
      }
      if (fileType.includes('word') || fileType.includes('document') || fileName.toLowerCase().includes('.doc')) {
        return { icon: BookOpen, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', type: 'WORD', accent: 'bg-blue-500' };
      }
      if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileName.toLowerCase().includes('.xls')) {
        return { icon: FileSpreadsheet, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', type: 'EXCEL', accent: 'bg-green-500' };
      }
      if (fileType.includes('presentation') || fileType.includes('powerpoint') || fileName.toLowerCase().includes('.ppt')) {
        return { icon: Presentation, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', type: 'PPT', accent: 'bg-orange-500' };
      }
      if (fileType.includes('image') || fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) {
        return { icon: Image, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', type: 'IMAGE', accent: 'bg-purple-500' };
      }
      if (fileType.includes('video') || fileName.toLowerCase().match(/\.(mp4|avi|mov|wmv|flv|webm)$/)) {
        return { icon: Video, color: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', type: 'VIDEO', accent: 'bg-pink-500' };
      }
      if (fileType.includes('audio') || fileName.toLowerCase().match(/\.(mp3|wav|ogg|flac|aac)$/)) {
        return { icon: Music, color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', type: 'AUDIO', accent: 'bg-indigo-500' };
      }
      
      // Fallback baseado na categoria
      switch (document.category) {
        case 'Imagens': return { icon: Image, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', type: 'IMAGE', accent: 'bg-purple-500' };
        case 'Vídeos': return { icon: Video, color: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', type: 'VIDEO', accent: 'bg-pink-500' };
        case 'Áudio': return { icon: Music, color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', type: 'AUDIO', accent: 'bg-indigo-500' };
        case 'Arquivos': return { icon: Archive, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', type: 'ARCHIVE', accent: 'bg-yellow-500' };
        default: return { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', type: 'DOC', accent: 'bg-gray-500' };
      }
    } catch (error) {
      console.error('Erro ao detectar tipo de arquivo:', error);
      return { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', type: 'DOC', accent: 'bg-gray-500' };
    }
  };

  // Função para lidar com upload de arquivos
  const handleFileUpload = async (file: File, category: string) => {
    try {
      // 1. Fazer upload do arquivo para o Supabase Storage
      const uploadedFiles = await supabaseStorageService.uploadMultipleFiles([file], {
        category: category,
        description: `Documento ${file.name} anexado via upload`,
        tags: [category.toLowerCase(), "upload", "anexado"]
      });

      if (uploadedFiles.length === 0) {
        throw new Error('Falha no upload do arquivo');
      }

      const uploadedFile = uploadedFiles[0];

      // 2. Criar documento na base de dados com referência ao arquivo
      const documentData = {
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove a extensão
        description: `Documento ${file.name} anexado via upload`,
        content: `Arquivo: ${file.name}\nTamanho: ${formatFileSize(file.size)}\nTipo: ${file.type}\nURL: ${uploadedFile.file_path}`,
        category: category,
        author: "Sistema",
        tags: [category.toLowerCase(), "upload", "anexado"]
      };

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData)
      });

      if (!response.ok) {
        throw new Error('Erro ao criar documento');
      }

      // Invalidar cache para recarregar documentos
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      console.log('Documento criado com sucesso:', {
        file: file.name,
        size: file.size,
        category,
        supabaseFileId: uploadedFile.id
      });
      
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao anexar arquivo. Tente novamente.');
    }
  };

  // Função para lidar com seleção de arquivo (abre o formulário)
  const handleFileSelected = (file: File, category: string) => {
    setSelectedFile(file);
    setSelectedFileCategory(category);
    setIsDocumentFormOpen(true);
  };

  // Função para calcular hash SHA-256 do arquivo
  const calculateFileHash = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {
      console.error('Erro ao calcular hash SHA-256:', error);
      return 'HASH_CALCULATION_ERROR';
    }
  };

  // Função para submeter o formulário completo
  const handleDocumentFormSubmit = async (formData: any) => {
    if (!selectedFile) return;

    try {
      // 1. Calcular hash SHA-256 do arquivo
      const fileHash = await calculateFileHash(selectedFile);

      // 2. Fazer upload do arquivo para o Supabase Storage
      const uploadedFiles = await supabaseStorageService.uploadMultipleFiles([selectedFile], {
        category: selectedFileCategory,
        description: formData.description,
        tags: formData.tags || []
      });

      if (uploadedFiles.length === 0) {
        throw new Error('Falha no upload do arquivo');
      }

      const uploadedFile = uploadedFiles[0];

      // 2. Criar documento com dados completos do formulário
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
          
          // Digitalização e Metadados Técnicos
          digitalizationDate: formData.digitalizationDate,
          digitalizationLocation: formData.digitalizationLocation,
          digitalizationResponsible: formData.digitalizationResponsible,
          verificationHash: fileHash,
          
          // Dados do arquivo físico
          fileName: selectedFile.name,
          fileSize: formatFileSize(selectedFile.size),
          fileType: selectedFile.type,
          supabaseUrl: uploadedFile.file_path
        }),
        category: selectedFileCategory,
        author: formData.responsible || formData.digitalizationResponsible,
        tags: formData.tags || []
      };

      console.log('📤 Enviando dados do documento:', documentData);

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData)
      });

      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Erro na resposta:', errorData);
        throw new Error(`Erro ao criar documento: ${errorData}`);
      }

      const responseData = await response.json();
      console.log('✅ Documento criado:', responseData);

      if (!response.ok) {
        throw new Error('Erro ao criar documento');
      }

      // Invalidação robusta de cache com múltiplas tentativas
      console.log('🔄 Iniciando invalidação robusta de cache (upload principal)...');
      
      // Primeira wave: invalidação imediata
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/documents'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/documents-with-related'] })
      ]);
      
      // Aguardar sincronização servidor-cliente
      await new Promise(resolve => setTimeout(resolve, 250));
      
      // Segunda wave: refetch forçado
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['/api/documents'] }),
        queryClient.refetchQueries({ queryKey: ['/api/stats'] }),
        queryClient.refetchQueries({ queryKey: ['/api/documents-with-related'] })
      ]);
      
      // Terceira wave: invalidação final após delay
      await new Promise(resolve => setTimeout(resolve, 150));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/documents'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] })
      ]);

      console.log('✅ Cache invalidado completamente (upload principal)!');
      
      // Resetar estados
      setSelectedFile(null);
      setSelectedFileCategory('');
      setIsDocumentFormOpen(false);
      
      console.log('Documento criado com sucesso com formulário completo:', {
        supabaseFileId: uploadedFile.id,
        title: formData.title
      });
      
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      console.error('Tipo do erro:', typeof error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
      console.error('Mensagem:', error instanceof Error ? error.message : JSON.stringify(error));
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar documento';
      alert(`Erro ao salvar documento: ${errorMessage}`);
    }
  }

  const handleDownloadDocument = async (doc: any) => {
    try {
      // Tentar encontrar o arquivo no Supabase Storage através do conteúdo
      const urlMatch = doc.content?.match(/URL:\s*([^\n]+)/);
      
      if (urlMatch && urlMatch[1]) {
        // Arquivo existe no Supabase Storage
        const filePath = urlMatch[1];
        
        // Buscar arquivos no Supabase para encontrar o arquivo correspondente
        const allFiles = await supabaseStorageService.listFilesByBucket();
        const supabaseFile = allFiles.find(file => file.file_path === filePath);
        
        if (supabaseFile) {
          // Usar o serviço Supabase para download
          const downloadUrl = await supabaseStorageService.getDownloadUrl(supabaseFile);
          
          // Criar link temporário para download
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = supabaseFile.original_name;
          link.target = '_blank';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        }
      }
      
      // Fallback: download como texto (para documentos antigos)
      const element = window.document.createElement('a');
      const file = new Blob([`Documento: ${doc.title}\n\nConteúdo: ${doc.content || doc.description || 'Conteúdo do documento...'}\n\nAutor: ${doc.author}\nCategoria: ${doc.category || 'Não especificada'}`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${doc.title || 'documento'}.txt`;
      window.document.body.appendChild(element);
      element.click();
      window.document.body.removeChild(element);
      
    } catch (error) {
      console.error('Erro no download:', error);
      alert('Erro ao baixar arquivo. Tente novamente.');
    }
  };

  // Função para deletar documento com confirmação
  const handleDeleteDocument = async (document: Document) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja deletar o documento "${document.title}"?\n\nEsta ação não pode ser desfeita.`
    );
    
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar documento');
      }

      // Invalidar todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/documents-with-related'] });
      
      // Pequeno delay para permitir que o servidor processe
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Forçar refetch imediato
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['/api/documents'] }),
        queryClient.refetchQueries({ queryKey: ['/api/stats'] }),
        queryClient.refetchQueries({ queryKey: ['/api/documents-with-related'] })
      ]);
      
      console.log('Documento deletado com sucesso:', document.title);
      
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      alert('Erro ao deletar documento. Tente novamente.');
    }
  };

  const handleAttachDocument = (documentId: number) => {
    setSelectedDocumentForAttach(documentId);
    setIsAttachModalOpen(true);
  };

  const handleAttachSuccess = async () => {
    console.log('🔄 Invalidação de cache após anexo bem-sucedido...');
    
    // Invalidação robusta após anexar documento
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/documents-with-related'] })
    ]);
    
    // Delay para sincronização
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Refetch forçado
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['/api/documents'] }),
      queryClient.refetchQueries({ queryKey: ['/api/stats'] })
    ]);
    
    console.log('✅ Cache atualizado após anexo!');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-4rem)]">
      {/* Header com informações de nível de acesso */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Folder className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Gestão de Arquivos
              </h1>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              Nível de acesso: 2
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Anexar Arquivos
            </Button>
            <Button 
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
              onClick={() => setIsWizardOpen(true)}
            >
              <Zap className="h-4 w-4 mr-2" />
              Assistente
            </Button>
          </div>
        </div>
      </div>

      {/* Estatísticas principais */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {filteredDocuments.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Documentos Principais
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  432.1 KB
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Espaço Utilizado
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {attachedDocumentIds.size}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Documentos Anexados
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {categoriesWithCounts.filter(cat => cat.count > 0 && cat.type !== 'all').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Tipos de Arquivo
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informação de permissão */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            <span className="text-sm">
              <strong>Nível de acesso: 2</strong> - Você tem acesso completo para gerenciar documentos.
            </span>
          </div>
        </div>

        {/* Área principal com sidebar e conteúdo */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar com categorias */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categorias</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {categoriesWithCounts.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === category.type;
                    
                    return (
                      <button
                        key={category.type}
                        onClick={() => setSelectedCategory(category.type)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                          isSelected && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={cn(
                            "h-4 w-4",
                            isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                          )} />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Área principal de conteúdo */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar arquivos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/test-upload-real', { method: 'POST' });
                          if (response.ok) {
                            queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
                            alert('Documento de teste criado com sucesso!');
                          }
                        } catch (error) {
                          alert('Erro ao criar documento de teste');
                        }
                      }}
                    >
                      Teste Real
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredDocuments.length} arquivo(s) anexado(s)
                  </span>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">Carregando arquivos...</div>
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchQuery ? 'Nenhum arquivo encontrado' : 'Nenhum arquivo disponível'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className={cn(
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                      : 'space-y-2'
                  )}>
                    {filteredDocuments.map((document: DocumentWithRelated) => {
                      const fileInfo = getFileIconWithColor(document);
                      const { icon: Icon, color, bgColor, borderColor, type, accent } = fileInfo;
                      const relatedDocs = document.relatedDocuments || [];
                      
                      return viewMode === 'grid' ? (
                        <Card key={document.id} className="group hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden bg-white">
                            <CardContent className="p-0">
                              {/* Header com gradiente colorido */}
                              <div className={cn("h-3 bg-gradient-to-r", accent)}></div>
                              
                              <div className="p-6">
                                {/* Header do documento */}
                                <div className="flex items-start gap-4 mb-4">
                                  <div className={cn("p-3 rounded-xl shadow-lg", bgColor, "border-2", borderColor)}>
                                    <Icon className={cn("h-7 w-7", color)} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2 mb-2 leading-tight">
                                      {document.title}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                      <Badge variant="outline" className={cn("font-semibold px-3 py-1.5 text-sm", color, borderColor, "border-2")}>
                                        {type}
                                      </Badge>
                                      <span className="text-sm text-gray-500 font-medium">432.1 KB</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Metadados bem organizados */}
                                {(() => {
                                  try {
                                    const documentDetails = JSON.parse(document.content || '{}');
                                    const description = documentDetails?.description || document.description;
                                    const subject = documentDetails?.mainSubject || documentDetails?.subject || documentDetails?.assunto;
                                    const tags = documentDetails?.tags || document.tags || [];
                                    
                                    return (
                                      <div className="space-y-4 mb-5">
                                        {/* Descrição com destaque */}
                                        {description && (
                                          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                              <span className="font-bold text-blue-800 text-sm uppercase tracking-wide">Descrição</span>
                                            </div>
                                            <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">
                                              {description}
                                            </p>
                                          </div>
                                        )}
                                        
                                        {/* Assunto com destaque */}
                                        {subject && (
                                          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                              <span className="font-bold text-green-800 text-sm uppercase tracking-wide">Assunto</span>
                                            </div>
                                            <p className="text-gray-700 text-sm line-clamp-1 leading-relaxed font-medium">
                                              {subject}
                                            </p>
                                          </div>
                                        )}
                                        
                                        {/* Tags com destaque */}
                                        {tags && tags.length > 0 && (
                                          <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                                            <div className="flex items-center gap-2 mb-3">
                                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                              <span className="font-bold text-purple-800 text-sm uppercase tracking-wide">Palavras-chave</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                              {tags.slice(0, 3).map((tag: string, index: number) => (
                                                <Badge key={index} className="bg-purple-100 text-purple-800 border-purple-200 font-semibold px-3 py-1.5 text-xs shadow-sm">
                                                  {tag}
                                                </Badge>
                                              ))}
                                              {tags.length > 3 && (
                                                <Badge className="bg-gray-100 text-gray-600 border-gray-200 font-semibold px-3 py-1.5 text-xs shadow-sm">
                                                  +{tags.length - 3} mais
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  } catch (error) {
                                    return (
                                      <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded-r-lg mb-4">
                                        <p className="text-sm text-gray-600 italic">
                                          {document.description || 'Sem informações adicionais disponíveis'}
                                        </p>
                                      </div>
                                    );
                                  }
                                })()}
                                
                                {/* Footer do card com data e botões */}
                                <div className="flex items-center justify-between pt-5 border-t border-gray-200">
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    <span className="font-medium">
                                      {document.createdAt ? formatDate(document.createdAt) : 'Data não disponível'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => setLocation(`/document/${document.id}`)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 shadow-sm"
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      Detalhes
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownloadDocument(document)}
                                      className="border-green-600 text-green-600 hover:bg-green-50 font-medium px-3 py-1.5"
                                    >
                                      <Download className="h-3 w-3 mr-1" />
                                      Baixar
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleAttachDocument(document.id)}
                                      className="border-purple-600 text-purple-600 hover:bg-purple-50 font-medium px-3 py-1.5"
                                    >
                                      <Link2 className="h-3 w-3 mr-1" />
                                      Anexar
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteDocument(document)}
                                      className="border-red-600 text-red-600 hover:bg-red-50 font-medium px-3 py-1.5"
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Excluir
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          // List view rendering starts here
                          <Card key={document.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <div className={cn("p-2 rounded-lg", bgColor, borderColor, "border-2")}>
                                  <Icon className={cn("h-5 w-5", color)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate mb-2">
                                    {document.title}
                                  </h3>
                                  
                                  {/* Layout horizontal para lista */}
                                  {(() => {
                                    try {
                                      const documentDetails = JSON.parse(document.content || '{}');
                                      const description = documentDetails?.description || document.description;
                                      const subject = documentDetails?.mainSubject || documentDetails?.subject || documentDetails?.assunto;
                                      const tags = documentDetails?.tags || document.tags || [];
                                      
                                      return (
                                        <div className="flex items-center gap-6 text-sm">
                                          {/* Descrição horizontal */}
                                          {description && (
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                              <span className="font-medium text-blue-700">Descrição:</span>
                                              <span className="text-gray-700 truncate max-w-[200px]">{description}</span>
                                            </div>
                                          )}
                                          
                                          {/* Assunto horizontal */}
                                          {subject && (
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                              <span className="font-medium text-green-700">Assunto:</span>
                                              <span className="text-gray-700 truncate max-w-[150px]">{subject}</span>
                                            </div>
                                          )}
                                          
                                          {/* Tags horizontais */}
                                          {tags && tags.length > 0 && (
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                                              <span className="font-medium text-purple-700">Tags:</span>
                                              <div className="flex gap-1">
                                                {tags.slice(0, 2).map((tag: string, index: number) => (
                                                  <Badge key={index} className="bg-purple-100 text-purple-800 border-purple-200 text-xs px-2 py-1">
                                                    {tag}
                                                  </Badge>
                                                ))}
                                                {tags.length > 2 && (
                                                  <Badge className="bg-gray-100 text-gray-600 text-xs px-2 py-1">
                                                    +{tags.length - 2}
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    } catch (error) {
                                      return (
                                        <p className="text-sm text-gray-600 italic">
                                          {document.description || 'Sem informações adicionais'}
                                        </p>
                                      );
                                    }
                                  })()}
                                </div>
                                
                                {/* Informações da direita */}
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <Badge variant="outline" className={cn("mb-2", color, borderColor, "border-2")}>
                                      {type}
                                    </Badge>
                                    <div className="text-sm text-gray-500">
                                      <span className="font-medium">432.1 KB</span>
                                    </div>
                                    <div className="text-sm text-gray-400">
                                      {document.createdAt ? formatDate(document.createdAt) : 'Data não disponível'}
                                    </div>
                                  </div>
                                  
                                  {/* Botões de ação */}
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => setLocation(`/document/${document.id}`)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Detalhes
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownloadDocument(document)}
                                      className="border-green-600 text-green-600 hover:bg-green-50"
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Baixar
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleAttachDocument(document.id)}
                                      className="border-purple-600 text-purple-600 hover:bg-purple-50"
                                    >
                                      <Link2 className="h-4 w-4 mr-1" />
                                      Anexar
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteDocument(document)}
                                      className="border-red-600 text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Excluir
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                                              "hover:shadow-sm transition-shadow"
                                            )}
                                          >
                                            <RelatedIcon className={cn("h-3 w-3 flex-shrink-0", relatedFileInfo.color)} />
                                            <span className="truncate text-gray-700">
                                              {relatedDoc.title.length > 12 
                                                ? relatedDoc.title.substring(0, 12) + '...' 
                                                : relatedDoc.title}
                                            </span>
                                          </div>
                                        );
                                      })}
                                      {relatedDocs.length > 4 && (
                                        <div className="flex items-center justify-center p-2 rounded border border-gray-200 bg-gray-50 text-xs text-gray-500">
                                          +{relatedDocs.length - 4} mais
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Ações */}
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-blue-600 hover:text-blue-700 text-xs"
                                      onClick={() => setLocation(`/document/${document.id}`)}
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      Detalhes
                                    </Button>
                                    <div className="flex items-center gap-1">
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => handleDownloadDocument(document)}
                                      >
                                        <Download className="h-3 w-3" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-600 hover:text-red-700 text-xs"
                                        onClick={() => handleDeleteDocument(document)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      } else {
                        return (
                          <div key={document.id} className={cn(
                            "flex items-center gap-4 p-3 rounded-lg hover:shadow-md transition-all duration-200 border-l-4",
                            fileInfo.bgColor,
                            fileInfo.accent.replace('bg-', 'border-l-')
                          )}>
                            <div className={cn("p-2 rounded-lg", fileInfo.bgColor, fileInfo.borderColor, "border")}>
                              <Icon className={cn("h-5 w-5", fileInfo.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                  {document.title}
                                </h3>
                                <Badge variant="outline" className={cn("text-xs", fileInfo.color, fileInfo.borderColor)}>
                                  {fileInfo.type}
                                </Badge>
                              </div>
                              {/* Campos do formulário: Descrição, Assunto, Tags - versão horizontal */}
                              {(() => {
                                try {
                                  const documentDetails = JSON.parse(document.content || '{}');
                                  const description = documentDetails?.description || document.description;
                                  const subject = documentDetails?.subject || documentDetails?.assunto;
                                  const tags = documentDetails?.tags || document.tags || [];
                                  
                                  return (
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                                      {/* Primeira linha: info básica */}
                                      <div className="flex items-center gap-4 text-gray-500">
                                        <span>432.1 KB</span>
                                        <span>{document.category || 'Documentos'}</span>
                                        <span>{document.createdAt ? formatDate(document.createdAt as Date | string) : 'Data não disponível'} • Sistema</span>
                                        {relatedDocs.length > 0 && (
                                          <span className="text-blue-600 font-medium">
                                            • {relatedDocs.length} anexo(s)
                                          </span>
                                        )}
                                      </div>
                                      
                                      {/* Segunda linha: Descrição e Assunto */}
                                      <div className="flex items-center gap-6">
                                        {description && (
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-blue-700">Descrição:</span>
                                            <span className="truncate max-w-xs">
                                              {description.length > 50 ? description.substring(0, 50) + '...' : description}
                                            </span>
                                          </div>
                                        )}
                                        {subject && (
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-green-700">Assunto:</span>
                                            <span className="truncate max-w-xs">
                                              {subject.length > 40 ? subject.substring(0, 40) + '...' : subject}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Terceira linha: Tags */}
                                      {tags && tags.length > 0 && (
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-purple-700">Tags:</span>
                                          <div className="flex flex-wrap gap-1">
                                            {tags.slice(0, 4).map((tag: string, index: number) => (
                                              <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700">
                                                {tag}
                                              </Badge>
                                            ))}
                                            {tags.length > 4 && (
                                              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600">
                                                +{tags.length - 4}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                } catch (error) {
                                  return (
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                      <span>432.1 KB</span>
                                      <span>{document.category || 'Documentos'}</span>
                                      <span>{document.createdAt ? formatDate(document.createdAt as Date | string) : 'Data não disponível'} • Sistema</span>
                                      {relatedDocs.length > 0 && (
                                        <span className="text-blue-600 font-medium">
                                          • {relatedDocs.length} anexo(s)
                                        </span>
                                      )}
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-blue-600 hover:text-blue-700"
                                onClick={() => setLocation(`/document/${document.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDownloadDocument(document)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-purple-600 hover:text-purple-700"
                                onClick={() => handleAttachDocument(document.id)}
                                title="Anexar Documentos Relacionados"
                              >
                                <Link2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteDocument(document)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Upload */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleFileUpload}
        onFileSelected={handleFileSelected}
      />

      {/* Modal do Formulário de Documento */}
      <DocumentFormModal
        isOpen={isDocumentFormOpen}
        onClose={() => setIsDocumentFormOpen(false)}
        onSubmit={handleDocumentFormSubmit}
        fileName={selectedFile?.name || ''}
      />

      {/* Assistente de Digitalização */}
      <DigitalizationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={(data) => {
          console.log('Wizard completado:', data);
          setIsWizardOpen(false);
          // Aqui você pode processar os dados do wizard se necessário
        }}
      />

      {/* Modal de Anexar Documentos Relacionados */}
      {selectedDocumentForAttach && (
        <AttachDocumentModal
          isOpen={isAttachModalOpen}
          onClose={() => {
            setIsAttachModalOpen(false);
            setSelectedDocumentForAttach(null);
          }}
          parentDocumentId={selectedDocumentForAttach}
          onSuccess={handleAttachSuccess}
        />
      )}


    </div>
  );
}