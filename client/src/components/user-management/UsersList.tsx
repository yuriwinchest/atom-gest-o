/**
 * UsersList - Seguindo SRP
 * Responsabilidade única: Lista compacta de usuários
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  User, 
  Shield, 
  Mail, 
  Calendar,
  ChevronRight
} from 'lucide-react';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface UsersListProps {
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
  isLoading: boolean;
}

export const UsersList: React.FC<UsersListProps> = ({
  users,
  selectedUser,
  onSelectUser,
  isLoading
}) => {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <Badge className="bg-red-100 text-red-700 border-red-200">
        <Shield className="h-3 w-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
        <User className="h-3 w-3 mr-1" />
        Usuário
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Users className="h-5 w-5" />
            Lista de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="w-16 h-5 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-800">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Usuários
          </div>
          <Badge className="bg-gray-100 text-gray-700">
            {users.length} usuário(s)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="font-medium mb-1">Nenhum usuário encontrado</h3>
            <p className="text-sm">Clique em "Criar Novo Usuário" para adicionar o primeiro usuário</p>
          </div>
        ) : (
          users.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className={`w-full text-left transition-all duration-200 ${
                selectedUser?.id === user.id
                  ? 'ring-2 ring-blue-500 shadow-md'
                  : 'hover:shadow-sm hover:border-gray-300'
              }`}
            >
              <div className={`flex items-center gap-3 p-3 border rounded-lg ${
                selectedUser?.id === user.id
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  user.role === 'admin' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {user.role === 'admin' ? (
                    <Shield className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>

                {/* Informações do usuário */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {user.name}
                    </h4>
                    {getRoleBadge(user.role)}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate max-w-32">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Indicador de seleção */}
                <ChevronRight className={`h-4 w-4 transition-transform ${
                  selectedUser?.id === user.id 
                    ? 'rotate-90 text-blue-600' 
                    : 'text-gray-400'
                }`} />
              </div>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
};