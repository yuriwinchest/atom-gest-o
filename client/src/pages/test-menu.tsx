import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function TestMenu() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Menu de Testes</h1>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Páginas de Debug</h2>
        
        <div className="space-y-4">
          <Link href="/test-form-debug">
            <Button variant="destructive" className="w-full">
              🧪 Teste de Formulário com Debug
            </Button>
          </Link>
          
          <Link href="/gestao-documentos">
            <Button variant="outline" className="w-full">
              📄 Gestão de Documentos
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="secondary" className="w-full">
              🏠 Página Inicial
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}