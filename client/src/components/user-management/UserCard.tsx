/**
 * UserCard - Seguindo SRP
 * Responsabilidade única: Card expandido com detalhes completos do usuário
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Shield, 
  Mail, 
  Calendar,
  Key,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Send,
  AlertTriangle
} from 'lucide-react';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface UserCardProps {
  user: User;
  currentUserId?: number;
  onDelete: (userId: number) => void;
  isDeleting: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  currentUserId,
  onDelete,
  isDeleting
}) => {
  
  const [showPassword, setShowPassword] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isCurrentUser = user.id === currentUserId;

  const getPermissionsBadges = () => {
    const permissions = [];
    
    if (user.role === 'admin') {
      permissions.push(
        <Badge key="admin" className="bg-red-100 text-red-700 border-red-200">
          <Shield className="h-3 w-3 mr-1" />
          Administrador Total
        </Badge>
      );
    } else {
      permissions.push(
        <Badge key="user" className="bg-blue-100 text-blue-700 border-blue-200">
          <User className="h-3 w-3 mr-1" />
          Usuário Padrão
        </Badge>
      );
    }

    return permissions;
  };

  const getDetailedPermissions = () => {
    if (user.role === 'admin') {
      return [
        { category: 'Documentos', permissions: ['Visualizar', 'Editar', 'Deletar', 'Compartilhar', 'Baixar'] },
        { category: 'Usuários', permissions: ['Visualizar', 'Editar', 'Deletar', 'Criar'] },
        { category: 'Sistema', permissions: ['Admin Total', 'Configurações', 'Logs'] }
      ];
    } else {
      return [
        { category: 'Documentos', permissions: ['Visualizar', 'Baixar'] },
        { category: 'Usuários', permissions: ['Sem permissões'] },
        { category: 'Sistema', permissions: ['Sem permissões'] }
      ];
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white -m-6 mb-6 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            {user.role === 'admin' ? (
              <Shield className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          Detalhes do Usuário
          {isCurrentUser && (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              Você
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Informações básicas */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-blue-900 border-b border-blue-200 pb-2">
            Informações Básicas
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <label className="text-sm font-medium text-gray-600">Nome</label>
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <label className="text-sm font-medium text-gray-600">Criado em</label>
                <p className="font-medium text-gray-900">{formatDate(user.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <Key className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-600">Senha</label>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-gray-900">
                    {showPassword ? user.password : '••••••••••••'}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="h-6 w-6 p-0"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Permissões */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-blue-900 border-b border-blue-200 pb-2">
            Permissões do Sistema
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {getPermissionsBadges()}
          </div>

          <div className="space-y-3">
            {getDetailedPermissions().map((section) => (
              <div key={section.category} className="bg-white rounded-lg border border-blue-200 p-3">
                <h4 className="font-medium text-gray-800 mb-2">{section.category}</h4>
                <div className="flex flex-wrap gap-1">
                  {section.permissions.map((permission) => (
                    <Badge 
                      key={permission} 
                      className={`text-xs ${
                        permission.includes('Sem') || permission.includes('sem')
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ações */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-blue-900 border-b border-blue-200 pb-2">
            Ações
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="outline"
              className="w-full justify-start border-green-200 text-green-700 hover:bg-green-50"
              disabled
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Informações
              <Badge className="ml-auto bg-yellow-100 text-yellow-700 text-xs">
                Em breve
              </Badge>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50"
              disabled
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Credenciais
              <Badge className="ml-auto bg-yellow-100 text-yellow-700 text-xs">
                Em breve
              </Badge>
            </Button>

            {!isCurrentUser && (
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => onDelete(user.id)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deletando...
                  </div>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Usuário
                  </>
                )}
              </Button>
            )}

            {isCurrentUser && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-800 mb-1">Sua Conta</h4>
                    <p className="text-sm text-orange-700">
                      Você não pode deletar sua própria conta. Use outra conta de administrador para fazer alterações.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informações do sistema */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <h4 className="font-medium text-gray-800 mb-2">Informações do Sistema</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p>ID: #{user.id}</p>
            <p>Status: Ativo</p>
            <p>Banco: PostgreSQL</p>
            <p>Última modificação: {formatDate(user.createdAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};