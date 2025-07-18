/**
 * UserCreationForm - Seguindo SRP
 * Responsabilidade única: Formulário de criação de usuários
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  X, 
  User, 
  Mail, 
  Shield, 
  Key,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export interface UserCreationFormProps {
  onSubmit: (userData: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const UserCreationForm: React.FC<UserCreationFormProps> = ({
  onSubmit,
  onCancel,
  isLoading
}) => {
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as 'admin' | 'user'
  });

  const [errors, setErrors] = useState<string[]>([]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]); // Limpar erros ao alterar dados
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push('Nome é obrigatório');
    }

    if (!formData.email.trim()) {
      newErrors.push('Email é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push('Email deve ter formato válido');
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData);
  };

  const isFormValid = formData.name.trim() && formData.email.trim() && 
                     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white -m-6 mb-6 rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Criar Novo Usuário
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Erros de validação */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 mb-2">Erros encontrados:</h4>
                <ul className="text-red-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Nome Completo *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Digite o nome completo"
              disabled={isLoading}
              className="bg-white"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Email *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="Digite o email"
              disabled={isLoading}
              className="bg-white"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="inline h-4 w-4 mr-1" />
              Nível de Acesso
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => updateField('role', 'user')}
                disabled={isLoading}
                className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                  formData.role === 'user'
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                }`}
              >
                <User className="h-5 w-5 mx-auto mb-1" />
                <div className="font-medium">Usuário</div>
                <div className="text-xs">Acesso padrão ao sistema</div>
              </button>

              <button
                type="button"
                onClick={() => updateField('role', 'admin')}
                disabled={isLoading}
                className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                  formData.role === 'admin'
                    ? 'border-red-500 bg-red-50 text-red-800'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                }`}
              >
                <Shield className="h-5 w-5 mx-auto mb-1" />
                <div className="font-medium">Administrador</div>
                <div className="text-xs">Acesso total ao sistema</div>
              </button>
            </div>
          </div>

          {/* Informações sobre senha */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Key className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Sobre a Senha</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• A senha será gerada automaticamente pelo sistema</li>
                  <li>• Será exibida apenas uma vez após a criação</li>
                  <li>• Certifique-se de anotar e compartilhar com segurança</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Status de validação */}
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            isFormValid 
              ? 'bg-green-100 border border-green-200 text-green-700'
              : 'bg-orange-100 border border-orange-200 text-orange-700'
          }`}>
            {isFormValid ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            <span className="font-medium">
              {isFormValid ? 'Pronto para criar usuário' : 'Preencha todos os campos obrigatórios'}
            </span>
          </div>

          {/* Botões */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Criando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Criar Usuário
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};