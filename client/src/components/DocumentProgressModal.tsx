import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Upload, Database, FileText, Check } from 'lucide-react';

interface DocumentProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  progress: number;
  fileName: string;
}

const steps = [
  { id: 1, name: 'Validando arquivo', icon: FileText },
  { id: 2, name: 'Calculando hash', icon: CheckCircle },
  { id: 3, name: 'Enviando para Backblaze B2', icon: Upload },
  { id: 4, name: 'Salvando no banco', icon: Database },
  { id: 5, name: 'Concluído', icon: Check }
];

export default function DocumentProgressModal({
  isOpen,
  onClose,
  currentStep,
  progress,
  fileName
}: DocumentProgressModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Enviando Documento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Por favor, aguarde...
            </p>

            {/* Barra de Progresso */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm font-medium text-blue-600">{progress}%</p>
            </div>
          </div>

          {/* Lista de Etapas */}
          <div className="space-y-3">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              const isPending = step.id > currentStep;

              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-green-100 text-green-600'
                      : isCurrent
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>

                  <span className={`text-sm ${
                    isCompleted
                      ? 'text-green-700 font-medium'
                      : isCurrent
                        ? 'text-blue-700 font-medium'
                        : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>

                  {isCurrent && (
                    <div className="ml-auto">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Nome do Arquivo */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Arquivo sendo processado:</p>
            <p className="text-sm font-medium text-gray-700 truncate">{fileName}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
