/**
 * UploadProgressModal - Seguindo SRP
 * Responsabilidade única: Exibir progresso de upload
 */

import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload } from 'lucide-react';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

export interface UploadProgressModalProps {
  isVisible: boolean;
  progress: number;
  stage: string;
}

export const UploadProgressModal: React.FC<UploadProgressModalProps> = ({
  isVisible,
  progress,
  stage
}) => {
  
  if (!isVisible) return null;

  return (
    <Dialog open={isVisible}>
      <DialogContent className="sm:max-w-md">
        <VisuallyHidden>
          <DialogTitle>Progresso de Upload</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          {/* Ícone animado */}
          <div className="relative">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin absolute -top-1 -right-1" />
          </div>

          {/* Título */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Enviando Documento
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Por favor, aguarde...
            </p>
          </div>

          {/* Barra de progresso */}
          <div className="w-full space-y-3">
            <Progress value={progress} className="w-full h-2" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {stage}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {progress}%
              </span>
            </div>
          </div>

          {/* Etapas do processo */}
          <div className="w-full space-y-2">
            <div className="text-xs text-gray-500 space-y-1">
              <div className={`flex items-center gap-2 ${progress >= 10 ? 'text-green-600' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${progress >= 10 ? 'bg-green-500' : 'bg-gray-300'}`} />
                Validando arquivo
              </div>
              <div className={`flex items-center gap-2 ${progress >= 25 ? 'text-green-600' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${progress >= 25 ? 'bg-green-500' : 'bg-gray-300'}`} />
                Calculando hash
              </div>
              <div className={`flex items-center gap-2 ${progress >= 50 ? 'text-green-600' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${progress >= 50 ? 'bg-green-500' : 'bg-gray-300'}`} />
                Enviando arquivo
              </div>
              <div className={`flex items-center gap-2 ${progress >= 75 ? 'text-green-600' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${progress >= 75 ? 'bg-green-500' : 'bg-gray-300'}`} />
                Salvando no banco
              </div>
              <div className={`flex items-center gap-2 ${progress >= 100 ? 'text-green-600' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-gray-300'}`} />
                Concluído
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};