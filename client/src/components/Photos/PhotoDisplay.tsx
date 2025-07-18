// Main Component - Orquestrador de fotos
import { usePhotos } from '@/hooks/usePhotos';
import { PhotoGrid } from './PhotoGrid';

interface PhotoDisplayProps {
  documentContent: string;
}

export function PhotoDisplay({ documentContent }: PhotoDisplayProps) {
  const { photos, hasPhotos } = usePhotos({ documentContent });

  if (!hasPhotos) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/30 dark:to-pink-900/30 p-6 rounded-2xl border border-purple-200/30 dark:border-purple-700/30 mt-4">
      <PhotoGrid photos={photos} />
    </div>
  );
}

export default PhotoDisplay;