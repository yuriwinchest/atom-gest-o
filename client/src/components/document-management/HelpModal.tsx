/**
 * HelpModal - Seguindo SRP
 * Responsabilidade única: Exibir ajuda do sistema
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Eye, 
  Link2, 
  FileText, 
  Image, 
  Video, 
  Music,
  FileSpreadsheet,
  Presentation
} from 'lucide-react';

export interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  
  const supportedTypes = [
    { icon: FileText, label: 'PDF', color: 'bg-red-100 text-red-700', extensions: '.pdf' },
    { icon: FileText, label: 'Word', color: 'bg-blue-100 text-blue-700', extensions: '.doc, .docx' },
    { icon: FileSpreadsheet, label: 'Excel', color: 'bg-green-100 text-green-700', extensions: '.xls, .xlsx' },
    { icon: Presentation, label: 'PowerPoint', color: 'bg-orange-100 text-orange-700', extensions: '.ppt, .pptx' },
    { icon: Image, label: 'Imagens', color: 'bg-purple-100 text-purple-700', extensions: '.jpg, .png, .gif' },
    { icon: Video, label: 'Vídeos', color: 'bg-pink-100 text-pink-700', extensions: '.mp4, .avi, .mov' },
    { icon: Music, label: 'Áudio', color: 'bg-indigo-100 text-indigo-700', extensions: '.mp3, .wav, .ogg' },
    { icon: FileText, label: 'Texto', color: 'bg-gray-100 text-gray-700', extensions: '.txt, .json, .xml' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white dark:bg-gray-800 z-10 pb-4" style={{ marginRight: '60px' }}>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Guia de Ajuda
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Como enviar documentos */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Upload className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm sm:text-base">
                Como enviar documentos
              </h3>
            </div>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-blue-800 dark:text-blue-200">
              <p>• Clique no botão "Enviar Documentos"</p>
              <p>• Selecione o arquivo ou arraste para a área indicada</p>
              <p>• Preencha os campos obrigatórios: título, tipo, órgão, responsável, assunto e descrição</p>
              <p>• Anexe imagens adicionais se necessário</p>
              <p>• Clique em "Salvar Documento"</p>
            </div>
          </div>

          {/* Como visualizar documentos */}
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Eye className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-900 dark:text-green-100 text-sm sm:text-base">
                Como visualizar documentos
              </h3>
            </div>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-green-800 dark:text-green-200">
              <p>• Clique em "Detalhes" nos cards para ver informações completas</p>
              <p>• O preview aparece automaticamente na página de detalhes</p>
              <p>• Use "Baixar" para salvar o arquivo no seu dispositivo</p>
              <p>• Navegue entre documentos relacionados na mesma página</p>
            </div>
          </div>

          {/* Como anexar documentos */}
          <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Link2 className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 text-sm sm:text-base">
                Como anexar documentos
              </h3>
            </div>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-purple-800 dark:text-purple-200">
              <p>• Abra os detalhes do documento principal</p>
              <p>• Clique em "Anexar" nos botões de ação</p>
              <p>• Envie o documento relacionado preenchendo o formulário</p>
              <p>• Os documentos anexados aparecem na seção "Documentos Relacionados"</p>
            </div>
          </div>

          {/* Tipos de arquivo suportados */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <FileText className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                Tipos de arquivo suportados
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {supportedTypes.map((type, index) => {
                const Icon = type.icon;
                return (
                  <div key={index} className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${type.color}`}>
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                        {type.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {type.extensions}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                💡 O sistema aceita arquivos de qualquer tamanho sem limitações
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};