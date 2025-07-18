// Custom Hook - Gerenciamento de estado para fotos
import { useMemo } from 'react';
import { PhotoService, PhotoData } from '@/services/PhotoService';

interface UsePhotosProps {
  documentContent: string;
}

interface UsePhotosReturn {
  photos: PhotoData[];
  hasPhotos: boolean;
  totalPhotos: number;
}

export function usePhotos({ documentContent }: UsePhotosProps): UsePhotosReturn {
  const photoService = PhotoService.getInstance();

  const photos = useMemo(() => {
    return photoService.extractPhotos(documentContent);
  }, [documentContent, photoService]);

  return {
    photos,
    hasPhotos: photos.length > 0,
    totalPhotos: photos.length
  };
}