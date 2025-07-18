/**
 * UserManagementHeader - Seguindo SRP
 * Responsabilidade única: Header da página de gerenciamento de usuários
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Shield, Database } from 'lucide-react';

export interface UserManagementHeaderProps {
  totalUsers: number;
  onCreateUser: () => void;
  isLoading: boolean;
}

export const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  totalUsers,
  onCreateUser,
  isLoading
}) => {
  
  return (
    <div className="space-y-6">
      {/* Título principal */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
          Gerenciar Usuários
        </h1>
        <p className="text-gray-600">
          Administre usuários do sistema com controle granular de permissões
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800 text-base">
              <Users className="h-5 w-5" />
              Total de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-900">
              {isLoading ? '...' : totalUsers}
            </div>
            <p className="text-sm text-blue-600">
              Usuários ativos no sistema
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800 text-base">
              <Shield className="h-5 w-5" />
              Controle de Acesso
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2 mb-2">
              <Badge className="bg-green-100 text-green-700">Admin</Badge>
              <Badge className="bg-blue-100 text-blue-700">Usuário</Badge>
            </div>
            <p className="text-sm text-green-600">
              Níveis de permissão
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-800 text-base">
              <Database className="h-5 w-5" />
              Persistência
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-bold text-purple-900">
              PostgreSQL
            </div>
            <p className="text-sm text-purple-600">
              Dados seguros no banco
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Botão de criar usuário */}
      <div className="flex justify-center">
        <Button
          onClick={onCreateUser}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2"
          disabled={isLoading}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Criar Novo Usuário
        </Button>
      </div>

      {/* Informações importantes */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-800 mb-1">Sobre o Gerenciamento de Usuários</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Apenas administradores podem criar e gerenciar usuários</li>
                <li>• Senhas são geradas automaticamente e mostradas apenas na criação</li>
                <li>• Usuários são salvos com segurança no banco PostgreSQL</li>
                <li>• Não é possível deletar sua própria conta</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};