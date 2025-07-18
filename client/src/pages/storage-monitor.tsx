import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  HardDrive, 
  BarChart3, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  FileText,
  Image,
  Video,
  Music,
  Table,
  Presentation,
  Archive,
  Folder
} from 'lucide-react';

interface StorageStats {
  postgresql: {
    totalSize: number;
    tablesSizes: Array<{
      tableName: string;
      size: number;
      rows: number;
    }>;
    indexesSize: number;
    totalRows: number;
  };
  supabase: {
    totalSize: number;
    buckets: Array<{
      name: string;
      size: number;
      fileCount: number;
      fileTypes: Array<{
        type: string;
        count: number;
        size: number;
      }>;
    }>;
  };
  summary: {
    totalSystemSize: number;
    growthRate: number;
    lastUpdated: string;
  };
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getBucketIcon = (bucketName: string) => {
  switch (bucketName) {
    case 'documents': return <FileText className="h-6 w-6" />;
    case 'images': return <Image className="h-6 w-6" />;
    case 'videos': return <Video className="h-6 w-6" />;
    case 'audio': return <Music className="h-6 w-6" />;
    case 'spreadsheets': return <Table className="h-6 w-6" />;
    case 'presentations': return <Presentation className="h-6 w-6" />;
    case 'compressed': return <Archive className="h-6 w-6" />;
    default: return <Folder className="h-6 w-6" />;
  }
};

const getBucketColor = (bucketName: string) => {
  switch (bucketName) {
    case 'documents': return 'bg-blue-500';
    case 'images': return 'bg-green-500';
    case 'videos': return 'bg-red-500';
    case 'audio': return 'bg-yellow-500';
    case 'spreadsheets': return 'bg-purple-500';
    case 'presentations': return 'bg-pink-500';
    case 'compressed': return 'bg-gray-500';
    default: return 'bg-gray-400';
  }
};

const getStorageHealth = (totalSize: number) => {
  const maxSize = 10 * 1024 * 1024 * 1024; // 10GB limite exemplo
  const percentage = (totalSize / maxSize) * 100;

  if (percentage < 70) {
    return {
      status: 'healthy' as const,
      message: 'Armazenamento saudável',
      percentage,
      color: 'text-green-600',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />
    };
  } else if (percentage < 90) {
    return {
      status: 'warning' as const,
      message: 'Atenção ao armazenamento',
      percentage,
      color: 'text-yellow-600',
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />
    };
  } else {
    return {
      status: 'critical' as const,
      message: 'Armazenamento crítico',
      percentage,
      color: 'text-red-600',
      icon: <AlertCircle className="h-5 w-5 text-red-600" />
    };
  }
};

export default function StorageMonitor() {
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { data: stats, isLoading, error, refetch } = useQuery<StorageStats>({
    queryKey: ['/api/storage/stats'],
    refetchInterval: autoRefresh ? 30000 : false, // Atualizar a cada 30 segundos se auto-refresh ativado
    staleTime: 10000, // Dados ficam "stale" após 10 segundos
  });

  const health = stats ? getStorageHealth(stats.summary.totalSystemSize) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium text-gray-700">Coletando estatísticas de armazenamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Erro ao carregar estatísticas de armazenamento. Tente novamente.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div>Nenhum dado disponível</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              📊 Monitor de Armazenamento
            </h1>
            <p className="text-gray-600 text-lg">
              Acompanhe o consumo de dados do sistema em tempo real
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Status de Saúde */}
        {health && (
          <Alert className={`mb-6 ${health.status === 'healthy' ? 'border-green-200 bg-green-50' : 
                                  health.status === 'warning' ? 'border-yellow-200 bg-yellow-50' : 
                                  'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-3">
              {health.icon}
              <div>
                <p className={`font-semibold ${health.color}`}>{health.message}</p>
                <p className="text-sm text-gray-600">
                  Uso total: {formatBytes(stats.summary.totalSystemSize)} ({health.percentage.toFixed(1)}% do limite)
                </p>
              </div>
            </div>
          </Alert>
        )}

        {/* Resumo Geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Armazenamento Total</CardTitle>
              <HardDrive className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {formatBytes(stats.summary.totalSystemSize)}
              </div>
              <p className="text-xs text-blue-100">
                Última atualização: {new Date(stats.summary.lastUpdated).toLocaleString('pt-BR')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PostgreSQL</CardTitle>
              <Database className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {formatBytes(stats.postgresql.totalSize)}
              </div>
              <p className="text-xs text-green-100">
                {stats.postgresql.totalRows.toLocaleString()} registros
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Supabase Storage</CardTitle>
              <BarChart3 className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {formatBytes(stats.supabase.totalSize)}
              </div>
              <p className="text-xs text-purple-100">
                {stats.supabase.buckets.reduce((sum, bucket) => sum + bucket.fileCount, 0)} arquivos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detalhes PostgreSQL */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Detalhes do PostgreSQL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Tamanho das Tabelas</h4>
                <div className="space-y-2">
                  {stats.postgresql.tablesSizes.map((table, index) => (
                    <div key={table.tableName} className="flex justify-between items-center">
                      <span className="text-sm">{table.tableName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{formatBytes(table.size)}</span>
                        <Badge variant="outline" className="text-xs">
                          {table.rows.toLocaleString()} linhas
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Estatísticas Gerais</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Tamanho dos Índices</span>
                    <span className="text-sm font-medium">{formatBytes(stats.postgresql.indexesSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total de Registros</span>
                    <span className="text-sm font-medium">{stats.postgresql.totalRows.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tamanho Total</span>
                    <span className="text-sm font-medium">{formatBytes(stats.postgresql.totalSize)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes Supabase Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Detalhes do Supabase Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.supabase.buckets.map((bucket) => (
                <div key={bucket.name} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${getBucketColor(bucket.name)} text-white`}>
                        {getBucketIcon(bucket.name)}
                      </div>
                      <h4 className="font-semibold capitalize">{bucket.name}</h4>
                    </div>
                    <Badge variant="outline">
                      {bucket.fileCount} arquivos
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Tamanho Total</p>
                    <p className="text-lg font-bold">{formatBytes(bucket.size)}</p>
                  </div>

                  {bucket.fileTypes.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Tipos de Arquivo</p>
                      <div className="space-y-1">
                        {bucket.fileTypes.slice(0, 3).map((fileType) => (
                          <div key={fileType.type} className="flex justify-between text-xs">
                            <span className="uppercase">{fileType.type}</span>
                            <span>{fileType.count} ({formatBytes(fileType.size)})</span>
                          </div>
                        ))}
                        {bucket.fileTypes.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{bucket.fileTypes.length - 3} outros tipos
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Proporção de Uso */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Proporção de Uso do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">PostgreSQL (Metadados)</span>
                  <span className="text-sm">
                    {((stats.postgresql.totalSize / stats.summary.totalSystemSize) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={(stats.postgresql.totalSize / stats.summary.totalSystemSize) * 100} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Supabase Storage (Arquivos)</span>
                  <span className="text-sm">
                    {((stats.supabase.totalSize / stats.summary.totalSystemSize) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={(stats.supabase.totalSize / stats.summary.totalSystemSize) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}