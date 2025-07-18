import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Calendar, Shield, Eye, Edit, Trash2, Send, Users, Settings, Lock, FileText, UserPlus, Wrench, Key, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function MeuPerfil() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  if (!user) {
    return null;
  }

  // Mock das permissões do usuário (em produção viria do backend)
  const userPermissions = {
    documents: {
      view: true,
      edit: true,
      delete: true,
      share: true,
      download: true
    },
    users: {
      view: true,
      edit: true,
      delete: true,
      create: true
    },
    system: {
      admin: user?.role === 'admin',
      configs: user?.role === 'admin',
      logs: user?.role === 'admin'
    }
  };

  const permissionSummary = {
    documents: Object.values(userPermissions.documents).filter(Boolean).length,
    users: Object.values(userPermissions.users).filter(Boolean).length,
    system: Object.values(userPermissions.system).filter(Boolean).length
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header do Perfil */}
        <div className="text-center space-y-4">
          <Avatar className="h-20 w-20 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xl font-bold">
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xl font-bold">
              {getInitials(user?.username)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
            <p className="text-gray-600">Gerencie suas informações e visualize suas permissões</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Coluna Esquerda - Informações Pessoais */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Informações Pessoais */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-lg">
                  <User className="mr-2 h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nome</label>
                    <p className="text-lg font-semibold text-gray-900">{user?.username || 'Nome não disponível'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900 flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-gray-500" />
                      {user?.email || 'Email não disponível'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Função</label>
                    <div className="mt-1">
                      <Badge variant={user?.role === 'admin' ? 'destructive' : 'secondary'} className="text-sm">
                        <Shield className="mr-1 h-3 w-3" />
                        {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Estado</label>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                        ● Ativo
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Membro desde</label>
                    <p className="text-gray-900 flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                      27/06/2025
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita - Resumo de Permissões */}
          <div className="lg:col-span-2 space-y-6">
            


            {/* Permissões Detalhadas */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-lg">
                  <Key className="mr-2 h-5 w-5" />
                  Permissões Detalhadas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Seção Documentos */}
                <div>
                  <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                    <FileText className="mr-2 h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Documentos</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { key: 'view', label: 'Visualizar', icon: Eye, enabled: userPermissions.documents.view },
                      { key: 'edit', label: 'Editar', icon: Edit, enabled: userPermissions.documents.edit },
                      { key: 'delete', label: 'Deletar', icon: Trash2, enabled: userPermissions.documents.delete },
                      { key: 'share', label: 'Compartilhar', icon: Send, enabled: userPermissions.documents.share }
                    ].map((perm) => (
                      <div key={perm.key} className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-gray-50">
                        <div className="flex items-center">
                          <perm.icon className="h-4 w-4 text-gray-600 mr-2" />
                          <span className="text-sm text-gray-700">{perm.label}</span>
                        </div>
                        {perm.enabled ? (
                          <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seção Usuários */}
                <div>
                  <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                    <Users className="mr-2 h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Usuários</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { key: 'view', label: 'Visualizar', icon: Eye, enabled: userPermissions.users.view },
                      { key: 'edit', label: 'Editar', icon: Edit, enabled: userPermissions.users.edit },
                      { key: 'delete', label: 'Deletar', icon: Trash2, enabled: userPermissions.users.delete },
                      { key: 'create', label: 'Criar', icon: UserPlus, enabled: userPermissions.users.create }
                    ].map((perm) => (
                      <div key={perm.key} className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-gray-50">
                        <div className="flex items-center">
                          <perm.icon className="h-4 w-4 text-gray-600 mr-2" />
                          <span className="text-sm text-gray-700">{perm.label}</span>
                        </div>
                        {perm.enabled ? (
                          <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seção Sistema */}
                <div>
                  <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                    <Settings className="mr-2 h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Sistema</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'admin', label: 'Administrador', icon: Shield, enabled: userPermissions.system.admin },
                      { key: 'configs', label: 'Configurações', icon: Wrench, enabled: userPermissions.system.configs },
                      { key: 'logs', label: 'Logs', icon: FileText, enabled: userPermissions.system.logs }
                    ].map((perm) => (
                      <div key={perm.key} className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-gray-50">
                        <div className="flex items-center">
                          <perm.icon className="h-4 w-4 text-gray-600 mr-2" />
                          <span className="text-sm text-gray-700">{perm.label}</span>
                        </div>
                        {perm.enabled ? (
                          <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Importantes */}
            <Card className="border-0 shadow-lg border-l-4 border-l-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-yellow-700">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Informações Importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">Suas permissões são definidas pelo administrador do sistema</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">Para solicitar alterações nas permissões, entre em contato com o administrador</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">Mantenha suas informações de perfil sempre atualizadas</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">Em caso de problemas, utilize o suporte técnico</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}