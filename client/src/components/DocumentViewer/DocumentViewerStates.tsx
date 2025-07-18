// States Components - Responsável APENAS pelos estados de UI
import { AlertCircle, RefreshCw, Download } from 'lucide-react';

interface LoadingStateProps {
  fileName: string;
}

export function LoadingState({ fileName }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500" />
        <p className="text-gray-600 dark:text-gray-300">Carregando documento...</p>
        <p className="text-sm text-gray-500">{fileName}</p>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  error: string;
  fileName: string;
  onRetry: () => void;
  onDownload: () => void;
}

export function ErrorState({ error, fileName, onRetry, onDownload }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-center space-y-4 p-8">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Erro ao carregar documento
        </h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-md">
          {error || 'Não foi possível carregar o documento.'}
        </p>
        <p className="text-sm text-gray-500">{fileName}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </button>
          <button
            onClick={onDownload}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar Arquivo
          </button>
        </div>
      </div>
    </div>
  );
}