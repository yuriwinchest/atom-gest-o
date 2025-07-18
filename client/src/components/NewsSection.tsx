import { useQuery } from "@tanstack/react-query";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function NewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Buscar dados de atividades recentes do sistema
  const { data: recentDocuments, isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/documents-with-related"],
  });

  const { data: homepageContent, isLoading: contentLoading } = useQuery({
    queryKey: ["/api/homepage-content"],
  });

  const isLoading = documentsLoading || contentLoading;

  // Combinar notícias do sistema de conteúdo com atividades recentes
  const allNews: any[] = [];
  
  // Adicionar notícias do sistema de conteúdo
  if (homepageContent) {
    const newsItems = homepageContent.filter((item: any) => item.section === 'news');
    allNews.push(...newsItems.map((item: any) => ({
      id: `content-${item.id}`,
      title: item.title,
      description: item.description,
      type: 'Sistema',
      date: item.date || new Date().toLocaleDateString('pt-BR'),
      source: 'Administração'
    })));
  }

  // Adicionar atividades recentes de documentos
  if (recentDocuments && recentDocuments.length > 0) {
    const recentActivities = recentDocuments.slice(0, 5).map((doc: any) => ({
      id: `doc-${doc.id}`,
      title: `Novo documento: ${doc.title}`,
      description: doc.description || `Documento "${doc.title}" foi adicionado ao acervo`,
      type: 'Documento',
      date: new Date(doc.created_at || Date.now()).toLocaleDateString('pt-BR'),
      source: doc.author || 'Sistema'
    }));
    allNews.push(...recentActivities);
  }

  // Se não há notícias, criar uma padrão
  if (allNews.length === 0) {
    allNews.push({
      id: 'default',
      title: 'Sistema Documental Ativo',
      description: 'Sistema funcionando normalmente. Adicione documentos na gestão para ver atividades aqui.',
      type: 'Sistema',
      date: new Date().toLocaleDateString('pt-BR'),
      source: 'Sistema'
    });
  }

  // Navegação do carrossel
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % allNews.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + allNews.length) % allNews.length);
  };

  // Auto-play do carrossel
  useEffect(() => {
    if (allNews.length > 1) {
      const interval = setInterval(nextSlide, 5000); // 5 segundos
      return () => clearInterval(interval);
    }
  }, [allNews.length, nextSlide]);

  const currentNews = allNews[currentIndex];

  if (isLoading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <Skeleton className="h-6 sm:h-8 w-48 sm:w-64 mx-auto mb-3 sm:mb-4" />
            <Skeleton className="h-3 sm:h-4 w-64 sm:w-96 mx-auto" />
          </div>
          <Card className="bg-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl mx-auto sm:mx-0" />
              <div className="flex-1 space-y-2 sm:space-y-3 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Skeleton className="h-5 sm:h-6 w-20 sm:w-24 mx-auto sm:mx-0" />
                  <Skeleton className="h-3 sm:h-4 w-12 sm:w-16 mx-auto sm:mx-0" />
                </div>
                <Skeleton className="h-5 sm:h-6 w-full" />
                <Skeleton className="h-3 sm:h-4 w-2/3 sm:w-3/4 mx-auto sm:mx-0" />
              </div>
            </div>
          </Card>
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

        {currentNews && (
          <div className="relative">
            <Card className="bg-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-blue rounded-xl flex items-center justify-center">
                    <Bell className="text-white" size={18} />
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <Badge className={`mx-auto sm:mx-0 w-fit ${
                      currentNews.type === 'Sistema' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {currentNews.type}
                    </Badge>
                    <span className="text-xs sm:text-sm text-slate-custom">
                      {currentNews.date} • {currentNews.source}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                    {currentNews.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-custom leading-relaxed">
                    {currentNews.description}
                  </p>
                </div>
              </div>
            </Card>

            {/* Controles do carrossel */}
            {allNews.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white border-gray-200 shadow-lg"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white border-gray-200 shadow-lg"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )}

        {/* Indicadores de paginação dinâmicos */}
        {allNews.length > 1 && (
          <div className="flex justify-center space-x-2">
            {allNews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === currentIndex ? 'bg-brand-blue' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}

        {/* Informações do carrossel */}
        {allNews.length > 1 && (
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              {currentIndex + 1} de {allNews.length} • Atualização automática a cada 5 segundos
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
