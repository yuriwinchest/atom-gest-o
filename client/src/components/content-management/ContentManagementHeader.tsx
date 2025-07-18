/**
 * ContentManagementHeader - Seguindo SRP
 * Responsabilidade única: Header da página de gerenciamento de conteúdo
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Layers, 
  Database, 
  Globe,
  Home,
  Link,
  Phone
} from 'lucide-react';

export const ContentManagementHeader: React.FC = () => {
  
  return (
    <div className="space-y-6">
      {/* Título principal */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">
          Gerenciamento de Conteúdo
        </h1>
        <p className="text-gray-600">
          Configure o conteúdo dinâmico do sistema
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800 text-base">
              <Home className="h-5 w-5" />
              Página Inicial
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-bold text-blue-900">
              Cards & Notícias
            </div>
            <p className="text-sm text-blue-600">
              Conteúdo principal
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800 text-base">
              <Link className="h-5 w-5" />
              Rodapé Dinâmico
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-bold text-green-900">
              Links & Páginas
            </div>
            <p className="text-sm text-green-600">
              Portal transparência
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800 text-base">
              <Phone className="h-5 w-5" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-bold text-orange-900">
              Informações
            </div>
            <p className="text-sm text-orange-600">
              Redes sociais
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
              Tempo real
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Informações sobre o sistema */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Settings className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-800 mb-2">
                Central de Controle de Conteúdo
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <Badge className="bg-blue-100 text-blue-700 mb-1">Cartões Iniciais</Badge>
                  <p>Gerencie cards, notícias e recursos que aparecem na página inicial do sistema</p>
                </div>
                <div>
                  <Badge className="bg-green-100 text-green-700 mb-1">Rodapé Dinâmico</Badge>
                  <p>Configure links como Portal da Transparência, Ouvidoria e outras páginas institucionais</p>
                </div>
                <div>
                  <Badge className="bg-orange-100 text-orange-700 mb-1">Informações de Contato</Badge>
                  <p>Atualize dados de contato, endereços e links de redes sociais institucionais</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};