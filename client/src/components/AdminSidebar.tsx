import { useState } from 'react';
import { User, Settings, Users, FileText, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  user: any;
  onLogout: () => void;
  onMenuSelect: (menu: string) => void;
  selectedMenu: string;
}

export default function AdminSidebar({ user, onLogout, onMenuSelect, selectedMenu }: AdminSidebarProps) {
  const menuItems = [
    { id: 'profile', label: 'Meu Perfil', icon: User },
    { id: 'settings', label: 'Configurações', icon: Settings },
    { id: 'users', label: 'Gerenciar Usuários', icon: Users },
    { id: 'content', label: 'Gerenciar Conteúdo', icon: FileText },
  ];

  return (
    <div className="w-80 bg-gradient-to-b from-blue-600 to-purple-700 text-white flex flex-col">
      {/* Header do Admin */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <User className="text-white" size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg">Administrador do Sistema</h2>
            <p className="text-blue-100 text-sm">{user?.email || 'admin@empresa.com'}</p>
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium">Administrador Sistema</span>
          </div>
        </div>
      </div>

      {/* Menu de Navegação */}
      <div className="flex-1 p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedMenu === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isSelected ? "secondary" : "ghost"}
                className={`w-full justify-start text-left p-3 rounded-lg transition-all duration-200 ${
                  isSelected 
                    ? 'bg-white text-blue-700 shadow-md hover:bg-white/95' 
                    : 'text-white hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => onMenuSelect(item.id)}
              >
                <Icon className="mr-3" size={18} />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Botão de Sair */}
      <div className="p-6 border-t border-white/10">
        <Button
          variant="outline"
          className="w-full border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-colors duration-200"
          onClick={onLogout}
        >
          <LogOut className="mr-2" size={16} />
          Sair
        </Button>
      </div>
    </div>
  );
}