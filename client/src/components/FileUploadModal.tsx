import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Upload, FileText, FileImage, Music, Video, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload?: (file: File, type: string) => void;
  onFileSelected: (file: File, category: string) => void;
}

const fileTypes = [
  {
    id: "pdf",
    title: "PDF",
    description: "Documentos PDF",
    icon: FileText,
    color: "bg-red-500",
    category: "documento"
  },
  {
    id: "word",
    title: "Word",
    description: "Documentos Word (.doc, .docx)",
    icon: FileText,
    color: "bg-blue-500",
    category: "documento"
  },
  {
    id: "excel",
    title: "Excel",
    description: "Planilhas Excel (.xls, .xlsx)",
    icon: FileText,
    color: "bg-green-500",
    category: "planilha"
  },
  {
    id: "ppt",
    title: "PowerPoint",
    description: "Apresentações (.ppt, .pptx)",
    icon: FileText,
    color: "bg-orange-500",
    category: "apresentacao"
  },
  {
    id: "image",
    title: "Imagem",
    description: "JPG, PNG, GIF, BMP, SVG, WEBP",
    icon: FileImage,
    color: "bg-purple-500",
    category: "imagem"
  },
  {
    id: "audio",
    title: "Áudio",
    description: "MP3, WAV, FLAC, AAC, OGG",
    icon: Music,
    color: "bg-pink-500",
    category: "audio"
  },
  {
    id: "video",
    title: "Vídeo",
    description: "MP4, AVI, MOV, WMV",
    icon: Video,
    color: "bg-blue-600",
    category: "video"
  },
  {
    id: "archive",
    title: "Compactado",
    description: "ZIP, RAR, 7Z, TAR",
    icon: Archive,
    color: "bg-gray-600",
    category: "arquivo"
  }
];

export default function FileUploadModal({ isOpen, onClose, onUpload, onFileSelected }: FileUploadModalProps) {
  const handleFileSelect = (typeId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = getAcceptType(typeId);
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const fileType = fileTypes.find(t => t.id === typeId);
        if (fileType) {
          onFileSelected(file, fileType.category);
          onClose();
        }
      }
    };
    
    input.click();
  };

  const getAcceptType = (typeId: string) => {
    switch (typeId) {
      case "pdf": return ".pdf";
      case "word": return ".doc,.docx";
      case "excel": return ".xls,.xlsx";
      case "ppt": return ".ppt,.pptx";
      case "image": return "image/*";
      case "audio": return "audio/*";
      case "video": return "video/*";
      case "archive": return ".zip,.rar,.7z,.tar";
      default: return "*";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] bg-white border-0 p-0 flex flex-col [&>button]:hidden">
        {/* Header com gradiente - responsivo */}
        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white p-3 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg flex-shrink-0">
                <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-sm sm:text-xl font-semibold leading-tight">Escolha o tipo de arquivo que deseja anexar</DialogTitle>
                <DialogDescription className="text-white/80 text-xs sm:text-sm leading-tight">Selecione o formato do seu documento para continuar</DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full flex-shrink-0"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Área branca com cards - responsiva */}
        <div className="bg-white p-3 sm:p-6 overflow-y-auto flex-1">
          {/* Grid de Cards responsivo */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {fileTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => handleFileSelect(type.id)}
                  className={cn(
                    "p-3 sm:p-4 rounded-xl text-white text-center transition-all duration-200 hover:scale-105 aspect-square flex flex-col justify-between min-h-[120px] sm:min-h-[140px]",
                    type.color
                  )}
                >
                  <div className="flex flex-col items-center flex-1 justify-center">
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 flex-shrink-0" />
                    <h3 className="font-bold text-sm sm:text-lg mb-0.5 sm:mb-1 leading-tight">{type.title}</h3>
                    <p className="text-xs sm:text-sm opacity-90 text-center leading-tight px-0.5 sm:px-1 line-clamp-2">{type.description}</p>
                  </div>
                  <span className="text-xs sm:text-sm bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full mt-1 sm:mt-2 leading-tight">
                    Clique para anexar
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer responsivo */}
          <div className="text-center text-gray-600">
            <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm mb-1">
              <Upload className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="font-medium">Passos para upload:</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed px-2">
              1. Escolha o tipo → 2. Selecione arquivo → 3. Preencha formulário → 4. Confirme o upload
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}