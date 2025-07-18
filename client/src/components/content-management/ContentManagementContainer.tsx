/**
 * ContentManagementContainer - Seguindo SRP
 * Responsabilidade única: Orquestrar gerenciamento de conteúdo do site
 * REFATORAÇÃO: gerenciar-conteudo.tsx (920 linhas) dividido em módulos FINAIS
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentManagementHeader } from './ContentManagementHeader';
import { HomepageCardsManagement } from './HomepageCardsManagement';
import { FooterPagesManagement } from './FooterPagesManagement';
import { ContactManagement } from './ContactManagement';
import { Layers, Home, Link, Phone } from 'lucide-react';

export const ContentManagementContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('cards');

  const tabs = [
    {
      id: 'cards',
      label: 'Cartões Iniciais',
      icon: Home,
      description: 'Gerenciar cards da página inicial'
    },
    {
      id: 'footer',
      label: 'Rodapé',
      icon: Link,
      description: 'Gerenciar links do rodapé'
    },
    {
      id: 'contact',
      label: 'Contato',
      icon: Phone,
      description: 'Informações de contato'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header principal */}
      <ContentManagementHeader />

      {/* Tabs de navegação */}
      <Card className="border-gray-200">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-800 text-white -m-6 mb-6 rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Gerenciamento de Conteúdo
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
                  >
                    <Icon className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-xs text-gray-500 hidden md:block">
                        {tab.description}
                      </div>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Conteúdo dos tabs */}
            <div className="p-6">
              <TabsContent value="cards" className="mt-0">
                <HomepageCardsManagement />
              </TabsContent>

              <TabsContent value="footer" className="mt-0">
                <FooterPagesManagement />
              </TabsContent>

              <TabsContent value="contact" className="mt-0">
                <ContactManagement />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Informações do sistema */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Layers className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Sistema de Gerenciamento de Conteúdo</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Cartões Iniciais:</strong> Gerencie cards, notícias e recursos da página inicial</li>
                <li>• <strong>Rodapé:</strong> Configure links dinâmicos do rodapé (Portal da Transparência, etc.)</li>
                <li>• <strong>Contato:</strong> Atualize informações de contato e redes sociais</li>
                <li>• <strong>Persistência:</strong> Todos os dados são salvos no PostgreSQL em tempo real</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};