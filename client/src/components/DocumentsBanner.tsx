import { useQuery } from "@tanstack/react-query";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function DocumentsBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Buscar documentos recentes
  const { data: recentDocuments = [], isLoading } = useQuery({
    queryKey: ["/api/documents-with-related"],
  });

  // Filtrar apenas documentos recentes (últimos 10)
  const recentDocs = Array.isArray(recentDocuments) 
    ? recentDocuments.slice(0, 10).map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        description: doc.description || `Documento "${doc.title}" foi adicionado ao acervo`,
        category: doc.category || 'Documento',
        author: doc.author || 'Sistema',
        created_at: doc.created_at || new Date().toISOString(),
        type: doc.type || 'pdf'
      }))
    : [];

  // Se não há documentos, não mostrar o banner
  if (recentDocs.length === 0) {
    return null;
  }

  // Navegação do banner
  const nextDoc = () => {
    setCurrentIndex((prev) => (prev + 1) % recentDocs.length);
  };

  const prevDoc = () => {
    setCurrentIndex((prev) => (prev - 1 + recentDocs.length) % recentDocs.length);
  };

  // Auto-play do banner
  useEffect(() => {
    if (recentDocs.length > 1) {
      const interval = setInterval(nextDoc, 4000); // 4 segundos
      return () => clearInterval(interval);
    }
  }, [recentDocs.length, nextDoc]);

  const currentDoc = recentDocs[currentIndex];

  if (isLoading) {
    return (
      <section className="py-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <Skeleton className="h-5 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <Card className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            📚 Documentos Recentes
          </h3>
          <p className="text-sm text-slate-custom">
            Últimos documentos adicionados ao sistema
          </p>
        </div>

        <div className="relative">
          <Card className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-blue-100">
            <div className="flex items-center gap-4">
              {/* Ícone do documento */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
              </div>

              {/* Conteúdo do documento */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    {currentDoc.category}
                  </Badge>
                  <span className="text-xs text-slate-custom">
                    {new Date(currentDoc.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                  {currentDoc.title}
                </h4>
                
                <p className="text-sm text-slate-custom line-clamp-2">
                  {currentDoc.description}
                </p>
                
                <div className="text-xs text-slate-custom mt-2">
                  Por: {currentDoc.author}
                </div>
              </div>

              {/* Indicador de posição */}
              {recentDocs.length > 1 && (
                <div className="flex-shrink-0 text-center">
                  <div className="text-xs text-slate-custom mb-1">
                    {currentIndex + 1} de {recentDocs.length}
                  </div>
                  <div className="flex space-x-1">
                    {recentDocs.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                          index === currentIndex 
                            ? 'bg-blue-500' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Controles de navegação */}
          {recentDocs.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white border-blue-200 shadow-lg"
                onClick={prevDoc}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white border-blue-200 shadow-lg"
                onClick={nextDoc}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Informações do banner */}
        {recentDocs.length > 1 && (
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              Atualização automática a cada 4 segundos • Use as setas para navegar
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
