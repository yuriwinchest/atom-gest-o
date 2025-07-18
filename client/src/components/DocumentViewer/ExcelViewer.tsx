// Single Responsibility Principle (SRP) - Component responsável APENAS por renderizar Excel
import { memo, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { IDocumentRenderer } from '@/interfaces/IDocumentViewer';
import { ExcelViewerService } from '@/services/viewers/ExcelViewerService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface ExcelViewerProps {
  documentUrl: string;
  fileName: string;
  onError?: (error: string) => void;
}

interface WorksheetData {
  name: string;
  data: any[][];
  range: string;
}

// Dependency Inversion Principle (DIP) - Component depende de abstrações
export const ExcelViewer = memo(function ExcelViewer({ 
  documentUrl, 
  fileName, 
  onError 
}: ExcelViewerProps) {
  const [loadingState, setLoadingState] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [worksheets, setWorksheets] = useState<WorksheetData[]>([]);
  const [activeSheet, setActiveSheet] = useState<number>(0);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  
  const excelService = ExcelViewerService.getInstance();
  const config = excelService.getViewerConfig();

  // Interface Segregation Principle (ISP) - Processamento específico para Excel
  const processExcelFile = async (file: ArrayBuffer) => {
    try {
      console.log('🎯 [ExcelViewer] Processando arquivo Excel...');
      const wb = XLSX.read(file, { type: 'array' });
      setWorkbook(wb);
      
      const sheets: WorksheetData[] = wb.SheetNames.map((name) => {
        const ws = wb.Sheets[name];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        const range = ws['!ref'] || 'A1';
        
        return {
          name,
          data: data as any[][],
          range
        };
      });
      
      setWorksheets(sheets);
      setActiveSheet(0);
      setLoadingState('success');
      console.log('✅ [ExcelViewer] Excel processado com sucesso:', sheets.length, 'planilhas');
    } catch (error) {
      console.error('❌ [ExcelViewer] Erro ao processar Excel:', error);
      setErrorMessage('Erro ao processar arquivo Excel. Verifique se o arquivo não está corrompido.');
      setLoadingState('error');
      onError?.(error instanceof Error ? error.message : 'Erro ao processar Excel');
    }
  };

  useEffect(() => {
    // Liskov Substitution Principle (LSP) - Comportamento previsível
    const loadExcelFile = async () => {
      try {
        console.log('🎯 [ExcelViewer] Carregando arquivo Excel:', documentUrl);
        const response = await fetch(documentUrl);
        
        if (!response.ok) {
          throw new Error(`Arquivo não encontrado: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        await processExcelFile(arrayBuffer);
        
      } catch (error) {
        console.error('❌ [ExcelViewer] Erro ao carregar arquivo Excel:', error);
        setErrorMessage(config.fallbackStrategy.errorMessage);
        setLoadingState('error');
        onError?.(error instanceof Error ? error.message : 'Erro desconhecido');
      }
    };

    loadExcelFile();
  }, [documentUrl, config.fallbackStrategy.errorMessage, onError]);

  // Open/Closed Principle (OCP) - Renderização extensível baseada no estado
  const renderContent = () => {
    switch (loadingState) {
      case 'loading':
        return (
          <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando planilha Excel...</p>
            </div>
          </div>
        );
        
      case 'error':
        return (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Erro ao Carregar Excel
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  {errorMessage}
                </p>
                <div className="flex space-x-3">
                  <a
                    href={documentUrl}
                    download={fileName}
                    className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Arquivo
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'success':
        // Interface Segregation Principle (ISP) - Renderização real da planilha
        const currentSheet = worksheets[activeSheet];
        
        if (!currentSheet || !currentSheet.data || currentSheet.data.length === 0) {
          return (
            <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Planilha vazia ou sem dados</p>
              </div>
            </div>
          );
        }

        return (
          <div className="w-full h-[85vh] flex flex-col bg-white dark:bg-gray-900 rounded-lg border">
            {/* Header com informações da planilha */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{fileName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {worksheets.length} planilha{worksheets.length !== 1 ? 's' : ''} • 
                    {currentSheet.data.length} linha{currentSheet.data.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Abas das planilhas */}
            {worksheets.length > 1 && (
              <div className="border-b border-gray-200 dark:border-gray-700 p-2">
                <div className="flex space-x-1 overflow-x-auto">
                  {worksheets.map((sheet, index) => (
                    <Button
                      key={index}
                      variant={activeSheet === index ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveSheet(index)}
                      className="whitespace-nowrap"
                    >
                      {sheet.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Conteúdo da planilha */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 dark:border-gray-700">
                      <tbody>
                        {currentSheet.data.map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}>
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate"
                                title={String(cell)}
                              >
                                {String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {renderContent()}
    </div>
  );
});

export default ExcelViewer;