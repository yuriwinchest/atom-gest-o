import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Shield, Calendar, FileText, Activity } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Profile() {
  const { user } = useAuth();

  const userInitials = user?.username ? user.username.charAt(0).toUpperCase() : 'U';
  const joinDate = new Date(); // Simular data de cadastro
  const lastLogin = new Date(); // Simular último login

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header do Perfil */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-2xl font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {user?.username || 'Usuário'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {user?.email || 'email@exemplo.com'}
                </p>
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                  <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                    {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </Badge>
                  <Badge variant="outline">
                    Ativo
                  </Badge>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <Button>
                    Editar Perfil
                  </Button>
                  <Button variant="outline">
                    Alterar Senha
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Seus dados básicos de cadastro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">E-mail</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.email || 'email@exemplo.com'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Função</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.role === 'admin' ? 'Administrador do Sistema' : 'Usuário Padrão'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Membro desde</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(joinDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Atividade Recente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
              <CardDescription>
                Seu histórico de atividades no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Último acesso</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(lastLogin, "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Documentos gerenciados</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Acesso a documentos do sistema
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Status da conta</p>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Ativa e verificada
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Estatísticas de Uso
              </CardTitle>
              <CardDescription>
                Resumo da sua atividade no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {user?.role === 'admin' ? 'Todos' : '0'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Documentos Acessados
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {user?.role === 'admin' ? 'Ilimitado' : 'Padrão'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nível de Acesso
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    1
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sessões Hoje
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    Ativo
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Status Atual
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}