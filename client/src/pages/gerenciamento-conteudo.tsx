import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  FileText,
  Phone,
  Globe,
  Sparkles,
  Upload,
  Link,
  X,
  ImageIcon,
  Share2,
  HelpCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
}

// Componente para gerenciar páginas do rodapé
function FooterPagesManagement() {
  const queryClient = useQueryClient();
  const [editingPage, setEditingPage] = useState<FooterPage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Buscar páginas do rodapé
  const { data: footerPages = [], isLoading } = useQuery<FooterPage[]>({
    queryKey: ['/api/footer-pages'],
    queryFn: async () => {
      const response = await fetch('/api/footer-pages');
      if (!response.ok) throw new Error('Erro ao carregar páginas do rodapé');
      return response.json();
    }
  });

  // Formulário para página nova/editada
  const [pageForm, setPageForm] = useState({
    slug: '',
    title: '',
    description: '',
    content: '',
    meta_description: '',
    icon: '',
    category: 'links-uteis',
    external_url: '',
    is_active: true,
    order_index: 0
  });

  // Mutação para criar página
  const createPageMutation = useMutation({
    mutationFn: async (data: typeof pageForm) => {
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
      setIsCreating(false);
      resetForm();
      toast({
        title: "Sucesso!",
        description: "Página do rodapé criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutação para atualizar página
  const updatePageMutation = useMutation({
    mutationFn: async (data: typeof pageForm & { id: number }) => {
      const response = await fetch(`/api/footer-pages/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro ao atualizar página: ${error}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/footer-pages'] });
      setEditingPage(null);
      resetForm();
      toast({
        title: "Sucesso!",
        description: "Página atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutação para deletar página
  const deletePageMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/footer-pages/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao deletar página');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/footer-pages'] });
      toast({
        title: "Sucesso!",
        description: "Página deletada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setPageForm({
      slug: '',
      title: '',
      description: '',
      content: '',
      meta_description: '',
      icon: '',
      category: 'links-uteis',
      external_url: '',
      is_active: true,
      order_index: 0
    });
  };

  const startEditing = (page: FooterPage) => {
    setEditingPage(page);
    setPageForm({
      slug: page.slug,
      title: page.title,
      description: page.description || '',
      content: page.content,
      meta_description: page.meta_description || '',
      icon: page.icon || '',
      category: page.category,
      external_url: page.external_url || '',
      is_active: page.is_active,
      order_index: page.order_index
    });
    setIsCreating(true);
  };

  const cancelEditing = () => {
    setEditingPage(null);
    setIsCreating(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPage) {
      updatePageMutation.mutate({ ...pageForm, id: editingPage.id });
    } else {
      createPageMutation.mutate(pageForm);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando páginas do rodapé...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botão para criar nova página */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Páginas Existentes</h3>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Página
        </Button>
      </div>

      {/* Formulário de criação/edição */}
      {isCreating && (
        <Card className="border border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
            <CardTitle className="text-blue-900 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              {editingPage ? 'Editar Página' : 'Nova Página do Rodapé'}
            </CardTitle>
            <CardDescription className="text-blue-700">
              {editingPage ? 'Edite as informações da página' : 'Crie uma nova página para o rodapé do site'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={pageForm.title}
                    onChange={(e) => setPageForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Portal da Transparência"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">URL (slug) *</Label>
                  <Input
                    id="slug"
                    value={pageForm.slug}
                    onChange={(e) => {
                      const slug = e.target.value.toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-');
                      setPageForm(prev => ({ ...prev, slug }));
                    }}
                    placeholder="portal-transparencia"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição Breve</Label>
                <Textarea
                  id="description"
                  value={pageForm.description}
                  onChange={(e) => setPageForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Breve descrição da página..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="content">Conteúdo da Página *</Label>
                <Textarea
                  id="content"
                  value={pageForm.content}
                  onChange={(e) => setPageForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Conteúdo completo da página em HTML ou texto..."
                  rows={8}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <select
                    id="category"
                    value={pageForm.category}
                    onChange={(e) => setPageForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md"
                    aria-label="Selecionar categoria da página"
                  >
                    <option value="links-uteis">Links Úteis</option>
                    <option value="contato">Contato</option>
                    <option value="redes-sociais">Redes Sociais</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="icon">Ícone/Emoji</Label>
                  <Input
                    id="icon"
                    value={pageForm.icon}
                    onChange={(e) => setPageForm(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="🔍 ou nome do ícone"
                  />
                </div>
                <div>
                  <Label htmlFor="order_index">Ordem</Label>
                  <Input
                    id="order_index"
                    type="number"
                    value={pageForm.order_index}
                    onChange={(e) => setPageForm(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="external_url">URL Externa (opcional)</Label>
                <Input
                  id="external_url"
                  value={pageForm.external_url}
                  onChange={(e) => setPageForm(prev => ({ ...prev, external_url: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={pageForm.is_active}
                  onChange={(e) => setPageForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4"
                  aria-label="Marcar página como ativa"
                />
                <Label htmlFor="is_active">Página ativa</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createPageMutation.isPending || updatePageMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingPage ? 'Atualizar Página' : 'Criar Página'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEditing}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de páginas existentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {footerPages.map((page) => (
          <Card key={page.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-gray-900 mb-1 flex items-center">
                    {page.icon && <span className="mr-2">{page.icon}</span>}
                    {page.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {page.category === 'links-uteis' ? 'Links Úteis' :
                       page.category === 'contato' ? 'Contato' :
                       page.category === 'redes-sociais' ? 'Redes Sociais' : 'Outros'}
                    </Badge>
                    {!page.is_active && (
                      <Badge variant="destructive">Inativo</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {page.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {page.description}
                </p>
              )}
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="text-xs text-gray-500 mb-1">URL:</p>
                <p className="text-sm font-mono text-gray-700">
                  {page.external_url || `/pages/${page.slug}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startEditing(page)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir esta página?')) {
                      deletePageMutation.mutate(page.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {footerPages.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Nenhuma página criada ainda.</p>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Criar Primeira Página
          </Button>
        </div>
      )}
    </div>
  );
}

interface HomepageCard {
  id: number;
  title: string;
  description: string;
  content: string;
  section: string;
  featured: boolean;
  image_url?: string;
}

export default function GerenciamentoConteudo() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('cartoes');
  const [editingCard, setEditingCard] = useState<HomepageCard | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [imageUploadMethod, setImageUploadMethod] = useState<'url' | 'file'>('url');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { toast } = useToast();

  // Verificar se é admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  // Buscar dados dos cards da página inicial
  const { data: content = [], isLoading, error } = useQuery<HomepageCard[]>({
    queryKey: ['/api/homepage-content'],
    queryFn: async () => {
      const response = await fetch('/api/homepage-content');
      if (!response.ok) throw new Error('Erro ao carregar conteúdo');
      return response.json();
    }
  });

  // Formulário para card novo/editado
  const [cardForm, setCardForm] = useState({
    title: '',
    description: '',
    content: '',
    section: 'news',
    featured: false,
    image_url: ''
  });

  // Função para fazer upload de imagem para o Supabase
  const uploadImageToSupabase = async (file: File): Promise<string> => {
    console.log('🚀 Iniciando upload de imagem:', file.name, file.type, file.size);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'images');

    const response = await fetch('/api/supabase-storage/upload-file', {
      method: 'POST',
      body: formData
    });

    console.log('📡 Resposta do servidor:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erro do servidor:', error);
      throw new Error(`Erro no upload: ${error}`);
    }

    const result = await response.json();
    console.log('✅ Upload bem-sucedido:', result);

    // Retornar a URL pública do Supabase
    return result.url;
  };

  // Mutação para criar card
  const createCardMutation = useMutation({
    mutationFn: async (data: typeof cardForm) => {
      const response = await fetch('/api/homepage-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro ao criar card: ${error}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homepage-content'] });
      setIsCreating(false);
      setCardForm({
        title: '',
        description: '',
        content: '',
        section: 'news',
        featured: false,
        image_url: ''
      });
    }
  });

  // Mutação para atualizar card
  const updateCardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof cardForm }) => {
      const response = await fetch(`/api/homepage-content/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro ao atualizar card: ${error}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homepage-content'] });
      setEditingCard(null);
      setCardForm({
        title: '',
        description: '',
        content: '',
        section: 'news',
        featured: false,
        image_url: ''
      });
    }
  });

  // Mutação para deletar card
  const deleteCardMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/homepage-content/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro ao deletar card: ${error}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homepage-content'] });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardForm.title || !cardForm.description) {
      toast({
        title: "Erro",
        description: "Título e descrição são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    let finalData = { ...cardForm };

    // Se há arquivo selecionado, fazer upload
    if (selectedImageFile && imageUploadMethod === 'file') {
      try {
        setIsUploadingImage(true);
        const imageUrl = await uploadImageToSupabase(selectedImageFile);
        finalData.image_url = imageUrl;

        toast({
          title: "Sucesso",
          description: "Imagem enviada com sucesso!",
        });
      } catch (error) {
        console.error('Erro no upload:', error);
        toast({
          title: "Erro",
          description: "Erro ao enviar imagem. Tente novamente.",
          variant: "destructive"
        });
        setIsUploadingImage(false);
        return;
      } finally {
        setIsUploadingImage(false);
      }
    }

    // Submeter o formulário
    if (editingCard) {
      updateCardMutation.mutate({ id: editingCard.id, data: finalData });
    } else {
      createCardMutation.mutate(finalData);
    }
  };

  const startEditing = (card: HomepageCard) => {
    setEditingCard(card);
    setSelectedImageFile(null);
    setImageUploadMethod('url');
    setCardForm({
      title: card.title,
      description: card.description,
      content: card.content || '',
      section: card.section,
      featured: card.featured,
      image_url: card.image_url || ''
    });
  };

  const cancelEditing = () => {
    setEditingCard(null);
    setIsCreating(false);
    setSelectedImageFile(null);
    setImageUploadMethod('url');
    setCardForm({
      title: '',
      description: '',
      content: '',
      section: 'news',
      featured: false,
      image_url: ''
    });
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingCard(null);
    setSelectedImageFile(null);
    setImageUploadMethod('url');
    setCardForm({
      title: '',
      description: '',
      content: '',
      section: 'news',
      featured: false,
      image_url: ''
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gerenciamento de Conteúdo
              </h1>
              <p className="text-gray-600">
                Gerencie o conteúdo da página inicial e informações do site
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Status: Online
            </Badge>

          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Administração</span>
          <span>›</span>
          <span className="text-blue-600 font-medium">Gerenciamento de Conteúdo</span>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200">
            <TabsTrigger
              value="cartoes"
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              <FileText className="h-4 w-4" />
              Cartões Iniciais
            </TabsTrigger>
            <TabsTrigger
              value="rodape"
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              <Globe className="h-4 w-4" />
              Rodapé
            </TabsTrigger>
            <TabsTrigger
              value="contato"
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              <Phone className="h-4 w-4" />
              Contato
            </TabsTrigger>
          </TabsList>

          {/* Aba Cartões Iniciais */}
          <TabsContent value="cartoes" className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Cartões da Página Inicial</h2>
              <p className="text-gray-600 mb-6">Gerencie os cards de destaque da página inicial.</p>

              {/* Botão para criar novo card */}
              {!isCreating && !editingCard && (
                <Button onClick={startCreating} className="mb-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Novo Card
                </Button>
              )}
            </div>

            {/* Formulário de criação/edição */}
            {(isCreating || editingCard) && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5" />
                    {editingCard ? 'Editar Card' : 'Criar Novo Card'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                          id="title"
                          value={cardForm.title}
                          onChange={(e) => setCardForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Digite o título do card"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="section">Seção</Label>
                        <select
                          id="section"
                          value={cardForm.section}
                          onChange={(e) => setCardForm(prev => ({ ...prev, section: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          aria-label="Selecionar seção do card"
                        >
                          <option value="news">Notícias</option>
                          <option value="features">Recursos</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição Curta *</Label>
                      <Textarea
                        id="description"
                        value={cardForm.description}
                        onChange={(e) => setCardForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrição que aparece no preview do card"
                        rows={2}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Conteúdo Completo</Label>
                      <Textarea
                        id="content"
                        value={cardForm.content}
                        onChange={(e) => setCardForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Conteúdo completo que aparece quando clica em 'Ler mais'"
                        rows={4}
                      />
                    </div>

                    {/* Seção de Imagem */}
                    <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-gray-600" />
                        <Label className="text-lg font-medium">Imagem do Card (opcional)</Label>
                      </div>

                      {/* Escolha do método */}
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant={imageUploadMethod === 'url' ? 'default' : 'outline'}
                          onClick={() => setImageUploadMethod('url')}
                          className="flex items-center gap-2"
                        >
                          <Link className="h-4 w-4" />
                          Via URL
                        </Button>
                        <Button
                          type="button"
                          variant={imageUploadMethod === 'file' ? 'default' : 'outline'}
                          onClick={() => setImageUploadMethod('file')}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Upload do Computador
                        </Button>
                      </div>

                      {/* Campo URL */}
                      {imageUploadMethod === 'url' && (
                        <div className="space-y-2">
                          <Label htmlFor="image_url">URL da Imagem</Label>
                          <Input
                            id="image_url"
                            value={cardForm.image_url}
                            onChange={(e) => setCardForm(prev => ({ ...prev, image_url: e.target.value }))}
                            placeholder="https://exemplo.com/imagem.jpg"
                          />
                        </div>
                      )}

                      {/* Campo Upload */}
                      {imageUploadMethod === 'file' && (
                        <div className="space-y-2">
                          <Label htmlFor="image_file">Selecionar Arquivo</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="image_file"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  // Validar tipo de arquivo
                                  if (!file.type.startsWith('image/')) {
                                    toast({
                                      title: "Erro",
                                      description: "Apenas arquivos de imagem são permitidos",
                                      variant: "destructive"
                                    });
                                    return;
                                  }

                                  // Validar tamanho (máximo 5MB)
                                  if (file.size > 5 * 1024 * 1024) {
                                    toast({
                                      title: "Erro",
                                      description: "Arquivo muito grande. Máximo 5MB",
                                      variant: "destructive"
                                    });
                                    return;
                                  }

                                  setSelectedImageFile(file);
                                  setCardForm(prev => ({ ...prev, image_url: '' })); // Limpar URL se houver
                                }
                              }}
                              className="flex-1"
                            />
                            {selectedImageFile && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedImageFile(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {selectedImageFile && (
                            <div className="bg-green-50 p-3 rounded-md">
                              <p className="text-sm text-green-800">
                                📁 Arquivo selecionado: {selectedImageFile.name}
                              </p>
                              <p className="text-xs text-green-600">
                                Tamanho: {(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Preview da imagem */}
                      {((imageUploadMethod === 'url' && cardForm.image_url) ||
                        (imageUploadMethod === 'file' && selectedImageFile)) && (
                        <div className="space-y-2">
                          <Label>Preview</Label>
                          <div className="border border-gray-200 rounded-lg p-2">
                            {imageUploadMethod === 'url' && cardForm.image_url ? (
                              <img
                                src={cardForm.image_url}
                                alt="Preview"
                                className="w-full h-32 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OSI+SW1hZ2VtIG7Do28gZW5jb250cmFkYTwvdGV4dD4KICA8L3N2Zz4K';
                                }}
                              />
                            ) : selectedImageFile ? (
                              <img
                                src={URL.createObjectURL(selectedImageFile)}
                                alt="Preview"
                                className="w-full h-32 object-cover rounded"
                              />
                            ) : null}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={cardForm.featured}
                        onChange={(e) => setCardForm(prev => ({ ...prev, featured: e.target.checked }))}
                        className="h-4 w-4"
                          aria-label="Marcar card como destaque"
                      />
                      <Label htmlFor="featured">Card em destaque</Label>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={createCardMutation.isPending || updateCardMutation.isPending || isUploadingImage}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isUploadingImage ? (
                          <>
                            <Upload className="h-4 w-4 mr-2 animate-spin" />
                            Enviando imagem...
                          </>
                        ) : (
                          editingCard ? 'Atualizar Card' : 'Criar Card'
                        )}
                      </Button>
                      <Button type="button" variant="outline" onClick={cancelEditing}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Lista de cards existentes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.map((card) => (
                <Card key={card.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-gray-900 mb-1">
                          {card.title}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Badge variant={card.section === 'news' ? 'default' : 'secondary'}>
                            {card.section === 'news' ? 'Notícias' : 'Recursos'}
                          </Badge>
                          {card.featured && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Destaque
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Preview da imagem do card */}
                    {card.image_url ? (
                      <div className="mb-4">
                        <img
                          src={card.image_url}
                          alt={card.title}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            console.error(`❌ Erro ao carregar imagem: ${card.image_url}`);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="mb-4 p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 text-center">
                        <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Sem imagem anexada</p>
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mb-4">
                      {card.description}
                    </p>
                    {card.content && (
                      <div className="bg-gray-50 p-3 rounded-md mb-4">
                        <p className="text-xs text-gray-500 mb-1">Conteúdo completo:</p>
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {card.content}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(card)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir este card?')) {
                            deleteCardMutation.mutate(card.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Aba Rodapé */}
          <TabsContent value="rodape" className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Gerenciar Páginas do Rodapé</h2>
              <p className="text-gray-600">Crie e edite páginas para os links do rodapé (Portal da Transparência, Ouvidoria, etc.).</p>
            </div>

            <FooterPagesManagement />
          </TabsContent>

          {/* Aba Contato */}
          <TabsContent value="contato" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Seção: Informações de Contato */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-green-900">Informações de Contato</CardTitle>
                      <p className="text-green-700 text-sm">Configure dados básicos de contato</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">Informações Atuais:</h4>
                      <div className="text-sm text-green-800 space-y-1">
                        <p><strong>Email:</strong> contato@gestaoarquivos.gov.br</p>
                        <p><strong>Telefone:</strong> (11) 3456-7890</p>
                        <p><strong>Endereço:</strong> Rua da Administração, 123 - Centro - São Paulo/SP</p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p><strong>Como editar:</strong> As informações de contato são editadas diretamente no arquivo Footer.tsx ou podem ser transformadas em páginas dinâmicas criando entradas na categoria "contato" na aba Rodapé.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seção: Redes Sociais */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Share2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-purple-900">Redes Sociais</CardTitle>
                      <p className="text-purple-700 text-sm">Configure links para redes sociais</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-3">Redes Sociais Configuradas:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center space-x-2">
                            <span>📘</span>
                            <span>Facebook</span>
                          </span>
                          <span className="text-purple-600 font-mono">/pages/facebook</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center space-x-2">
                            <span>🐦</span>
                            <span>Twitter</span>
                          </span>
                          <span className="text-purple-600 font-mono">/pages/twitter</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center space-x-2">
                            <span>📺</span>
                            <span>YouTube</span>
                          </span>
                          <span className="text-purple-600 font-mono">/pages/youtube</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <h4 className="font-semibold text-amber-900 mb-2">💡 Como editar redes sociais:</h4>
                      <div className="text-sm text-amber-800 space-y-2">
                        <p>1. Vá para a aba <strong>"Rodapé"</strong> acima</p>
                        <p>2. Procure por páginas na categoria <strong>"redes-sociais"</strong></p>
                        <p>3. Edite as páginas existentes (Facebook, Twitter, YouTube)</p>
                        <p>4. Altere o campo <strong>"URL Externa"</strong> para seus links reais</p>
                        <p>5. Exemplo: <code>https://facebook.com/suapagina</code></p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Instruções Gerais */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <HelpCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-blue-900">Instruções Gerais</CardTitle>
                    <p className="text-blue-700 text-sm">Como gerenciar contato e redes sociais</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">📞 Para editar informações de contato:</h4>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p>• <strong>Opção 1:</strong> Crie páginas na categoria "contato" na aba Rodapé</p>
                      <p>• <strong>Opção 2:</strong> Edite diretamente o arquivo Footer.tsx (programador)</p>
                      <p>• As informações aparecerão na seção "Contato" do rodapé</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">📱 Para editar redes sociais:</h4>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p>• Vá para a aba <strong>"Rodapé"</strong></p>
                      <p>• Procure páginas com categoria <strong>"redes-sociais"</strong></p>
                      <p>• Edite o campo <strong>"URL Externa"</strong> para seus links reais</p>
                      <p>• Ou crie novas páginas para outras redes sociais</p>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}