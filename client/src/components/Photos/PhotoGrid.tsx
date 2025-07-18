// Component - Grid de fotos
import { Download, ExternalLink } from "lucide-react";
import { PhotoData, PhotoService } from '@/services/PhotoService';
import ProductionImage from '@/components/ProductionImage';

interface PhotoGridProps {
  photos: PhotoData[];
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  const photoService = PhotoService.getInstance();

  if (photos.length === 0) {
    return null;
  }

  const downloadPhoto = async (photo: PhotoData) => {
    try {
      const photoUrl = photoService.generatePhotoUrl(photo);
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = photo.originalName;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar foto:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <span className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">{photos.length}</span>
        </span>
        Fotos Anexadas
      </h4>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 active:scale-[0.98]"
          >
            <ProductionImage
              photo={photo}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            
            {/* Overlay com informações */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-xs font-medium truncate">
                  {photo.originalName}
                </p>
                <p className="text-white/70 text-xs">
                  {photoService.formatFileSize(photo.fileSize)}
                </p>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
              {/* Botão de Download */}
              <button
                onClick={() => downloadPhoto(photo)}
                className="w-8 h-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-110"
                title="Baixar foto"
              >
                <Download className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              
              {/* Botão de Abrir em Nova Aba */}
              <button
                onClick={() => window.open(photoService.generatePhotoUrl(photo), '_blank')}
                className="w-8 h-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-110"
                title="Abrir em nova aba"
              >
                <ExternalLink className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}