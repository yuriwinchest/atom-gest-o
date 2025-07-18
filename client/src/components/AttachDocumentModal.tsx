import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { Link2, FileText, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FileUploadModal from './FileUploadModal';
import DocumentFormModal from './DocumentFormModal';
import { supabaseStorageService } from '@/services/supabaseStorageService';

interface AttachDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentDocumentId: number;
  onSuccess: () => void;
}

export default function AttachDocumentModal({ 
  isOpen, 
  onClose, 
  parentDocumentId,
  onSuccess 
}: AttachDocumentModalProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDocumentFormOpen, setIsDocumentFormOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileCategory, setSelectedFileCategory] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Função para lidar com seleção de arquivo
  const handleFileSelected = (file: File, category: string) => {
    setSelectedFile(file);
    setSelectedFileCategory(category);
    setIsUploadModalOpen(false);
    setIsDocumentFormOpen(true);
  };

  // Função para criar novo documento anexado
  const handleDocumentFormSubmit = async (formData: any, attachedJpg?: File) => {
    try {
      if (!selectedFile) {
        throw new Error('Nenhum arquivo selecionado');
      }

      // 1. Calcular hash SHA-256 do arquivo
      const fileHash = await calculateFileHash(selectedFile);

      // 2. Upload do arquivo para o Supabase Storage
      const uploadedFile = await supabaseStorageService.uploadFileToSupabase(
        selectedFile,
        {
          description: formData.description,
          tags: formData.tags || [],
          category: selectedFileCategory
        }
      );

      // 2.1. Upload do JPG adicional se fornecido
      let jpgUploadResult = null;
      if (attachedJpg) {
        try {
          jpgUploadResult = await supabaseStorageService.uploadFileToSupabase(
            attachedJpg,
            {
              description: `Imagem adicional para ${formData.title}`,
              tags: formData.tags || [],
              category: 'images'
            }
          );
          console.log('✅ Upload do JPG adicional realizado:', jpgUploadResult);
        } catch (error) {
          console.warn('⚠️ Erro no upload do JPG adicional:', error);
        }
      }

      // 3. Criar documento com dados completos do formulário
      const documentData = {
        title: formData.title,
        description: formData.description,
        content: JSON.stringify({
          description: formData.description,
          documentType: formData.documentType,
          referenceCode: formData.referenceCode,
          digitalId: formData.digitalId,
          publicOrgan: formData.publicOrgan,
          responsibleSector: formData.responsibleSector,
          responsible: formData.responsible,
          period: formData.period,
          mainSubject: formData.mainSubject,
          confidentialityLevel: formData.confidentialityLevel,
          legalBase: formData.legalBase,
          relatedProcess: formData.relatedProcess,
          availability: formData.availability,
          language: formData.language,
          rights: formData.rights,
          tags: formData.tags,
          digitalizationDate: formData.digitalizationDate,
          digitalizationLocation: formData.digitalizationLocation,
          digitalizationResponsible: formData.digitalizationResponsible,
          documentAuthority: formData.documentAuthority,
          verificationHash: fileHash,
          fileInfo: {
            originalName: uploadedFile.original_name,
            fileName: uploadedFile.filename,
            fileSize: uploadedFile.file_size,
            mimeType: uploadedFile.mime_type,
            uploadPath: uploadedFile.file_path
          },
          // Adicionar informações do JPG se existir
          ...(jpgUploadResult && {
            additionalImageInfo: {
              originalName: jpgUploadResult.original_name,
              fileName: jpgUploadResult.filename,
              fileSize: jpgUploadResult.file_size,
              mimeType: jpgUploadResult.mime_type,
              uploadPath: jpgUploadResult.file_path
            }
          })
        }),
        tags: formData.tags,
        category: selectedFileCategory,
        author: 'Sistema'
      };

      // 3. Salvar documento na API
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentData)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar documento');
      }

      const newDocument = await response.json();

      // 4. Criar relacionamento automaticamente com o documento pai
      const relationResponse = await fetch(`/api/documents/${parentDocumentId}/relate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childDocumentId: newDocument.id,
          relationType: 'attached',
          description: `Documento anexado: ${formData.title}`,
          createdBy: 1
        })
      });

      if (!relationResponse.ok) {
        console.warn('Documento criado mas falha ao criar relacionamento');
      }

      // 5. Invalidação agressiva de cache com múltiplas tentativas
      console.log('🔄 Iniciando invalidação robusta de cache...');
      
      // Primeira invalidação imediata
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/documents'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/documents-with-related'] }),
        queryClient.invalidateQueries({ queryKey: [`/api/documents/${parentDocumentId}/related`] })
      ]);
      
      // Aguardar sincronização servidor-cliente
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Segunda wave: refetch forçado
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['/api/documents'] }),
        queryClient.refetchQueries({ queryKey: ['/api/stats'] }),
        queryClient.refetchQueries({ queryKey: ['/api/documents-with-related'] }),
        queryClient.refetchQueries({ queryKey: [`/api/documents/${parentDocumentId}/related`] })
      ]);
      
      // Terceira wave: invalidação final após delay
      await new Promise(resolve => setTimeout(resolve, 100));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/documents'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] })
      ]);

      console.log('✅ Cache invalidado completamente!');

      toast({
        title: "Sucesso!",
        description: `Documento criado e anexado com sucesso${jpgUploadResult ? ' com imagem adicional' : ''}`,
      });

      // Reset states
      setSelectedFile(null);
      setSelectedFileCategory('');
      setIsDocumentFormOpen(false);
      
      // Chamar onSuccess com delay para garantir propagação
      setTimeout(() => {
        onSuccess();
      }, 50);
      
      onClose();

    } catch (error) {
      console.error('Erro ao criar documento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o documento",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Link2 className="h-5 w-5 text-blue-600" />
              Anexar Novo Documento
            </DialogTitle>
          </DialogHeader>

          <div className="text-center py-8">
            <FileText className="h-16 w-16 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-medium mb-2">Criar Documento Relacionado</h3>
            <p className="text-sm text-gray-600 mb-6">
              Faça o upload de um arquivo e preencha o formulário para criar um novo documento anexado.
            </p>
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Selecionar Arquivo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Upload */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFileSelected={handleFileSelected}
      />

      {/* Modal do Formulário de Documento */}
      <DocumentFormModal
        isOpen={isDocumentFormOpen}
        onClose={() => setIsDocumentFormOpen(false)}
        onSubmit={handleDocumentFormSubmit}
        fileName={selectedFile?.name || ''}
      />
    </>
  );
}