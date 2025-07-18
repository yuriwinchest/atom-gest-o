import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Download, FileSpreadsheet } from 'lucide-react';

interface ExcelViewerProps {
  documentId: number;
  fileName: string;
  onDownload?: () => void;
}

interface SheetData {
  name: string;
  data: any[][];
}

export default function ExcelViewer({ documentId, fileName, onDownload }: ExcelViewerProps) {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [currentSheet, setCurrentSheet] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExcelFile();
  }, [documentId]);

  const loadExcelFile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Iniciando carregamento Excel - ID:', documentId);

      // Buscar arquivo do servidor
      const response = await fetch(`/api/documents/${documentId}/view`);
      
      console.log('📊 Resposta Excel:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro Excel Response:', errorText);
        throw new Error(`Erro ao carregar arquivo Excel: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log('📊 ArrayBuffer recebido:', arrayBuffer.byteLength, 'bytes');
      
      // Parse com XLSX (suporta Excel, CSV, TSV)
      const workbook = XLSX.read(arrayBuffer, { 
        type: 'array',
        // Configuração especial para CSV
        FS: fileName.toLowerCase().includes('.csv') ? ',' : undefined,
        raw: false
      });
      console.log('📊 Planilhas encontradas:', workbook.SheetNames);
      
      const sheetsData: SheetData[] = workbook.SheetNames.map(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          raw: false
        }) as any[][];
        
        console.log(`📊 Aba "${sheetName}":`, data.length, 'linhas');
        
        return {
          name: sheetName,
          data: data
        };
      });

      setSheets(sheetsData);
      setCurrentSheet(0);
      console.log('✅ Excel/CSV carregado com sucesso!');
    } catch (err) {
      console.error('❌ Erro ao carregar Excel/CSV:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      
      // Mensagem específica para arquivo não encontrado  
      if (errorMessage.includes('404') || errorMessage.includes('não encontrado')) {
        setError('Arquivo Excel/CSV não encontrado. O documento pode ter sido corrompido durante o upload.');
      } else {
        setError(`Erro ao carregar planilha Excel/CSV: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando planilha Excel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] text-center">
        <div className="max-w-md">
          <div className="bg-yellow-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <FileSpreadsheet className="w-12 h-12 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Arquivo Não Encontrado</h3>
          <p className="text-gray-600 mb-6">
            Este arquivo Excel não está disponível no momento. Pode ter sido removido ou movido.
          </p>
          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Motivo:</strong> {error}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={() => window.open(`/api/documents/${documentId}/view`, '_blank')}>
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Abrir Foto
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentSheetData = sheets[currentSheet];

  return (
    <div className="h-[600px] flex flex-col">
      {/* Header com navegação de abas */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-gray-800">Planilha Excel</h3>
            <Badge variant="outline">{fileName}</Badge>
          </div>
        </div>

        {/* Navegação entre abas */}
        {sheets.length > 1 && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentSheet(Math.max(0, currentSheet - 1))}
              disabled={currentSheet === 0}
              size="sm"
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex gap-1">
              {sheets.map((sheet, index) => (
                <Button
                  key={index}
                  onClick={() => setCurrentSheet(index)}
                  size="sm"
                  variant={index === currentSheet ? "default" : "outline"}
                  className="text-xs"
                >
                  {sheet.name}
                </Button>
              ))}
            </div>

            <Button
              onClick={() => setCurrentSheet(Math.min(sheets.length - 1, currentSheet + 1))}
              disabled={currentSheet === sheets.length - 1}
              size="sm"
              variant="outline"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Conteúdo da planilha */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="p-4">
            {currentSheetData && currentSheetData.data.length > 0 ? (
              <div className="bg-white border rounded-lg overflow-auto max-h-[450px]">
                <div className="overflow-x-auto overflow-y-auto max-h-[450px]">
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      {currentSheetData.data.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-50 font-medium sticky top-0 z-10' : 'hover:bg-gray-50'}>
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className={`px-3 py-2 border border-gray-200 min-w-[120px] max-w-[250px] text-left whitespace-nowrap ${
                                rowIndex === 0 ? 'bg-gray-100 font-semibold' : ''
                              }`}
                              title={String(cell)}
                            >
                              <div className="truncate">
                                {String(cell)}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Planilha vazia ou sem dados
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer com informações */}
      <div className="p-3 bg-gray-50 border-t text-xs text-gray-600 flex justify-between">
        <span>
          Aba: {currentSheetData?.name} • 
          Linhas: {currentSheetData?.data.length || 0} • 
          Colunas: {currentSheetData?.data[0]?.length || 0}
        </span>
        <span>
          Aba {currentSheet + 1} de {sheets.length}
        </span>
      </div>
    </div>
  );
}