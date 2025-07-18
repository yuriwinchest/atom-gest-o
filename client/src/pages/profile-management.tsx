import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useOptimizedUser } from "@/hooks/useOptimizedUser";
import { User, Mail, Shield, Lock, Save, RefreshCw, HardDrive, Database, FileText, BarChart3, Activity, AlertTriangle, TrendingUp, Users, Upload, Download, Clock, Zap, CheckCircle, AlertCircle, DollarSign, Gauge } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Schema otimizado para validação
const profileSchema = z.object({
  username: z.string().min(3, "Username deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirmação é obrigatória"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfileManagement() {
  const { toast } = useToast();
  
  // Hook otimizado com cache agressivo
  const {
    user,
    isLoading,
    updateProfile,
    changePassword,
    isUpdating,
    isChangingPassword,
    updateError,
    passwordError,
    refreshUser
  } = useOptimizedUser();

  // Query para dados de armazenamento
  const { data: storageStats, isLoading: isLoadingStorage } = useQuery({
    queryKey: ['/api/storage/stats'],
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Query para documentos do usuário
  const { data: userDocuments } = useQuery({
    queryKey: ['/api/documents-with-related'],
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  // Função para formatar bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Form otimizado para perfil
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
    },
  });

  // Form para alteração de senha
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Atualizar dados quando user carrega
  React.useEffect(() => {
    if (user) {
      profileForm.reset({
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user, profileForm]);

  // Submit otimizado do perfil
  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  // Submit da senha
  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      passwordForm.reset();
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao alterar senha",
        description: "Verifique sua senha atual e tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  const userInitials = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header da Página */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-2xl font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Gestão de Perfil
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Gerencie suas informações pessoais e configurações de segurança
                </p>
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                  <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                    {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </Badge>
                  <Badge variant="outline">
                    Conta Ativa
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Formulário de Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Atualize seus dados básicos de cadastro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input
                    id="username"
                    {...profileForm.register("username")}
                  />
                  {profileForm.formState.errors.username && (
                    <p className="text-sm text-red-600">{profileForm.formState.errors.username.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    {...profileForm.register("email")}
                  />
                  {profileForm.formState.errors.email && (
                    <p className="text-sm text-red-600">{profileForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Função</Label>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {user?.role === 'admin' ? 'Administrador do Sistema' : 'Usuário Padrão'}
                    </span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="w-full"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Formulário de Alteração de Senha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Segurança da Conta
              </CardTitle>
              <CardDescription>
                Altere sua senha para manter sua conta segura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register("currentPassword")}
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register("newPassword")}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register("confirmPassword")}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={isChangingPassword}
                  className="w-full"
                  variant="outline"
                >
                  {isChangingPassword ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Alterando...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Alterar Senha
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Monitoramento Avançado de Armazenamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monitoramento Avançado do Sistema
            </CardTitle>
            <CardDescription>
              Estatísticas detalhadas e métricas de performance dos bancos de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStorage ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando dados...</span>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Métricas Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <FileText className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-blue-600">
                      {userDocuments?.length || 0}
                    </p>
                    <p className="text-sm font-medium">Meus Documentos</p>
                  </div>

                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Database className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      {storageStats?.summary ? formatBytes(storageStats.summary.totalSystemSize) : '0 MB'}
                    </p>
                    <p className="text-sm font-medium">Armazenamento Total</p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Database className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-purple-600">
                      {storageStats?.postgresql ? formatBytes(storageStats.postgresql.totalSize) : '0 MB'}
                    </p>
                    <p className="text-sm font-medium">PostgreSQL</p>
                  </div>

                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <HardDrive className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                    <p className="text-2xl font-bold text-orange-600">
                      {storageStats?.supabase ? formatBytes(storageStats.supabase.totalSize) : '0 MB'}
                    </p>
                    <p className="text-sm font-medium">Supabase Storage</p>
                  </div>
                </div>

                {/* Alertas e Status de Saúde */}
                {storageStats?.summary?.alerts && storageStats.summary.alerts.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Alertas do Sistema</h4>
                    </div>
                    <div className="space-y-2">
                      {storageStats.summary.alerts.map((alert, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${
                            alert.level === 'critical' ? 'bg-red-500' : 
                            alert.level === 'warning' ? 'bg-yellow-500' : 
                            'bg-blue-500'
                          }`} />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{alert.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Performance PostgreSQL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Database className="h-5 w-5 text-purple-600" />
                      <h4 className="font-medium text-purple-800 dark:text-purple-200">Performance PostgreSQL</h4>
                      <div className="flex items-center gap-1 ml-auto">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-600">Saudável</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <p className="text-xl font-bold text-purple-600">
                          {storageStats?.postgresql?.performance?.activeConnections || 0}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Conexões Ativas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-purple-600">
                          {storageStats?.postgresql?.performance?.avgQueryTime || 0}ms
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Tempo Médio Query</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-purple-600">
                          {storageStats?.postgresql?.performance?.slowQueries || 0}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Queries Lentas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-purple-600">
                          {((storageStats?.postgresql?.performance?.cacheHitRatio || 0) * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Cache Hit Ratio</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <HardDrive className="h-5 w-5 text-orange-600" />
                      <h4 className="font-medium text-orange-800 dark:text-orange-200">Performance Supabase</h4>
                      <div className="flex items-center gap-1 ml-auto">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-600">Saudável</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <p className="text-xl font-bold text-orange-600">
                          {storageStats?.supabase?.performance?.avgUploadTime?.toFixed(1) || 0}s
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Tempo Upload</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-orange-600">
                          {storageStats?.supabase?.performance?.avgDownloadTime?.toFixed(1) || 0}s
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Tempo Download</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-orange-600">
                          {((storageStats?.supabase?.performance?.errorRate || 0) * 100).toFixed(2)}%
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Taxa de Erro</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-orange-600">
                          {formatBytes(storageStats?.supabase?.performance?.bandwidth?.download || 0)}/s
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Bandwidth</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytics e Métricas Avançadas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">Crescimento</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Diário</span>
                        <span className="text-sm font-medium">
                          {formatBytes(storageStats?.summary?.dailyGrowth || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Mensal</span>
                        <span className="text-sm font-medium">
                          {formatBytes(storageStats?.summary?.monthlyGrowth || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium text-green-800 dark:text-green-200">Atividade</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Usuários Ativos</span>
                        <span className="text-sm font-medium">
                          {storageStats?.analytics?.userActivity?.activeUsers || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Uploads Hoje</span>
                        <span className="text-sm font-medium">
                          {storageStats?.analytics?.userActivity?.uploadsToday || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Custo</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="text-center">
                        <p className="text-xl font-bold text-yellow-600">
                          ${(storageStats?.summary?.costEstimate || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Estimativa Mensal</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top 5 Tipos de Arquivo */}
                {storageStats?.analytics?.topFileTypes && storageStats.analytics.topFileTypes.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Top 5 Tipos de Arquivo</h4>
                    <div className="space-y-2">
                      {storageStats.analytics.topFileTypes.map((type, index) => (
                        <div key={type.type} className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{type.type}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {type.count} arquivos
                            </span>
                            <span className="text-sm font-medium">
                              {formatBytes(type.size)}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({type.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Distribuição por Buckets */}
                {storageStats?.supabase?.buckets && storageStats.supabase.buckets.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Distribuição por Bucket
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {storageStats.supabase.buckets.map((bucket, index) => (
                        <div key={bucket.name} className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                          <p className="text-sm font-medium capitalize">{bucket.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {bucket.fileCount} arquivos
                          </p>
                          <p className="text-xs font-medium">
                            {formatBytes(bucket.size)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informações de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Mail className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <p className="text-sm font-medium">E-mail Verificado</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Sua conta está protegida
                </p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Lock className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="text-sm font-medium">Senha Segura</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Última alteração recente
                </p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Shield className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <p className="text-sm font-medium">Acesso Controlado</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Sessões monitoradas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}