import { useQuery } from "@tanstack/react-query";
import { Bell, ChevronLeft, ChevronRight, ArrowRight, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function NewsSection() {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Buscar dados de atividades recentes do sistema
  const { data: recentDocuments = [], isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/documents-with-related"],
  });

  const { data: homepageContent = [], isLoading: contentLoading } = useQuery({
    queryKey: ["/api/homepage-content"],
  });

  const isLoading = documentsLoading || contentLoading;

  // Combinar notícias do sistema de conteúdo com atividades recentes
  const allNews: any[] = [];

  // Adicionar notícias do sistema de conteúdo
  if (Array.isArray(homepageContent)) {
    const newsItems = homepageContent.filter((item: any) => item.section === 'news');
    allNews.push(...newsItems.map((item: any) => ({
      id: `content-${item.id}`,
      title: item.title,
      description: item.description,
      content: item.content,
      image_url: item.image_url,
      type: 'Sistema',
      date: item.date || new Date().toLocaleDateString('pt-BR'),
      source: 'Administração',
      featured: item.featured
    })));
  }

  // Adicionar atividades recentes de documentos
  if (Array.isArray(recentDocuments) && recentDocuments.length > 0) {
    const recentActivities = recentDocuments.slice(0, 5).map((doc: any) => ({
      id: `doc-${doc.id}`,
      title: `Novo documento: ${doc.title}`,
      description: doc.description || `Documento "${doc.title}" foi adicionado ao acervo`,
      content: null,
      image_url: null,
      type: 'Documento',
      date: new Date(doc.created_at || Date.now()).toLocaleDateString('pt-BR'),
      source: doc.author || 'Sistema',
      featured: false
    }));
    allNews.push(...recentActivities);
  }

  // Se não há notícias, criar uma padrão
  if (allNews.length === 0) {
    allNews.push({
      id: 'default',
      title: 'Sistema Documental Ativo',
      description: 'Sistema funcionando normalmente. Adicione documentos na gestão para ver atividades aqui.',
      content: null,
      image_url: null,
      type: 'Sistema',
      date: new Date().toLocaleDateString('pt-BR'),
      source: 'Sistema',
      featured: false
    });
  }

  const toggleExpanded = (cardId: string) => {
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
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <Skeleton className="h-6 sm:h-8 w-48 sm:w-64 mx-auto mb-3 sm:mb-4" />
            <Skeleton className="h-3 sm:h-4 w-64 sm:w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                <Skeleton className="w-full h-48 sm:h-56" />
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
    <section className="py-8 sm:py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Últimas Notícias</h2>
          <p className="text-base sm:text-lg text-slate-custom max-w-2xl mx-auto px-4">
            Fique por dentro das novidades e atualizações do sistema
          </p>
        </div>

        {/* Grid de cards em formato vertical */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {allNews.map((news) => (
            <Card
              key={news.id}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col"
            >
              {/* Imagem do card no topo */}
              {news.image_url ? (
                <div className="w-full h-48 sm:h-56 overflow-hidden">
                  <img
                    src={news.image_url}
                    alt={news.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="w-full h-48 sm:h-56 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <div className="w-16 h-16 bg-brand-blue rounded-xl flex items-center justify-center">
                    <Bell className="text-white" size={24} />
                  </div>
                </div>
              )}

              {/* Conteúdo do card */}
              <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
                {/* Badges e metadados */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className={`w-fit ${
                    news.type === 'Sistema'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {news.type}
                  </Badge>
                  {news.featured && (
                    <Badge className="w-fit bg-yellow-100 text-yellow-800">
                      Destaque
                    </Badge>
                  )}
                </div>

                {/* Data e fonte */}
                <div className="text-xs text-slate-custom mb-3">
                  {news.date} • {news.source}
                </div>

                {/* Título */}
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  {news.title}
                </h3>

                {/* Descrição */}
                <p className="text-sm sm:text-base text-slate-custom leading-relaxed mb-4 flex-1 line-clamp-3">
                  {news.description}
                </p>

                {/* Conteúdo expandido */}
                {expandedCards.has(news.id) && news.content && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Conteúdo completo:</h4>
                    <div className="text-sm text-gray-700 whitespace-pre-line line-clamp-4">
                      {news.content}
                    </div>
                  </div>
                )}

                {/* Botão expandir e rodapé */}
                <div className="mt-auto">
                  {news.content && (
                    <div className="flex justify-center mb-3">
                      <button
                        onClick={() => toggleExpanded(news.id)}
                        className="text-brand-blue hover:text-blue-700 font-medium text-sm flex items-center space-x-1 transition-colors"
                      >
                        <span>{expandedCards.has(news.id) ? 'Ler menos' : 'Ler mais'}</span>
                        {expandedCards.has(news.id) ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowRight size={12} />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Indicador de tipo */}
                  <div className="text-center">
                    <div className="inline-block w-2 h-2 bg-brand-blue rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Informações sobre os cards */}
        {allNews.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              {allNews.length} notícia{allNews.length > 1 ? 's' : ''} disponível{allNews.length > 1 ? 'is' : ''}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
