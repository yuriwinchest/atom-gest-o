import React, { useState, useEffect } from 'react';
import { PhotoData, PhotoService } from '../services/PhotoService';

interface ProductionImageProps {
  photo: PhotoData;
  className?: string;
  alt?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export const ProductionImage: React.FC<ProductionImageProps> = ({
  photo,
  className = '',
  alt,
  onError,
  onLoad
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [hasErrored, setHasErrored] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const photoService = PhotoService.getInstance();
  
  useEffect(() => {
    // Sempre começar com URL da API interna
    const apiUrl = `/api/documents/photos/${photo.fileName}`;
    setCurrentSrc(apiUrl);
    setIsLoading(true);
    setHasErrored(false);
  }, [photo.fileName]);

  const handleImageError = () => {
    console.log('🔄 [PRODUÇÃO] Erro na API, tentando URL direta do Supabase:', photo.fileName);
    
    if (!hasErrored) {
      // Primeira falha - tentar URL direta do Supabase
      const directUrl = `https://fbqocpozjmuzrdeacktb.supabase.co/storage/v1/object/public/images/${photo.fileName}`;
      setCurrentSrc(directUrl);
      setHasErrored(true);
      console.log('📸 [PRODUÇÃO] Usando fallback direto:', directUrl);
    } else {
      // Segunda falha - tentar bucket documents
      const documentsUrl = `https://fbqocpozjmuzrdeacktb.supabase.co/storage/v1/object/public/documents/${photo.fileName}`;
      setCurrentSrc(documentsUrl);
      console.log('📁 [PRODUÇÃO] Último fallback (documents):', documentsUrl);
      
      if (onError) {
        onError();
      }
    }
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    console.log('✅ [PRODUÇÃO] Imagem carregada com sucesso:', currentSrc);
    
    if (onLoad) {
      onLoad();
    }
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-gray-400 text-xs">Carregando...</div>
        </div>
      )}
      
      <img
        src={currentSrc}
        alt={alt || photoService.getImageAlt(photo)}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
        decoding="async"
      />
      
      {hasErrored && !isLoading && (
        <div className="absolute top-1 right-1">
          <div className="bg-yellow-500 text-white text-xs px-1 py-0.5 rounded">
            Fallback
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionImage;