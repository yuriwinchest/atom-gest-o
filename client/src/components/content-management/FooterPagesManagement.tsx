/**
 * FooterPagesManagement - Seguindo SRP
 * Responsabilidade única: Gerenciamento de páginas dinâmicas do rodapé
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Link,
  ExternalLink,
  Edit,
  Trash2,
  Save,
  FileText,
  Globe,
  Eye
} from 'lucide-react';

interface FooterPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  category: string;
  external_url?: string;
  icon?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export const FooterPagesManagement: React.FC = () => {
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newPage, setNewPage] = useState({
    slug: '',
    title: '',
    content: '',
    category: 'links-uteis',
    external_url: '',
    icon: 'FileText',
    is_active: true
  });

  // Query para páginas do rodapé
  const { data: pages = [], isLoading } = useQuery<FooterPage[]>({
    queryKey: ['/api/footer-pages'],
    staleTime: 2 * 60 * 1000,
  });

  // Mutation para criar página
  const createPageMutation = useMutation({
    mutationFn: async (data: typeof newPage) => {
      const response = await fetch('/api/footer-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro ao criar página: ${error}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/footer-pages'] });
      setIsNewPageModalOpen(false);
      resetNewPage();
      toast({
        title: "Página criada com sucesso!",
        description: "A nova página foi adicionada ao rodapé",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar página",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar página
  const deletePageMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/footer-pages/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro ao deletar página: ${error}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/footer-pages'] });
      toast({
        title: "Página deletada",
        description: "Página removida do rodapé",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao deletar página",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetNewPage = () => {
    setNewPage({
      slug: '',
      title: '',
      content: '',
      category: 'links-uteis',
      external_url: '',
      icon: 'FileText',
      is_active: true
    });
  };

  const handleCreatePage = () => {
    if (!newPage.title.trim() || !newPage.slug.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e slug",
        variant: "destructive",
      });
      return;
    }
    createPageMutation.mutate(newPage);
  };

  const handleDeletePage = (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta página?')) {
      deletePageMutation.mutate(id);
    }
  };

  const getCategoryBadge = (category: string) => {
    const categories: Record<string, { label: string; color: string }> = {
      'links-uteis': { label: 'Links Úteis', color: 'bg-blue-100 text-blue-700' },
      'contato': { label: 'Contato', color: 'bg-green-100 text-green-700' },
      'redes-sociais': { label: 'Redes Sociais', color: 'bg-purple-100 text-purple-700' },
    };

    const categoryConfig = categories[category] || { label: category, color: 'bg-gray-100 text-gray-700' };
    return (
      <Badge className={categoryConfig.color}>
        {categoryConfig.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Link className="h-5 w-5" />
            Páginas do Rodapé
          </h2>
          <p className="text-gray-600">
            Gerencie links dinâmicos do rodapé (Portal da Transparência, Ouvidoria, etc.)
          </p>
        </div>

        <Dialog open={isNewPageModalOpen} onOpenChange={setIsNewPageModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
              <Plus className="h-4 w-4 mr-2" />
              Nova Página
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Criar Nova Página
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium mb-2">Categoria</label>
                <select
                  value={newPage.category}
                  onChange={(e) => setNewPage({ ...newPage, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  aria-label="Selecionar categoria da página"
                >
                  <option value="links-uteis">Links Úteis</option>
                  <option value="contato">Contato</option>
                  <option value="redes-sociais">Redes Sociais</option>
                </select>
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Título *
                </label>
                <Input
                  value={newPage.title}
                  onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                  placeholder="Ex: Portal da Transparência"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Link className="inline h-4 w-4 mr-1" />
                  Slug (URL) *
                </label>
                <Input
                  value={newPage.slug}
                  onChange={(e) => setNewPage({ ...newPage, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="portal-transparencia"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL da página: /pages/{newPage.slug || 'slug-da-pagina'}
                </p>
              </div>

              {/* URL Externa (opcional) */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <ExternalLink className="inline h-4 w-4 mr-1" />
                  URL Externa (opcional)
                </label>
                <Input
                  value={newPage.external_url}
                  onChange={(e) => setNewPage({ ...newPage, external_url: e.target.value })}
                  placeholder="https://transparencia.mt.gov.br"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se preenchido, o link abrirá esta URL em vez da página interna
                </p>
              </div>

              {/* Conteúdo */}
              <div>
                <label className="block text-sm font-medium mb-2">Conteúdo da Página</label>
                <Textarea
                  value={newPage.content}
                  onChange={(e) => setNewPage({ ...newPage, content: e.target.value })}
                  placeholder="Conteúdo da página em HTML/Markdown..."
                  rows={6}
                />
              </div>

              {/* Ícone */}
              <div>
                <label className="block text-sm font-medium mb-2">Ícone</label>
                <select
                  value={newPage.icon}
                  onChange={(e) => setNewPage({ ...newPage, icon: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  aria-label="Selecionar ícone da página"
                >
                  <option value="FileText">Documento</option>
                  <option value="Globe">Web</option>
                  <option value="Mail">Email</option>
                  <option value="Phone">Telefone</option>
                  <option value="Building">Prédio</option>
                  <option value="Scale">Justiça</option>
                </select>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsNewPageModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreatePage}
                  disabled={createPageMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  {createPageMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Criando...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Criar Página
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Informações sobre o sistema */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800 mb-2">Sistema de Rodapé Dinâmico</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• <strong>Links Úteis:</strong> Portal da Transparência, Ouvidoria, Fale Conosco</li>
                <li>• <strong>Páginas Internas:</strong> Acessíveis via /pages/slug-da-pagina</li>
                <li>• <strong>Links Externos:</strong> Redirecionam para sites externos automaticamente</li>
                <li>• <strong>Organização:</strong> Divididos por categorias no rodapé</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de páginas */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : pages.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-800 mb-2">Nenhuma página criada</h3>
            <p className="text-gray-600 mb-4">
              Crie a primeira página para o rodapé dinâmico
            </p>
            <Button onClick={() => setIsNewPageModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Página
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pages.map((page) => (
            <Card key={page.id} className="border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-2 line-clamp-2">
                      {page.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(page.category)}
                      {page.is_active ? (
                        <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700">Inativo</Badge>
                      )}
                      {page.external_url && (
                        <Badge className="bg-orange-100 text-orange-700">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Externo
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Link className="h-3 w-3" />
                    <span className="font-mono text-xs">
                      {page.external_url ? page.external_url : `/pages/${page.slug}`}
                    </span>
                  </div>

                  {page.content && (
                    <p className="text-gray-600 line-clamp-2">
                      {page.content.substring(0, 120)}...
                    </p>
                  )}
                </div>

                {/* Botões de ação */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => window.open(page.external_url || `/pages/${page.slug}`, '_blank')}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                    disabled
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleDeletePage(page.id)}
                    disabled={deletePageMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};