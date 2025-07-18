import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, Clock, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface FormValidation {
  id: number;
  field_name: string;
  annotation: string;
  created_at: string;
  updated_at: string;
}

const fieldLabels: Record<string, string> = {
  title: 'Título do Documento',
  documentType: 'Tipo de Documento',
  referenceCode: 'Código de Referência',
  publicOrgan: 'Órgão Público',
  responsibleSector: 'Setor Responsável',
  responsible: 'Responsável/Autor',
  period: 'Período/Data',
  mainSubject: 'Assunto Principal',
  confidentialityLevel: 'Nível de Confidencialidade',
  legalBase: 'Base Legal',
  relatedProcess: 'Processo Relacionado',
  description: 'Descrição do Documento',
  availability: 'Disponibilidade',
  language: 'Idioma',
  rights: 'Direitos',
  tags: 'Palavras-chave',
  digitalizationDate: 'Data da Digitalização',
  digitalizationLocation: 'Local da Digitalização',
  digitalId: 'Identificador Digital',
  digitalizationResponsible: 'Responsável pela Digitalização',
  documentAuthority: 'Autoridade do Documento',
  verificationHash: 'Soma de verificação (hash)',
};

export default function ValidacaoAnotacoes() {
  const { data: validations = [], isLoading } = useQuery<FormValidation[]>({
    queryKey: ['/api/form-validations'],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Deletar anotação específica
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/form-validations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/form-validations'] });
      toast({
        title: "Sucesso",
        description: "Anotação deletada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível deletar a anotação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Deletar todas as anotações
  const deleteAllMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', '/api/form-validations'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/form-validations'] });
      toast({
        title: "Sucesso",
        description: "Todas as anotações foram deletadas com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível deletar as anotações. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteAnnotation = (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta anotação?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDeleteAllAnnotations = () => {
    if (confirm('Tem certeza que deseja deletar TODAS as anotações? Esta ação não pode ser desfeita.')) {
      deleteAllMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Carregando anotações...</p>
        </div>
      </div>
    );
  }

  const totalAnnotations = validations.length;
  const fieldsWithAnnotations = new Set(validations.map(v => v.field_name)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Anotações de Validação</h1>
            </div>
            {totalAnnotations > 0 && (
              <Button
                onClick={handleDeleteAllAnnotations}
                variant="destructive"
                size="sm"
                disabled={deleteAllMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar Todas
              </Button>
            )}
          </div>
          <p className="text-gray-600">
            Visualize todas as anotações coletadas durante a validação do formulário
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Anotações</p>
                  <p className="text-2xl font-bold text-blue-600">{totalAnnotations}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Campos com Anotações</p>
                  <p className="text-2xl font-bold text-green-600">{fieldsWithAnnotations}</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Campos Totais</p>
                  <p className="text-2xl font-bold text-purple-600">22</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Anotações */}
        {totalAnnotations === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma anotação encontrada
              </h3>
              <p className="text-gray-600">
                Acesse a página de validação para começar a coletar feedback
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {validations.map((validation) => (
              <Card key={validation.id} className="bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">
                        {fieldLabels[validation.field_name] || validation.field_name}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(validation.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </Badge>
                      <Button
                        onClick={() => handleDeleteAnnotation(validation.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {validation.annotation}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <span>Campo: {validation.field_name}</span>
                    <span>•</span>
                    <span>ID: {validation.id}</span>
                    {validation.updated_at !== validation.created_at && (
                      <>
                        <span>•</span>
                        <span>Editado</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}