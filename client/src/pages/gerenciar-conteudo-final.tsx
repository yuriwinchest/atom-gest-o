import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Plus, Eye, Edit, Trash2, Save, FileText } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function GerenciarConteudo() {
  const [activeTab, setActiveTab] = useState('cards');
  const [contactData, setContactData] = useState({
    email: '',
    phone: '',
    address: '',
    business_hours: '',
    description: ''
  });

  const queryClient = useQueryClient();

  // Buscar informações de contato
  const { data: contactInfo, isLoading: contactLoading } = useQuery({
    queryKey: ['/api/contact-info'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Buscar links do rodapé
  const { data: footerLinks, isLoading: footerLoading } = useQuery({
    queryKey: ['/api/footer-links'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Buscar redes sociais
  const { data: socialNetworks, isLoading: socialLoading } = useQuery({
    queryKey: ['/api/social-networks'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Mutation para salvar informações de contato
  const saveContactMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/contact-info', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact-info'] });
    }
  });

  // Atualizar dados de contato quando carregados
  useEffect(() => {
    if (contactInfo) {
      setContactData({
        email: (contactInfo as any).email || '',
        phone: (contactInfo as any).phone || '',
        address: (contactInfo as any).address || '',
        business_hours: (contactInfo as any).business_hours || '',
        description: (contactInfo as any).description || ''
      });
    }
  }, [contactInfo]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveContactMutation.mutateAsync(contactData);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Principal */}
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

      {/* Abas */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium ${
              activeTab === 'cards' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="h-4 w-4" />
            Cartões Iniciais
          </button>
          <button 
            onClick={() => setActiveTab('footer')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium ${
              activeTab === 'footer' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Rodapé
          </button>
          <button 
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium ${
              activeTab === 'contact' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Contato
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Aba de Cartões */}
        {activeTab === 'cards' && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Cartões da Página Inicial</h3>
            <p className="text-gray-600">Gerencie os cards de destaque da página inicial.</p>
          </div>
        )}

        {/* Aba do Rodapé */}
        {activeTab === 'footer' && (
          <>
            {/* Seção do Rodapé */}
            <div className="grid grid-cols-2 gap-8">
              {/* Links Úteis */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Links Úteis</h3>
                      <p className="text-sm text-gray-600">Gerencie os links do rodapé com conteúdo relevante</p>
                    </div>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Link
                  </Button>
                </div>

                {/* Lista de Links Úteis */}
                <div className="space-y-4">
                  {/* Portal da Transparência */}
                  <Card className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">Portal da Transparência</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Acesse informações sobre <strong>gastos públicos</strong>, 
                          licitações e <strong>contratos</strong> do governo...
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="sm" className="text-green-600">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-blue-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Ouvidoria */}
                  <Card className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">Ouvidoria</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Canal direto para <strong>sugestões</strong>, reclamações e 
                          <strong>denúncias</strong>...
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="sm" className="text-green-600">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-blue-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Lei de Acesso à Informação */}
                  <Card className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">Acesso à Informação</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Solicite <strong>informações públicas</strong> de forma 
                          gratuita e <strong>transparente</strong>...
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="sm" className="text-green-600">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-blue-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Política de Privacidade */}
                  <Card className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">Política de Privacidade</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Conheça como <strong>protegemos</strong> seus dados 
                          pessoais e garantimos sua <strong>privacidade</strong>...
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="sm" className="text-green-600">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-blue-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Settings className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Redes Sociais</h3>
                      <p className="text-sm text-gray-600">Configure links das redes sociais</p>
                    </div>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Rede
                  </Button>
                </div>

                {/* Lista de Redes Sociais */}
                <div className="space-y-4">
                  {/* LinkedIn */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">Li</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">LinkedIn</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* GoJaia */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">G</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">GoJaia</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* LinkedIn (segundo) */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">Li</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">LinkedIn</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* YouTube */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">YT</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">YouTube</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>

            {/* Descrição do Sistema */}
            <div className="space-y-6 mt-12">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Descrição do Sistema</h3>
                <Badge variant="secondary" className="text-xs">
                  Texto descritivo que aparece no rodapé
                </Badge>
              </div>

              <Card className="p-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Descrição que aparece no rodapé do site
                  </label>
                  <Textarea 
                    defaultValue="Sistema de Gestão de Arquivos - Preservando e organizando o patrimônio documental para as futuras gerações."
                    className="min-h-[100px]"
                    placeholder="Digite a descrição do sistema..."
                  />
                  <div className="text-sm text-gray-500">
                    © 2024 Sistema de Gestão de Arquivos. Todos os direitos reservados.
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Descrição
                  </Button>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Aba de Contato */}
        {activeTab === 'contact' && (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Informações de Contato</h2>
                <p className="text-sm text-gray-600">Edite as informações de contato da página</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Formulário de Contato */}
              <Card className="p-6">
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <Input
                        value={contactData.email}
                        onChange={(e) => setContactData({...contactData, email: e.target.value})}
                        placeholder="contato@gestaoarquivos.gov.br"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                      <Input
                        value={contactData.phone}
                        onChange={(e) => setContactData({...contactData, phone: e.target.value})}
                        placeholder="(11) 3456-7890"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                    <Input
                      value={contactData.address}
                      onChange={(e) => setContactData({...contactData, address: e.target.value})}
                      placeholder="Rua da Administração, 123 - Centro - São Paulo/SP"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Horário de Funcionamento</label>
                    <Input
                      value={contactData.business_hours}
                      onChange={(e) => setContactData({...contactData, business_hours: e.target.value})}
                      placeholder="Segunda a Sexta: 8h às 17h"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                    <Textarea
                      value={contactData.description}
                      onChange={(e) => setContactData({...contactData, description: e.target.value})}
                      className="min-h-[100px]"
                      placeholder="Preservando e disponibilizando o patrimônio histórico para as futuras gerações."
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={saveContactMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveContactMutation.isPending ? 'Salvando...' : 'Salvar Informações'}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Preview das Informações */}
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Preview das Informações</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">E-mail:</div>
                      <div className="text-sm text-gray-900">contato@gestaoarquivos.gov.br</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Telefone:</div>
                      <div className="text-sm text-gray-900">(11) 3456-7890</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Endereço:</div>
                      <div className="text-sm text-gray-900">Rua da Administração, 123 - Centro - São Paulo/SP</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Horário:</div>
                      <div className="text-sm text-gray-900">Segunda a Sexta: 8h às 17h</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Descrição:</div>
                      <div className="text-sm text-gray-900">Preservando e disponibilizando o patrimônio histórico para as futuras gerações.</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-between items-center">
              <Button variant="outline" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Ver Página de Contato
              </Button>
              
              <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <Save className="h-4 w-4" />
                Salvo Automaticamente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}