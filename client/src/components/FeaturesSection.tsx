import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ArrowUp } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

export default function FeaturesSection() {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  
  const { data: allContent, isLoading } = useQuery({
    queryKey: ["/api/homepage-content"],
  });

  // Filtrar apenas recursos/features
  const features = allContent?.filter((item: any) => item.section === 'features') || [];

  const toggleExpanded = (cardId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-background-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <Skeleton className="h-6 sm:h-8 w-64 sm:w-96 mx-auto mb-3 sm:mb-4" />
            <Skeleton className="h-3 sm:h-4 w-48 sm:w-80 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[1, 2].map((i) => (
              <Card key={i} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                <Skeleton className="w-full h-32 sm:h-40 md:h-48" />
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 mx-auto sm:mx-0" />
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24 mx-auto sm:mx-0" />
                  </div>
                  <Skeleton className="h-5 sm:h-6 w-full mb-3" />
                  <Skeleton className="h-3 sm:h-4 w-full mb-2" />
                  <Skeleton className="h-3 sm:h-4 w-2/3 sm:w-3/4 mb-4" />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24 mx-auto sm:mx-0" />
                    <Skeleton className="h-3 sm:h-4 w-12 sm:w-16 mx-auto sm:mx-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-background-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Bem-vindo ao Sistema de Gestão Documental
          </h2>
          <p className="text-base sm:text-lg text-slate-custom max-w-2xl mx-auto px-4">
            Descubra as funcionalidades que facilitam o gerenciamento dos seus documentos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features && features.length > 0 ? features.map((feature: any) => (
            <Card 
              key={feature.id} 
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {feature.image_url && (
                <img 
                  src={feature.image_url}
                  alt={feature.title}
                  className="w-full h-32 sm:h-40 md:h-48 object-cover"
                />
              )}
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Recursos
                  </Badge>
                  <span className="text-sm text-slate-custom">
                    {feature.date || 'Hoje'}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-custom mb-4">
                  {feature.description}
                </p>
                
                {/* Conteúdo expandido */}
                {expandedCards.has(feature.id) && feature.content && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <h4 className="font-semibold text-gray-900 mb-2">Conteúdo completo:</h4>
                    <div className="text-sm text-gray-700 whitespace-pre-line">
                      {feature.content}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-custom">{feature.author || 'Equipe Técnica'}</span>
                  {feature.content && (
                    <button 
                      onClick={() => toggleExpanded(feature.id)}
                      className="text-brand-blue hover:text-blue-700 font-medium text-sm flex items-center space-x-1 transition-colors"
                    >
                      <span>{expandedCards.has(feature.id) ? 'Ler menos' : 'Ler mais'}</span>
                      {expandedCards.has(feature.id) ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowRight size={12} />
                      )}
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-1 md:col-span-2 text-center py-8">
              <p className="text-gray-500">
                Nenhum recurso configurado. Acesse o painel administrativo para adicionar conteúdo.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
