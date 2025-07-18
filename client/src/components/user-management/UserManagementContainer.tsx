/**
 * UserManagementContainer - Seguindo SRP
 * Responsabilidade única: Orquestrar gerenciamento de usuários
 * REFATORAÇÃO: gerenciar-usuarios.tsx (709 linhas) dividido em módulos
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserManagementHeader } from './UserManagementHeader';
import { UserCreationForm } from './UserCreationForm';
import { UsersList } from './UsersList';
import { UserCard } from './UserCard';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export const UserManagementContainer: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para listar usuários
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/users'],
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Query para usuário atual
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/me'],
    staleTime: 5 * 60 * 1000,
  });

  // Mutation para criar usuário
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setShowCreateForm(false);
      toast({
        title: "Usuário criado com sucesso!",
        description: `${data.user.name} foi criado com senha: ${data.password}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar usuário
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setSelectedUser(null);
      toast({
        title: "Usuário deletado",
        description: "Usuário removido do sistema com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao deletar usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = (userData: any) => {
    createUserMutation.mutate(userData);
  };

  const handleDeleteUser = (userId: number) => {
    if (currentUser?.user?.id === userId) {
      toast({
        title: "Operação não permitida",
        description: "Você não pode deletar sua própria conta",
        variant: "destructive",
      });
      return;
    }

    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(selectedUser?.id === user.id ? null : user);
  };

  const isAdmin = currentUser?.user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Negado</h2>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <UserManagementHeader
        totalUsers={users?.length || 0}
        onCreateUser={() => setShowCreateForm(true)}
        isLoading={isLoading}
      />

      {/* Formulário de criação */}
      {showCreateForm && (
        <UserCreationForm
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateForm(false)}
          isLoading={createUserMutation.isPending}
        />
      )}

      {/* Lista de usuários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista compacta */}
        <UsersList
          users={users || []}
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
          isLoading={isLoading}
        />

        {/* Card expandido do usuário selecionado */}
        {selectedUser && (
          <UserCard
            user={selectedUser}
            currentUserId={currentUser?.user?.id}
            onDelete={handleDeleteUser}
            isDeleting={deleteUserMutation.isPending}
          />
        )}
      </div>

      {/* Placeholder quando nenhum usuário está selecionado */}
      {!selectedUser && !isLoading && (
        <div className="lg:hidden">
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-gray-500">
              <h3 className="text-lg font-medium mb-2">Selecione um usuário</h3>
              <p>Clique em um usuário da lista para ver detalhes completos</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};