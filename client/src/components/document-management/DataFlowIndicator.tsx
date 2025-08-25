/**
 * Componente para mostrar que os dados vão direto para o banco de dados
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, ArrowRight, Server } from 'lucide-react';

export const DataFlowIndicator: React.FC = () => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Database className="h-5 w-5" />
          Fluxo de Dados - Direto para o Banco
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fluxo visual */}
        <div className="flex items-center justify-center space-x-4">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Server className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm text-blue-700 mt-2">Navegador</span>
          </div>

          <ArrowRight className="h-6 w-6 text-blue-500" />

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Database className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm text-green-700 mt-2">Banco de Dados</span>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">Upload de Arquivos:</span>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              ✅ Direto para Backblaze B2
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">Metadados:</span>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              ✅ Direto para Supabase
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">Persistência Local:</span>
            <Badge variant="outline" className="bg-red-100 text-red-800">
              ❌ Desabilitada
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">Comportamento:</span>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              🔄 Sempre do Servidor
            </Badge>
          </div>
        </div>

        {/* Explicação */}
        <div className="text-xs text-blue-600 bg-blue-100 p-3 rounded-lg">
          <strong>💾 Comportamento Atual:</strong> Todos os dados são enviados diretamente
          para os bancos de dados (Backblaze B2 para arquivos, Supabase para metadados).
          Não há persistência local no navegador. Ao recarregar a página, os dados são
          sempre carregados do servidor. Isso garante consistência mas requer conexão
          com a internet.
        </div>

        {/* Benefícios */}
        <div className="text-xs text-green-600 bg-green-100 p-3 rounded-lg">
          <strong>✅ Benefícios:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Dados sempre consistentes entre usuários</li>
            <li>Nenhum risco de dados desatualizados no navegador</li>
            <li>Compatível com múltiplos dispositivos</li>
            <li>Dados seguros no servidor</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

