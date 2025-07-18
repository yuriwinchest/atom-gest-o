// Container Component - Layout para metadados
import { ReactNode } from 'react';
import { ChevronDown, ChevronRight, Tag } from 'lucide-react';

interface MetadataContainerProps {
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function MetadataContainer({ isExpanded, onToggle, children }: MetadataContainerProps) {
  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 dark:border-gray-700/60 overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100/80 dark:border-gray-700/80 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20">
        <button 
          onClick={onToggle}
          className="w-full flex items-center justify-between text-left group"
          data-metadata-toggle="true"
        >
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Tag className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">i</span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent break-words">
                Metadados do Documento
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium truncate">
                Informações detalhadas e estruturadas
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4 flex-shrink-0">
            <span className="hidden sm:inline text-sm font-medium text-gray-500 dark:text-gray-400">
              {isExpanded ? 'Recolher' : 'Expandir'}
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:from-green-100 group-hover:to-emerald-100 dark:group-hover:from-green-800 dark:group-hover:to-emerald-800 transition-all duration-300">
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-gray-600 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
              ) : (
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-gray-600 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
              )}
            </div>
          </div>
        </button>
      </div>

      {isExpanded && (
        <div className="metadata-content">
          {children}
        </div>
      )}
    </div>
  );
}