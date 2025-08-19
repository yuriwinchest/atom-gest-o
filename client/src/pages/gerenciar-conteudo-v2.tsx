import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Plus, Eye, Edit, Trash2, Save, FileText } from 'lucide-react';
import { type HomepageContent, type HomepageSettings } from '@shared/schema';

export default function GerenciarConteudo() {
  const queryClient = useQueryClient();
  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<HomepageContent | null>(null);

  // Form states
  const [newCard, setNewCard] = useState({
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

  const [settings, setSettings] = useState({
    cards_count: 4,
    cards_order: 'recent'
  });

  // Queries
  const { data: content = [], isLoading: isLoadingContent, error: contentError } = useQuery<HomepageContent[]>({
    queryKey: ['/api/homepage-content'],
  });

  const { data: currentSettings, isLoading: isLoadingSettings } = useQuery<HomepageSettings>({
    queryKey: ['/api/homepage-settings'],
  });

  // Update settings when data loads
  useEffect(() => {
    if (currentSettings) {
      setSettings({
        cards_count: currentSettings.cards_count || 4,
        cards_order: currentSettings.cards_order || 'recent'
      });
    }
  }, [currentSettings]);

  // Mutations
  const createContentMutation = useMutation({
    mutationFn: async (data: any) => {
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
    },
    onError: (error: any) => {
      console.error('Erro ao criar card:', error);
      alert('Erro ao criar card: ' + error.message);
    }
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/homepage-content/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro ao deletar conteúdo: ${error}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homepage-content'] });
    },
    onError: (error: any) => {
      console.error('Erro ao deletar card:', error);
      alert('Erro ao deletar card: ' + error.message);
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/homepage-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro ao atualizar configurações: ${error}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homepage-settings'] });
      alert('Configurações salvas com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar configurações:', error);
      alert('Erro ao atualizar configurações: ' + error.message);
    }
  });

  // Handlers
  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCard.title || !newCard.description) {
      alert('Título e descrição são obrigatórios');
      return;
    }

    createContentMutation.mutate(newCard);
  };

  const handleDeleteCard = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este card?')) {
      deleteContentMutation.mutate(id);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(settings);
  };

  // Loading state
  if (isLoadingContent || isLoadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (contentError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar conteúdo</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // Separar conteúdo por seção
  const newsCards = content.filter(c => c.section === 'news');
  const featuresCards = content.filter(c => c.section === 'features');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gerenciamento de Conteúdo
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie o conteúdo da página inicial e informações do site
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Status: Online
            </Badge>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview das Páginas
            </Button>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-2">
        <div className="flex items-center gap-6 text-sm">
          <span className="text-gray-500">Administração</span>
          <span className="text-gray-400">•</span>
          <span className="text-blue-600 font-medium">Gerenciamento de Conteúdo</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Cards da Página Inicial */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Cards da Página Inicial
              </h2>
              <Badge variant="secondary" className="text-xs">
                Gerencie os cards de destaque da página inicial (máx. 4)
              </Badge>
            </div>
            <Dialog open={isNewCardModalOpen} onOpenChange={setIsNewCardModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Cartão
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Card</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateCard} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Seção</label>
                      <select
                        value={newCard.section}
                        onChange={(e) => setNewCard({...newCard, section: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Selecionar seção do card"
                      >
                        <option value="news">Notícias</option>
                        <option value="features">Funcionalidades</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Categoria</label>
                      <Input
                        placeholder="Ex: Tecnologia, Arquivo"
                        value={newCard.category}
                        onChange={(e) => setNewCard({...newCard, category: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Título</label>
                    <Input
                      placeholder="Digite o título do card"
                      value={newCard.title}
                      onChange={(e) => setNewCard({...newCard, title: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Descrição</label>
                    <Textarea
                      placeholder="Digite a descrição do card"
                      className="min-h-[100px]"
                      value={newCard.description}
                      onChange={(e) => setNewCard({...newCard, description: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Autor</label>
                      <Input
                        value={newCard.author}
                        onChange={(e) => setNewCard({...newCard, author: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Data</label>
                      <Input
                        value={newCard.date}
                        onChange={(e) => setNewCard({...newCard, date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsNewCardModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createContentMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {createContentMutation.isPending ? 'Criando...' : 'Criar Card'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de Cards Existentes */}
          <div className="space-y-4">
            {content.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum card criado ainda. Clique em "Novo Cartão" para começar.
              </div>
            ) : (
              <>
                {/* Cards de Notícias */}
                {newsCards.map((card) => (
                  <Card key={card.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            {card.category}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {card.date} por {card.author}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {card.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                          {card.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {/* Cards de Funcionalidades */}
                {featuresCards.map((card) => (
                  <Card key={card.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-purple-600 border-purple-200">
                            {card.category}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {card.date} por {card.author}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {card.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                          {card.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Configurações */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Configurações
            </h2>
            <Badge variant="secondary" className="text-xs">
              Opções dos cards da página inicial
            </Badge>
          </div>

          <Card className="p-6">
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Quantidade de cards na página inicial
                  </label>
                  <select
                    value={settings.cards_count}
                    onChange={(e) => setSettings({...settings, cards_count: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Selecionar quantidade de cards"
                  >
                    <option value={2}>2 cartões</option>
                    <option value={3}>3 cartões</option>
                    <option value={4}>4 cartões</option>
                    <option value={5}>5 cartões</option>
                    <option value={6}>6 cartões</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Escolha quantos cards exibir na página inicial</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ordenação na página
                  </label>
                  <select
                    value={settings.cards_order}
                    onChange={(e) => setSettings({...settings, cards_order: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Selecionar ordenação dos cards"
                  >
                    <option value="recent">Mais recentes primeiro</option>
                    <option value="popular">Mais populares primeiro</option>
                    <option value="custom">Ordem personalizada</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={updateSettingsMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateSettingsMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}