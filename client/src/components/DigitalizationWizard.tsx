import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  FileText, 
  Camera, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  AlertTriangle,
  Info,
  Target,
  Award
} from 'lucide-react';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tips: string[];
  requirements: string[];
}

const wizardSteps: WizardStep[] = [
  {
    id: 'preparation',
    title: 'Preparação do Documento',
    description: 'Configure o ambiente ideal para digitalização',
    icon: <FileText className="h-6 w-6" />,
    tips: [
      'Remova grampos, clipes e dobraduras',
      'Limpe a superfície do documento',
      'Verifique se há páginas danificadas'
    ],
    requirements: [
      'Documento físico original',
      'Ambiente bem iluminado',
      'Superfície plana e limpa'
    ]
  },
  {
    id: 'scanning',
    title: 'Processo de Digitalização',
    description: 'Capture o documento com qualidade profissional',
    icon: <Camera className="h-6 w-6" />,
    tips: [
      'Use resolução de 300 DPI ou superior',
      'Mantenha o documento alinhado',
      'Evite sombras e reflexos'
    ],
    requirements: [
      'Scanner ou câmera de alta qualidade',
      'Software de digitalização',
      'Espaço de armazenamento adequado'
    ]
  },
  {
    id: 'metadata',
    title: 'Preenchimento de Metadados',
    description: 'Adicione informações descritivas detalhadas',
    icon: <Target className="h-6 w-6" />,
    tips: [
      'Preencha todos os campos obrigatórios',
      'Use palavras-chave relevantes',
      'Verifique a precisão das informações'
    ],
    requirements: [
      'Informações sobre origem do documento',
      'Data e responsável pela digitalização',
      'Classificação de confidencialidade'
    ]
  },
  {
    id: 'validation',
    title: 'Validação e Armazenamento',
    description: 'Confirme a qualidade e finalize o processo',
    icon: <CheckCircle className="h-6 w-6" />,
    tips: [
      'Revise a qualidade da imagem',
      'Confirme todos os metadados',
      'Teste o download do arquivo'
    ],
    requirements: [
      'Verificação de qualidade aprovada',
      'Metadados completos',
      'Backup de segurança realizado'
    ]
  }
];

interface DigitalizationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

export default function DigitalizationWizard({ isOpen, onClose, onComplete }: DigitalizationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);


  const handleStepComplete = () => {
    const step = wizardSteps[currentStep];
    if (!completedSteps.includes(step.id)) {
      setCompletedSteps([...completedSteps, step.id]);
    }
    
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete({ completedSteps });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / wizardSteps.length) * 100;
  const step = wizardSteps[currentStep];
  const isStepCompleted = completedSteps.includes(step.id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">Assistente de Digitalização</h2>
                <p className="text-blue-100">Guia passo a passo para digitalização profissional</p>
              </div>
            </div>

          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso</span>
              <span>{currentStep + 1} de {wizardSteps.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isStepCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {isStepCompleted ? <CheckCircle className="h-6 w-6" /> : step.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Requirements */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Requisitos
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {step.requirements.map((req, index) => (
                        <Badge key={index} variant="outline" className="justify-start p-2">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-500" />
                      Dicas Importantes
                    </h4>
                    <ul className="space-y-2">
                      {step.tips.map((tip, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {tip}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Step-specific content */}
                  {currentStep === 1 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">Configurações Recomendadas</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Resolução:</strong> 300-600 DPI
                        </div>
                        <div>
                          <strong>Formato:</strong> PDF/A ou TIFF
                        </div>
                        <div>
                          <strong>Cores:</strong> 24-bit para coloridos
                        </div>
                        <div>
                          <strong>Compressão:</strong> Sem perdas
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-b-lg flex justify-between items-center">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onClose : handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? 'Fechar' : 'Anterior'}
          </Button>

          <div className="flex items-center gap-2">
            {wizardSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index <= currentStep 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleStepComplete}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {currentStep === wizardSteps.length - 1 ? 'Finalizar' : 'Próximo'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}