import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, User, Bell, Shield, Eye } from "lucide-react";
import { useState } from "react";

export default function UserSettings() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Configurações
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie suas preferências e configurações de conta
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Informações do Perfil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Perfil
              </CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e de contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input
                    id="username"
                    value={user?.username || ''}
                    readOnly
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="role">Função</Label>
                <Input
                  id="role"
                  value={user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <Button className="w-full sm:w-auto">
                Atualizar Perfil
              </Button>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure como você gostaria de receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notificações do Sistema</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receba notificações sobre atualizações do sistema
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-updates">Atualizações por E-mail</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receba resumos semanais por e-mail
                  </p>
                </div>
                <Switch
                  id="email-updates"
                  checked={emailUpdates}
                  onCheckedChange={setEmailUpdates}
                />
              </div>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança
              </CardTitle>
              <CardDescription>
                Gerencie suas configurações de segurança e privacidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor">Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Adicione uma camada extra de segurança à sua conta
                  </p>
                </div>
                <Switch
                  id="two-factor"
                  checked={twoFactor}
                  onCheckedChange={setTwoFactor}
                />
              </div>
              <Separator />
              <div className="space-y-3">
                <Label>Alterar Senha</Label>
                <div className="grid gap-3">
                  <Input type="password" placeholder="Senha atual" />
                  <Input type="password" placeholder="Nova senha" />
                  <Input type="password" placeholder="Confirmar nova senha" />
                </div>
                <Button variant="outline">
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacidade
              </CardTitle>
              <CardDescription>
                Controle quem pode ver suas informações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Suas informações são mantidas privadas e seguras. Apenas administradores 
                  do sistema têm acesso aos dados necessários para suporte técnico.
                </p>
                <Button variant="outline">
                  Baixar Dados Pessoais
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}