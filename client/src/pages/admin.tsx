import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Shield, 
  CheckCircle, 
  Settings, 
  Users, 
  FileText, 
  AlertCircle,
  Info,
  BarChart3,
  HardDrive
} from 'lucide-react';

interface AdminPageProps {
  user: any;
  onLogout: () => void;
}

export default function AdminPage({ user, onLogout }: AdminPageProps) {
  const [, navigate] = useLocation();

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header responsivo com navegação */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">AtoM Gestão</span>
              </div>
              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Início</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Navegar</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-xs sm:text-sm text-blue-600 bg-blue-50 px-2 sm:px-3 py-1 rounded-full">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Importar</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal responsivo */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Avatar e título do perfil responsivo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-white text-xl sm:text-2xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Meu Perfil</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4 sm:px-0">
            Gerencie suas informações e visualize suas permissões
          </p>
        </div>

        {/* Cards principais responsivos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <User className="h-5 w-5" />
                Informações Pessoais
                <Button variant="ghost" size="sm" className="ml-auto text-blue-600">
                  Editar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Nome</div>
                <div className="font-medium text-gray-900">Administrador do Sistema</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Email</div>
                <div className="font-medium text-gray-900">{user.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Função</div>
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Administrador
                </Badge>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Estado</div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ativo
                </Badge>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Membro desde</div>
                <div className="font-medium text-gray-900">27/06/2025</div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo de Permissões */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Shield className="h-5 w-5" />
                Resumo de Permissões
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Documentos</span>
                <div className="text-right">
                  <div className="text-sm font-medium">5 de 5</div>
                  <div className="text-xs text-gray-500">permissões ativas</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Usuários</span>
                <div className="text-right">
                  <div className="text-sm font-medium">4 de 4</div>
                  <div className="text-xs text-gray-500">permissões ativas</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sistema</span>
                <div className="text-right">
                  <div className="text-sm font-medium">3 de 3</div>
                  <div className="text-xs text-gray-500">permissões ativas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Administrativas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/gerenciar-usuarios')}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-800 text-lg">
                <Users className="h-5 w-5" />
                Gerenciar Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Cadastrar novos usuários e definir suas permissões no sistema
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/gerenciar-conteudo')}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-800 text-lg">
                <Settings className="h-5 w-5" />
                Gerenciar Conteúdo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Editar conteúdo da página inicial, cards de destaque e informações do site
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/storage-monitor')}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800 text-lg">
                <BarChart3 className="h-5 w-5" />
                Monitor de Armazenamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Acompanhe o consumo de dados do PostgreSQL e Supabase em tempo real
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Acessar
              </Button>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/test-category-save')}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-800 text-lg">
                <AlertCircle className="h-5 w-5" />
                Teste de Categorias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Teste definitivo para verificar salvamento de novas categorias no formulário
              </p>
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                Testar Agora
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/login-monitoring')}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-800 text-lg">
                <Shield className="h-5 w-5" />
                Monitoramento de Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Acompanhe tentativas de login, sessões ativas e alertas de segurança
              </p>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                Acessar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Permissões Detalhadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Settings className="h-5 w-5" />
              Permissões Detalhadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Documentos */}
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-3">
                <FileText className="h-4 w-4" />
                Documentos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Visualizar</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Baixar</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Editar</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Deletar</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Enviar</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Compartilhar</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>

            {/* Usuários */}
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-3">
                <Users className="h-4 w-4" />
                Usuários
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Visualizar</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Criar</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Editar</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Deletar</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>

            {/* Sistema */}
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-3">
                <Settings className="h-4 w-4" />
                Sistema
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Administrador</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Configurações</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Logs</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Importantes */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="h-5 w-5" />
              Informações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Suas permissões são definidas pelo administrador do sistema</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Para solicitar alterações nas permissões, entre em contato com o administrador</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Mantenha suas informações de perfil sempre atualizadas</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Em caso de problemas, utilize o suporte técnico</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}