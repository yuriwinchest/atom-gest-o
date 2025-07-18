// Single Responsibility Principle (SRP) - Component responsável APENAS por fallback de Excel
import { memo, useState, useEffect } from 'react';
import { Download, ExternalLink, FileSpreadsheet, AlertTriangle } from 'lucide-react';

interface FallbackExcelViewerProps {
  documentUrl: string;
  fileName: string;
  onRetry?: () => void;
}

// Liskov Substitution Principle (LSP) - Pode substituir qualquer viewer
export const FallbackExcelViewer = memo(function FallbackExcelViewer({ 
  documentUrl, 
  fileName, 
  onRetry 
}: FallbackExcelViewerProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula loading
      onRetry();
      setIsRetrying(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(documentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full h-[85vh] flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-700">
      <div className="max-w-md text-center p-8">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mb-4">
            <FileSpreadsheet className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Arquivo Excel Disponível
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Este arquivo Excel está pronto para download ou visualização em nova aba. 
            Alguns arquivos Excel podem ter melhor compatibilidade quando abertos diretamente.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleOpenInNewTab}
            className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir em Nova Aba
          </button>
          
          <button
            onClick={handleDownload}
            className="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Arquivo ({fileName})
          </button>

          {onRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full inline-flex items-center justify-center px-4 py-3 border border-yellow-300 dark:border-yellow-600 rounded-lg text-sm font-medium text-yellow-800 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200 disabled:opacity-50"
            >
              {isRetrying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                  Tentando Novamente...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Tentar Preview Novamente
                </>
              )}
            </button>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Dica de Compatibilidade:</p>
              <p>
                Arquivos Excel (.xls/.xlsx) podem ter melhor visualização quando abertos 
                em aplicativos específicos como Microsoft Excel, Google Sheets ou LibreOffice Calc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default FallbackExcelViewer;