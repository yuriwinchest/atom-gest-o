import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/LoginModal';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface AuthProtectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthProtection({ children, fallback }: AuthProtectionProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLogin, setShowLogin] = React.useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        {fallback || (
          <>
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Acesso Restrito
            </h2>
            <p className="text-gray-600 mb-6">
              Você precisa estar logado para acessar esta área.
            </p>
            <Button 
              onClick={() => setShowLogin(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Fazer Login
            </Button>
            <LoginModal 
              isOpen={showLogin} 
              onClose={() => setShowLogin(false)} 
            />
          </>
        )}
      </div>
    );
  }

  return <>{children}</>;
}