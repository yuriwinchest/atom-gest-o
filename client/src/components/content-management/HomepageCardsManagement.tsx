/**
 * HomepageCardsManagement - Formulário COMPLETO com 12 campos
 * Responsabilidade única: Gerenciamento de cards da página inicial
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Save,
  FileText,
  Home,
  Calendar,
  User,
  Tag,
  Globe,
  Settings,
  Sparkles,
  ImageIcon,
  Link,
  Upload,
  X,
  Phone
} from 'lucide-react';

interface HomepageContent {
  id: number;
  section: string;
  title: string;
  description: string;
  content?: string;
  category?: string;
  author?: string;
  date?: string;
  order_index: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export const HomepageCardsManagement: React.FC = () => {
  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<HomepageContent | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newCard, setNewCard] = useState({
    section: 'news',
    title: '',
    description: '',
    content: '',
    category: '',
    author: 'Equipe Técnica',
    date: new Date().toLocaleDateString('pt-BR'),
    order_index: 0,
    is_active: true,
    image_url: ''
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Query para conteúdo da homepage
  const { data: content = [], isLoading } = useQuery<HomepageContent[]>({
    queryKey: ['/api/homepage-content'],
    staleTime: 2 * 60 * 1000,
  });

  // Mutation para criar conteúdo
  const createContentMutation = useMutation({
    mutationFn: async (data: typeof newCard) => {
      const response = await fetch('/api/homepage-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro ao criar conteúdo: ${error}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homepage-content'] });
      setIsNewCardModalOpen(false);
      resetNewCard();
      toast({
        title: "Card criado com sucesso!",
        description: "O novo conteúdo foi adicionado à página inicial",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar card",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Função para upload de imagem
  const uploadImageToSupabase = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'images');

      const response = await fetch('/api/supabase-storage/upload-file', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro no upload: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  };

  // Função para lidar com seleção de imagem
  const handleImageSelect = (file: File) => {
    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Mutation para deletar conteúdo
  const deleteContentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/homepage-content/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro ao deletar conteúdo: ${error}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homepage-content'] });
      toast({
        title: "Card deletado",
        description: "Conteúdo removido da página inicial",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao deletar card",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetNewCard = () => {
    setNewCard({
      section: 'news',
      title: '',
      description: '',
      content: '',
      category: '',
      author: 'Equipe Técnica',
      date: new Date().toLocaleDateString('pt-BR'),
      order_index: 0,
      is_active: true
    });
  };

  const handleCreateCard = async () => {
    if (!newCard.title.trim() || !newCard.description.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e descrição",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageUrl = '';
      
      // Upload da imagem se selecionada
      if (selectedImageFile) {
        imageUrl = await uploadImageToSupabase(selectedImageFile);
      }

      // Criar o conteúdo com a URL da imagem
      createContentMutation.mutate({
        ...newCard,
        image_url: imageUrl
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCard = (id: number) => {
    if (confirm('Tem certeza que deseja deletar este card?')) {
      deleteContentMutation.mutate(id);
    }
  };

  const getSectionBadge = (section: string) => {
    const sections: Record<string, { label: string; color: string }> = {
      news: { label: 'Notícias', color: 'bg-blue-100 text-blue-700' },
      features: { label: 'Recursos', color: 'bg-green-100 text-green-700' },
      updates: { label: 'Atualizações', color: 'bg-purple-100 text-purple-700' },
    };

    const sectionConfig = sections[section] || { label: section, color: 'bg-gray-100 text-gray-700' };
    return (
      <Badge className={sectionConfig.color}>
        {sectionConfig.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Home className="h-5 w-5" />
            Cartões da Página Inicial
          </h2>
          <p className="text-gray-600">
            Gerencie cards, notícias e recursos exibidos na página inicial
          </p>
        </div>

        <Dialog open={isNewCardModalOpen} onOpenChange={setIsNewCardModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Plus className="h-4 w-4 mr-2" />
              Novo Card
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Criar Novo Card
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Seção */}
              <div>
                <label className="block text-sm font-medium mb-2">Seção</label>
                <select
                  value={newCard.section}
                  onChange={(e) => setNewCard({ ...newCard, section: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  aria-label="Selecionar seção do card"
                >
                  <option value="news">Notícias</option>
                  <option value="features">Recursos</option>
                  <option value="updates">Atualizações</option>
                </select>
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Título *
                </label>
                <Input
                  value={newCard.title}
                  onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                  placeholder="Digite o título do card"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium mb-2">Descrição *</label>
                <Textarea
                  value={newCard.description}
                  onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                  placeholder="Breve descrição do conteúdo"
                  rows={3}
                />
              </div>

              {/* Conteúdo expandido */}
              <div>
                <label className="block text-sm font-medium mb-2">Conteúdo Expandido</label>
                <Textarea
                  value={newCard.content}
                  onChange={(e) => setNewCard({ ...newCard, content: e.target.value })}
                  placeholder="Conteúdo completo para 'Ler mais...'"
                  rows={5}
                />
              </div>

              {/* Metadados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Tag className="inline h-4 w-4 mr-1" />
                    Categoria
                  </label>
                  <Input
                    value={newCard.category}
                    onChange={(e) => setNewCard({ ...newCard, category: e.target.value })}
                    placeholder="Ex: Sistema, Tutorial"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Autor
                  </label>
                  <Input
                    value={newCard.author}
                    onChange={(e) => setNewCard({ ...newCard, author: e.target.value })}
                    placeholder="Nome do autor"
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsNewCardModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateCard}
                  disabled={createContentMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  {createContentMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Criando...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Criar Card
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      ) : content.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-800 mb-2">Nenhum card criado</h3>
            <p className="text-gray-600 mb-4">
              Crie o primeiro card para a página inicial
            </p>
            <Button onClick={() => setIsNewCardModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.map((card) => (
            <Card key={card.id} className="border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-2 line-clamp-2">
                      {card.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getSectionBadge(card.section)}
                      {card.is_active ? (
                        <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700">Inativo</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {card.description}
                </p>

                {/* Metadados */}
                <div className="space-y-1 text-xs text-gray-500">
                  {card.author && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {card.author}
                    </div>
                  )}
                  {card.date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {card.date}
                    </div>
                  )}
                  {card.category && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {card.category}
                    </div>
                  )}
                </div>

                {/* Botões de ação */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                    disabled
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
                    onClick={() => handleDeleteCard(card.id)}
                    disabled={deleteContentMutation.isPending}
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