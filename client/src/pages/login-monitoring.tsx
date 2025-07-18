import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, AlertTriangle, Activity, Monitor, Clock, MapPin, Globe } from 'lucide-react';

const LoginMonitoringDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  // Queries para dados de monitoramento
  const { data: loginStats, isLoading: statsLoading } = useQuery({
    queryKey: ['login-stats', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/login-stats?days=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas de login');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const { data: activeSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: async () => {
      const response = await fetch('/api/active-sessions');
      if (!response.ok) {
        throw new Error('Erro ao buscar sessões ativas');
      }
      return response.json();
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10000, // Atualizar a cada 10 segundos
  });

  const { data: securityAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['security-alerts'],
    queryFn: async () => {
      const response = await fetch('/api/security-alerts');
      if (!response.ok) {
        throw new Error('Erro ao buscar alertas de segurança');
      }
      return response.json();
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 15000, // Atualizar a cada 15 segundos
  });

  const { data: loginHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['login-history'],
    queryFn: async () => {
      const response = await fetch('/api/login-history');
      if (!response.ok) {
        throw new Error('Erro ao buscar histórico de logins');
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchInterval: 20000, // Atualizar a cada 20 segundos
  });

  // Funções utilitárias
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'blocked':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const resolveAlert = async (alertId: number) => {
    try {
      const response = await fetch(`/api/security-alerts/${alertId}/resolve`, {
        method: 'PATCH',
      });
      if (response.ok) {
        // Refetch alerts after resolving
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao resolver alerta:', error);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/terminate`, {
        method: 'POST',
      });
      if (response.ok) {
        // Refetch sessions after terminating
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao terminar sessão:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Monitoramento de Login</h1>
          </div>
          <p className="text-gray-600">
            Dashboard de segurança para monitoramento de acessos e atividades do sistema
          </p>
        </div>

        {/* Cartões de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Total de Tentativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {statsLoading ? '...' : loginStats?.total_attempts || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Últimos {selectedPeriod} dias
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Logins Sucessos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statsLoading ? '...' : loginStats?.successful_logins || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Taxa: {statsLoading ? '...' : Math.round(((loginStats?.successful_logins || 0) / (loginStats?.total_attempts || 1)) * 100)}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Tentativas Falhadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {statsLoading ? '...' : loginStats?.failed_attempts || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Taxa: {statsLoading ? '...' : Math.round(((loginStats?.failed_attempts || 0) / (loginStats?.total_attempts || 1)) * 100)}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Sessões Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {sessionsLoading ? '...' : activeSessions?.length || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Usuários online agora
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros de período */}
        <div className="mb-6">
          <div className="flex gap-2">
            {[7, 30, 90].map((days) => (
              <Button
                key={days}
                variant={selectedPeriod === days ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(days)}
              >
                {days} dias
              </Button>
            ))}
          </div>
        </div>

        {/* Abas de conteúdo */}
        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sessions">Sessões Ativas</TabsTrigger>
            <TabsTrigger value="alerts">Alertas de Segurança</TabsTrigger>
            <TabsTrigger value="history">Histórico de Login</TabsTrigger>
          </TabsList>

          {/* Sessões Ativas */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Sessões Ativas ({activeSessions?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessionsLoading ? (
                    <div className="text-center py-8">Carregando sessões...</div>
                  ) : activeSessions?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma sessão ativa encontrada
                    </div>
                  ) : (
                    activeSessions?.map((session: any) => (
                      <div
                        key={session.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{session.username}</span>
                              <Badge variant="outline">{session.email}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Globe className="h-4 w-4" />
                                {session.ip_address}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Login: {formatDate(session.login_time)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Activity className="h-4 w-4" />
                                Ativo: {formatDate(session.last_activity)}
                              </div>
                            </div>
                            {session.location_info && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                {session.location_info.city}, {session.location_info.country}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => terminateSession(session.session_id)}
                          >
                            Terminar Sessão
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alertas de Segurança */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alertas de Segurança ({securityAlerts?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alertsLoading ? (
                    <div className="text-center py-8">Carregando alertas...</div>
                  ) : securityAlerts?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum alerta de segurança encontrado
                    </div>
                  ) : (
                    securityAlerts?.map((alert: any) => (
                      <Alert key={alert.id} className="border-l-4 border-l-red-500">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge className={getSeverityColor(alert.severity)}>
                                  {alert.severity.toUpperCase()}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  {alert.alert_type}
                                </span>
                              </div>
                              <p className="font-medium">{alert.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>IP: {alert.ip_address}</span>
                                <span>Data: {formatDate(alert.created_at)}</span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              Resolver
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Histórico de Login */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Histórico de Login (últimos 100)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historyLoading ? (
                    <div className="text-center py-8">Carregando histórico...</div>
                  ) : loginHistory?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum histórico de login encontrado
                    </div>
                  ) : (
                    loginHistory?.map((entry: any) => (
                      <div
                        key={entry.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{entry.username}</span>
                              <Badge className={getStatusColor(entry.login_status)}>
                                {entry.login_status}
                              </Badge>
                              {entry.failure_reason && (
                                <span className="text-sm text-red-600">
                                  ({entry.failure_reason})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>IP: {entry.ip_address}</span>
                              <span>Login: {formatDate(entry.login_time)}</span>
                              {entry.logout_time && (
                                <span>Logout: {formatDate(entry.logout_time)}</span>
                              )}
                              {entry.session_duration && (
                                <span>Duração: {formatDuration(entry.session_duration)}</span>
                              )}
                            </div>
                            {entry.device_info && (
                              <div className="text-sm text-gray-600">
                                Device: {entry.device_info.browser} em {entry.device_info.os}
                                {entry.device_info.mobile && ' (Mobile)'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoginMonitoringDashboard;