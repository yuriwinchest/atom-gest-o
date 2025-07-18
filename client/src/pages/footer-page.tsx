import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, ExternalLink, Eye, FileText, Home, Share } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface FooterPage {
  id: number;
  slug: string;
  title: string;
  description?: string;
  content: string;
  meta_description?: string;
  icon?: string;
  category: string;
  external_url?: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

function FooterPageView() {
  const [match, params] = useRoute('/pages/:slug');
  const slug = params?.slug;

  // Buscar página por slug
  const { data: page, isLoading, error } = useQuery<FooterPage>({
    queryKey: ['/api/footer-pages/slug', slug],
    queryFn: async () => {
      const response = await fetch(`/api/footer-pages/slug/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Página não encontrada');
        }
        throw new Error('Erro ao carregar página');
      }
      return response.json();
    },
    enabled: !!slug
  });

  // Se há URL externa, redirecionar
  useEffect(() => {
    if (page?.external_url) {
      window.location.href = page.external_url;
    }
  }, [page?.external_url]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Carregando página...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-lg w-full text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <FileText className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-red-900">Página não encontrada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  A página que você está procurando não existe ou foi removida.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => window.history.back()}
                    variant="outline"
                    className="flex items-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/'}
                    className="bg-blue-600 hover:bg-blue-700 flex items-center"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Início
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'links-uteis': return 'Links Úteis';
      case 'contato': return 'Contato';
      case 'redes-sociais': return 'Redes Sociais';
      default: return 'Outros';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'links-uteis': return 'bg-blue-100 text-blue-800';
      case 'contato': return 'bg-green-100 text-green-800';
      case 'redes-sociais': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header da página */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => window.history.back()}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-2">
                {page.icon && (
                  <span className="text-2xl">{page.icon}</span>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{page.title}</h1>
                  {page.description && (
                    <p className="text-gray-600 mt-1">{page.description}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getCategoryColor(page.category)}>
                {getCategoryLabel(page.category)}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  // Aqui poderia mostrar um toast
                }}
                className="flex items-center"
              >
                <Share className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-blue-900">Conteúdo da Página</CardTitle>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        Atualizado em {formatDate(page.updated_at)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Eye className="h-4 w-4 mr-1" />
                        Página pública
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {/* Renderizar conteúdo da página */}
              <div 
                className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
              
              {/* Se for um link externo, mostrar aviso */}
              {page.external_url && (
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <ExternalLink className="h-5 w-5 text-blue-600 mr-2" />
                    <p className="text-blue-800">
                      Esta página contém um link externo. Você será redirecionado para:{' '}
                      <a 
                        href={page.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium"
                      >
                        {page.external_url}
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações adicionais */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-2">Informações da Página</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Categoria:</span> {getCategoryLabel(page.category)}
                  </div>
                  <div>
                    <span className="font-medium">Criado em:</span> {formatDate(page.created_at)}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    <Badge variant={page.is_active ? "default" : "secondary"} className="ml-2">
                      {page.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-2">Ações</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/'}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Voltar ao Início
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => window.print()}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Imprimir Página
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FooterPageView;