import { useState, useEffect } from 'react';
import ExcelViewer from './ExcelViewer';
import WordViewer from './WordViewer';
import AdvancedPDFViewer from './AdvancedPDFViewer';
import ImageViewer from './ImageViewer';
import VideoViewer from './VideoViewer';
import AudioViewer from './AudioViewer';
import TextViewer from './TextViewer';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, FileIcon } from 'lucide-react';

interface UniversalDocumentViewerV2Props {
  documentId: number;
  fileName: string;
  fileType: string;
  onDownload?: () => void;
}

export default function UniversalDocumentViewerV2({ 
  documentId, 
  fileName, 
  fileType, 
  onDownload 
}: UniversalDocumentViewerV2Props) {
  const [detectedType, setDetectedType] = useState<string>('unknown');

  useEffect(() => {
    detectFileType();
  }, [fileName, fileType]);

  const detectFileType = () => {
    const name = fileName.toLowerCase();
    const type = fileType.toLowerCase();

    // Detectar PDFs
    if (type.includes('pdf') || name.includes('.pdf')) {
      setDetectedType('pdf');
      return;
    }

    // Detectar Excel/Planilhas
    if (
      type.includes('excel') || 
      type.includes('spreadsheet') || 
      type.includes('csv') ||
      name.includes('.xlsx') || 
      name.includes('.xls') || 
      name.includes('.csv')
    ) {
      setDetectedType('excel');
      return;
    }

    // Detectar Word
    if (
      type.includes('word') || 
      type.includes('document') || 
      name.includes('.docx') || 
      name.includes('.doc')
    ) {
      setDetectedType('word');
      return;
    }

    // Detectar PowerPoint
    if (
      type.includes('powerpoint') || 
      type.includes('presentation') || 
      name.includes('.pptx') || 
      name.includes('.ppt')
    ) {
      setDetectedType('powerpoint');
      return;
    }

    // Detectar Imagens
    if (
      type.includes('image') || 
      name.includes('.jpg') || 
      name.includes('.jpeg') || 
      name.includes('.png') || 
      name.includes('.gif') || 
      name.includes('.bmp') || 
      name.includes('.webp') || 
      name.includes('.svg')
    ) {
      setDetectedType('image');
      return;
    }

    // Detectar Vídeos
    if (
      type.includes('video') || 
      name.includes('.mp4') || 
      name.includes('.avi') || 
      name.includes('.mov') || 
      name.includes('.wmv') || 
      name.includes('.flv') || 
      name.includes('.webm') || 
      name.includes('.mkv')
    ) {
      setDetectedType('video');
      return;
    }

    // Detectar Áudio
    if (
      type.includes('audio') || 
      name.includes('.mp3') || 
      name.includes('.wav') || 
      name.includes('.ogg') || 
      name.includes('.flac') || 
      name.includes('.aac') || 
      name.includes('.m4a')
    ) {
      setDetectedType('audio');
      return;
    }

    // Detectar Arquivos de Texto
    if (
      type.includes('text') || 
      name.includes('.txt') || 
      name.includes('.rtf') || 
      name.includes('.md') || 
      name.includes('.json') || 
      name.includes('.xml') || 
      name.includes('.html') || 
      name.includes('.css') || 
      name.includes('.js')
    ) {
      setDetectedType('text');
      return;
    }

    // Detectar Arquivos Compactados
    if (
      type.includes('zip') || 
      type.includes('rar') || 
      type.includes('7z') || 
      name.includes('.zip') || 
      name.includes('.rar') || 
      name.includes('.7z') || 
      name.includes('.tar') || 
      name.includes('.gz')
    ) {
      setDetectedType('archive');
      return;
    }

    // Outros tipos
    setDetectedType('other');
  };

  // Renderizar visualizador específico baseado no tipo
  switch (detectedType) {
    case 'pdf':
      return (
        <AdvancedPDFViewer
          documentId={documentId}
          fileName={fileName}
          onDownload={onDownload}
        />
      );

    case 'excel':
      return (
        <ExcelViewer
          documentId={documentId}
          fileName={fileName}
          onDownload={onDownload}
        />
      );

    case 'word':
      return (
        <WordViewer
          documentId={documentId}
          fileName={fileName}
          onDownload={onDownload}
        />
      );

    case 'powerpoint':
      return (
        <PowerPointFallback
          documentId={documentId}
          fileName={fileName}
          onDownload={onDownload}
        />
      );

    case 'image':
      return (
        <ImageViewer
          documentId={documentId}
          fileName={fileName}
          onDownload={onDownload}
        />
      );

    case 'video':
      return (
        <VideoViewer
          documentId={documentId}
          fileName={fileName}
          onDownload={onDownload}
        />
      );

    case 'audio':
      return (
        <AudioViewer
          documentId={documentId}
          fileName={fileName}
          onDownload={onDownload}
        />
      );

    case 'text':
      return (
        <TextViewer
          documentId={documentId}
          fileName={fileName}
          onDownload={onDownload}
        />
      );

    case 'archive':
      return (
        <GenericFileViewer
          documentId={documentId}
          fileName={fileName}
          fileType="Arquivo Compactado"
          onDownload={onDownload}
        />
      );

    case 'other':
    default:
      return (
        <GenericFileViewer
          documentId={documentId}
          fileName={fileName}
          fileType={fileType}
          onDownload={onDownload}
        />
      );
  }
}

// Componente para PowerPoint
function PowerPointFallback({ documentId, fileName, onDownload }: { documentId: number; fileName: string; onDownload?: () => void }) {
  return (
    <div className="h-[600px] p-8 flex flex-col items-center justify-center text-center">
      <div className="max-w-md">
        <div className="bg-orange-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-12 h-12 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Apresentação PowerPoint</h3>
        <p className="text-gray-600 mb-6">
          Este é uma apresentação PowerPoint. Para visualizar os slides, 
          use uma das opções abaixo:
        </p>
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => window.open(`/api/documents/${documentId}/view`, '_blank')}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Abrir Foto
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Arquivo: {fileName}
        </p>
      </div>
    </div>
  );
}

// Componente genérico para outros arquivos
function GenericFileViewer({ documentId, fileName, fileType, onDownload }: { documentId: number; fileName: string; fileType: string; onDownload?: () => void }) {
  const getFileIcon = (type: string) => {
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎥';
    if (type.includes('audio')) return '🎵';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📄';
  };

  return (
    <div className="flex items-center justify-center h-[600px] text-center">
      <div>
        <div className="text-6xl mb-4">{getFileIcon(fileType)}</div>
        <h4 className="font-medium text-gray-800 mb-2">{fileName}</h4>
        <p className="text-sm text-gray-600 mb-4">
          Tipo: {fileType}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Preview não disponível para este tipo de arquivo
        </p>
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => window.open(`/api/documents/${documentId}/view`, '_blank')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Abrir Foto
          </Button>

        </div>
      </div>
    </div>
  );
}