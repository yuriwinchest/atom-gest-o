import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function TestFormDebug() {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    documentType: '',
    publicOrgan: '',
    responsibleSector: '',
    mainSubject: '',
    confidentialityLevel: ''
  });

  const [newItems, setNewItems] = useState({
    documentType: '',
    publicOrgan: '',
    responsibleSector: '',
    mainSubject: '',
    confidentialityLevel: ''
  });
  
  const [editMode, setEditMode] = useState({
    documentType: false,
    publicOrgan: false,
    responsibleSector: false,
    mainSubject: false,
    confidentialityLevel: false
  });

  const queryClient = useQueryClient();

  // Debug log function
  const debugLog = (section: string, message: string, data?: any) => {
    console.log(`🔍 [${section}] ${message}`, data || '');
  };

  // Fetch functions for each field
  const { data: documentTypes = [] } = useQuery({
    queryKey: ['/api/document-types'],
    queryFn: async () => {
      debugLog('FETCH', 'Buscando tipos de documento...');
      const res = await fetch('/api/document-types');
      const data = await res.json();
      debugLog('FETCH', 'Tipos recebidos:', data);
      return data;
    }
  });

  const { data: publicOrgans = [] } = useQuery({
    queryKey: ['/api/public-organs'],
    queryFn: async () => {
      debugLog('FETCH', 'Buscando órgãos públicos...');
      const res = await fetch('/api/public-organs');
      const data = await res.json();
      debugLog('FETCH', 'Órgãos recebidos:', data);
      return data;
    }
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ['/api/responsible-sectors'],
    queryFn: async () => {
      debugLog('FETCH', 'Buscando setores...');
      const res = await fetch('/api/responsible-sectors');
      const data = await res.json();
      debugLog('FETCH', 'Setores recebidos:', data);
      return data;
    }
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['/api/main-subjects'],
    queryFn: async () => {
      debugLog('FETCH', 'Buscando assuntos...');
      const res = await fetch('/api/main-subjects');
      const data = await res.json();
      debugLog('FETCH', 'Assuntos recebidos:', data);
      return data;
    }
  });

  const { data: confidentiality = [] } = useQuery({
    queryKey: ['/api/confidentiality-levels'],
    queryFn: async () => {
      debugLog('FETCH', 'Buscando níveis de confidencialidade...');
      const res = await fetch('/api/confidentiality-levels');
      const data = await res.json();
      debugLog('FETCH', 'Níveis recebidos:', data);
      return data;
    }
  });

  // Create mutation for each field
  const createDocumentType = useMutation({
    mutationFn: async (name: string) => {
      debugLog('CREATE', 'Iniciando criação de tipo de documento:', name);
      const payload = { name };
      debugLog('CREATE', 'Payload:', payload);
      
      const response = await fetch('/api/document-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      
      const text = await response.text();
      debugLog('CREATE', `Response status: ${response.status}`);
      debugLog('CREATE', 'Response text:', text);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${text}`);
      }
      
      return JSON.parse(text);
    },
    onSuccess: (data) => {
      debugLog('SUCCESS', 'Tipo criado com sucesso:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/document-types'] });
      setNewItems(prev => ({ ...prev, documentType: '' }));
      setFormData(prev => ({ ...prev, documentType: data.name }));
      setEditMode(prev => ({ ...prev, documentType: false }));
    },
    onError: (error) => {
      debugLog('ERROR', 'Erro ao criar tipo:', error);
      alert(`Erro: ${error.message}`);
    }
  });

  const createPublicOrgan = useMutation({
    mutationFn: async (name: string) => {
      debugLog('CREATE', 'Iniciando criação de órgão público:', name);
      const payload = { name };
      debugLog('CREATE', 'Payload:', payload);
      
      const response = await fetch('/api/public-organs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      
      const text = await response.text();
      debugLog('CREATE', `Response status: ${response.status}`);
      debugLog('CREATE', 'Response text:', text);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${text}`);
      }
      
      return JSON.parse(text);
    },
    onSuccess: (data) => {
      debugLog('SUCCESS', 'Órgão criado com sucesso:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/public-organs'] });
      setNewItems(prev => ({ ...prev, publicOrgan: '' }));
      setFormData(prev => ({ ...prev, publicOrgan: data.name }));
      setEditMode(prev => ({ ...prev, publicOrgan: false }));
    },
    onError: (error) => {
      debugLog('ERROR', 'Erro ao criar órgão:', error);
      alert(`Erro: ${error.message}`);
    }
  });

  const createSector = useMutation({
    mutationFn: async (name: string) => {
      debugLog('CREATE', 'Iniciando criação de setor:', name);
      const payload = { name };
      debugLog('CREATE', 'Payload:', payload);
      
      const response = await fetch('/api/responsible-sectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      
      const text = await response.text();
      debugLog('CREATE', `Response status: ${response.status}`);
      debugLog('CREATE', 'Response text:', text);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${text}`);
      }
      
      return JSON.parse(text);
    },
    onSuccess: (data) => {
      debugLog('SUCCESS', 'Setor criado com sucesso:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/responsible-sectors'] });
      setNewItems(prev => ({ ...prev, responsibleSector: '' }));
      setFormData(prev => ({ ...prev, responsibleSector: data.name }));
      setEditMode(prev => ({ ...prev, responsibleSector: false }));
    },
    onError: (error) => {
      debugLog('ERROR', 'Erro ao criar setor:', error);
      alert(`Erro: ${error.message}`);
    }
  });

  const createSubject = useMutation({
    mutationFn: async (name: string) => {
      debugLog('CREATE', 'Iniciando criação de assunto:', name);
      const payload = { name };
      debugLog('CREATE', 'Payload:', payload);
      
      const response = await fetch('/api/main-subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      
      const text = await response.text();
      debugLog('CREATE', `Response status: ${response.status}`);
      debugLog('CREATE', 'Response text:', text);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${text}`);
      }
      
      return JSON.parse(text);
    },
    onSuccess: (data) => {
      debugLog('SUCCESS', 'Assunto criado com sucesso:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/main-subjects'] });
      setNewItems(prev => ({ ...prev, mainSubject: '' }));
      setFormData(prev => ({ ...prev, mainSubject: data.name }));
      setEditMode(prev => ({ ...prev, mainSubject: false }));
    },
    onError: (error) => {
      debugLog('ERROR', 'Erro ao criar assunto:', error);
      alert(`Erro: ${error.message}`);
    }
  });

  const createConfidentiality = useMutation({
    mutationFn: async (name: string) => {
      debugLog('CREATE', 'Iniciando criação de nível de confidencialidade:', name);
      const payload = { name };
      debugLog('CREATE', 'Payload:', payload);
      
      const response = await fetch('/api/confidentiality-levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      
      const text = await response.text();
      debugLog('CREATE', `Response status: ${response.status}`);
      debugLog('CREATE', 'Response text:', text);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${text}`);
      }
      
      return JSON.parse(text);
    },
    onSuccess: (data) => {
      debugLog('SUCCESS', 'Nível criado com sucesso:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/confidentiality-levels'] });
      setNewItems(prev => ({ ...prev, confidentialityLevel: '' }));
      setFormData(prev => ({ ...prev, confidentialityLevel: data.name }));
      setEditMode(prev => ({ ...prev, confidentialityLevel: false }));
    },
    onError: (error) => {
      debugLog('ERROR', 'Erro ao criar nível:', error);
      alert(`Erro: ${error.message}`);
    }
  });

  const handleSubmit = () => {
    debugLog('SUBMIT', 'Dados do formulário:', formData);
    alert('Verifique o console para ver os dados do formulário!');
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🧪 Página de Teste - Debug do Formulário</h1>
      
      {/* Aviso de autenticação */}
      {!isAuthenticated && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="font-bold text-red-800">ATENÇÃO: Você precisa estar logado!</h3>
            <p className="text-red-700">Faça login com admin@empresa.com / admin123 para criar novas categorias.</p>
          </div>
        </div>
      )}
      
      {/* Botão de teste direto */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded">
        <h2 className="font-bold mb-2">🔧 TESTE DIRETO DA API</h2>
        <Button
          onClick={async () => {
            console.log('🚀 TESTE DIRETO: Criando tipo via API...');
            try {
              const response = await fetch('/api/document-types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ name: 'TESTE DIRETO ' + new Date().toLocaleTimeString() })
              });
              const text = await response.text();
              console.log('📥 Resposta:', response.status, text);
              if (response.ok) {
                alert('✅ SUCESSO! Verifique o console!');
                queryClient.invalidateQueries({ queryKey: ['/api/document-types'] });
              } else {
                alert('❌ ERRO: ' + text);
              }
            } catch (error) {
              console.error('💥 Erro:', error);
              alert('💥 Erro: ' + error.message);
            }
          }}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          🚨 TESTAR API DIRETAMENTE
        </Button>
      </div>
      
      <Card className="p-6">
        <div className="space-y-6">
          {/* Tipo de Documento */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Documento *</label>
            <div className="flex gap-2">
              {editMode.documentType ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    placeholder="Digite ou cole o novo tipo..."
                    value={newItems.documentType}
                    onChange={(e) => {
                      debugLog('INPUT', 'Digitando novo tipo:', e.target.value);
                      setNewItems(prev => ({ ...prev, documentType: e.target.value }));
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newItems.documentType.trim()) {
                        createDocumentType.mutate(newItems.documentType.trim());
                      }
                    }}
                    autoFocus
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newItems.documentType.trim()) {
                        debugLog('SAVE', 'Salvando tipo:', newItems.documentType);
                        createDocumentType.mutate(newItems.documentType.trim());
                      }
                      setEditMode(prev => ({ ...prev, documentType: false }));
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditMode(prev => ({ ...prev, documentType: false }));
                      setNewItems(prev => ({ ...prev, documentType: '' }));
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <>
                  <Select 
                    value={formData.documentType} 
                    onValueChange={(value) => {
                      debugLog('SELECT', 'Tipo de documento selecionado:', value);
                      setFormData(prev => ({ ...prev, documentType: value }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type: any) => (
                        <SelectItem key={type.id} value={type.name}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      debugLog('BUTTON', 'Ativando modo edição para tipo');
                      setEditMode(prev => ({ ...prev, documentType: true }));
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Órgão Público */}
          <div>
            <label className="text-sm font-medium mb-2 block">Órgão Público *</label>
            <div className="flex gap-2">
              {editMode.publicOrgan ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    placeholder="Digite ou cole o novo órgão..."
                    value={newItems.publicOrgan}
                    onChange={(e) => {
                      debugLog('INPUT', 'Digitando novo órgão:', e.target.value);
                      setNewItems(prev => ({ ...prev, publicOrgan: e.target.value }));
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newItems.publicOrgan.trim()) {
                        createPublicOrgan.mutate(newItems.publicOrgan.trim());
                      }
                    }}
                    autoFocus
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newItems.publicOrgan.trim()) {
                        debugLog('SAVE', 'Salvando órgão:', newItems.publicOrgan);
                        createPublicOrgan.mutate(newItems.publicOrgan.trim());
                      }
                      setEditMode(prev => ({ ...prev, publicOrgan: false }));
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditMode(prev => ({ ...prev, publicOrgan: false }));
                      setNewItems(prev => ({ ...prev, publicOrgan: '' }));
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <>
                  <Select 
                    value={formData.publicOrgan} 
                    onValueChange={(value) => {
                      debugLog('SELECT', 'Órgão público selecionado:', value);
                      setFormData(prev => ({ ...prev, publicOrgan: value }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um órgão..." />
                    </SelectTrigger>
                    <SelectContent>
                      {publicOrgans.map((organ: any) => (
                        <SelectItem key={organ.id} value={organ.name}>
                          {organ.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      debugLog('BUTTON', 'Ativando modo edição para órgão');
                      setEditMode(prev => ({ ...prev, publicOrgan: true }));
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </>
              )}

            </div>
          </div>

          {/* Setor Responsável */}
          <div>
            <label className="text-sm font-medium mb-2 block">Setor Responsável *</label>
            <div className="flex gap-2">
              {editMode.responsibleSector ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    placeholder="Digite ou cole o novo setor..."
                    value={newItems.responsibleSector}
                    onChange={(e) => {
                      debugLog('INPUT', 'Digitando novo setor:', e.target.value);
                      setNewItems(prev => ({ ...prev, responsibleSector: e.target.value }));
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newItems.responsibleSector.trim()) {
                        createSector.mutate(newItems.responsibleSector.trim());
                      }
                    }}
                    autoFocus
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newItems.responsibleSector.trim()) {
                        debugLog('SAVE', 'Salvando setor:', newItems.responsibleSector);
                        createSector.mutate(newItems.responsibleSector.trim());
                      }
                      setEditMode(prev => ({ ...prev, responsibleSector: false }));
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditMode(prev => ({ ...prev, responsibleSector: false }));
                      setNewItems(prev => ({ ...prev, responsibleSector: '' }));
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <>
                  <Select 
                    value={formData.responsibleSector} 
                    onValueChange={(value) => {
                      debugLog('SELECT', 'Setor responsável selecionado:', value);
                      setFormData(prev => ({ ...prev, responsibleSector: value }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um setor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((sector: any) => (
                        <SelectItem key={sector.id} value={sector.name}>
                          {sector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      debugLog('BUTTON', 'Ativando modo edição para setor');
                      setEditMode(prev => ({ ...prev, responsibleSector: true }));
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Assunto Principal */}
          <div>
            <label className="text-sm font-medium mb-2 block">Assunto Principal *</label>
            <div className="flex gap-2">
              {editMode.mainSubject ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    placeholder="Digite ou cole o novo assunto..."
                    value={newItems.mainSubject}
                    onChange={(e) => {
                      debugLog('INPUT', 'Digitando novo assunto:', e.target.value);
                      setNewItems(prev => ({ ...prev, mainSubject: e.target.value }));
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newItems.mainSubject.trim()) {
                        createSubject.mutate(newItems.mainSubject.trim());
                      }
                    }}
                    autoFocus
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newItems.mainSubject.trim()) {
                        debugLog('SAVE', 'Salvando assunto:', newItems.mainSubject);
                        createSubject.mutate(newItems.mainSubject.trim());
                      }
                      setEditMode(prev => ({ ...prev, mainSubject: false }));
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditMode(prev => ({ ...prev, mainSubject: false }));
                      setNewItems(prev => ({ ...prev, mainSubject: '' }));
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <>
                  <Select 
                    value={formData.mainSubject} 
                    onValueChange={(value) => {
                      debugLog('SELECT', 'Assunto principal selecionado:', value);
                      setFormData(prev => ({ ...prev, mainSubject: value }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um assunto..." />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      debugLog('BUTTON', 'Ativando modo edição para assunto');
                      setEditMode(prev => ({ ...prev, mainSubject: true }));
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Nível de Confidencialidade */}
          <div>
            <label className="text-sm font-medium mb-2 block">Nível de Confidencialidade</label>
            <div className="flex gap-2">
              {editMode.confidentialityLevel ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    placeholder="Digite ou cole o novo nível..."
                    value={newItems.confidentialityLevel}
                    onChange={(e) => {
                      debugLog('INPUT', 'Digitando novo nível:', e.target.value);
                      setNewItems(prev => ({ ...prev, confidentialityLevel: e.target.value }));
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newItems.confidentialityLevel.trim()) {
                        createConfidentiality.mutate(newItems.confidentialityLevel.trim());
                      }
                    }}
                    autoFocus
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newItems.confidentialityLevel.trim()) {
                        debugLog('SAVE', 'Salvando nível:', newItems.confidentialityLevel);
                        createConfidentiality.mutate(newItems.confidentialityLevel.trim());
                      }
                      setEditMode(prev => ({ ...prev, confidentialityLevel: false }));
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditMode(prev => ({ ...prev, confidentialityLevel: false }));
                      setNewItems(prev => ({ ...prev, confidentialityLevel: '' }));
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <>
                  <Select 
                    value={formData.confidentialityLevel} 
                    onValueChange={(value) => {
                      debugLog('SELECT', 'Nível de confidencialidade selecionado:', value);
                      setFormData(prev => ({ ...prev, confidentialityLevel: value }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um nível..." />
                    </SelectTrigger>
                    <SelectContent>
                      {confidentiality.map((level: any) => (
                        <SelectItem key={level.id} value={level.name}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      debugLog('BUTTON', 'Ativando modo edição para nível');
                      setEditMode(prev => ({ ...prev, confidentialityLevel: true }));
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="pt-6 border-t">
            <Button onClick={handleSubmit} className="w-full">
              Testar Formulário (Ver Console)
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">📋 Instruções de Debug:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Abra o Console do navegador (F12)</li>
          <li>Tente criar uma nova categoria em qualquer campo</li>
          <li>Observe os logs no console para cada ação</li>
          <li>Todos os logs começam com 🔍 e mostram a etapa do processo</li>
        </ol>
      </div>
    </div>
  );
}