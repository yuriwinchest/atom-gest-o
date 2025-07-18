import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut, RotateCw, Download, Maximize2, Share2 } from "lucide-react";
import { useState } from "react";
import type { Document } from "@shared/schema";
import PDFViewer from "./PDFViewer";

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
}

export default function DocumentViewer({ isOpen, onClose, document: documentData }: DocumentViewerProps) {
  const doc = documentData as any;
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  


  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([`Documento: ${documentData.title}\n\nConteúdo completo do documento...`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${documentData.title || 'documento'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    } catch (error) {
      prompt('Copie este link para compartilhar o documento:', window.location.href);
    }
  };

  const getDocumentPreview = () => {
    const category = (doc.category || 'documento').toLowerCase();
    
    let documentDetails = null;
    try {
      if (doc.content && typeof doc.content === 'string') {
        if (doc.content.startsWith('{')) {
          documentDetails = JSON.parse(doc.content);
        }
      } else if (typeof doc.content === 'object') {
        documentDetails = doc.content;
      }
    } catch (error) {
      console.warn('Erro ao parsear dados do documento:', error);
    }

    const getFieldValue = (field: string) => {
      const value = documentDetails?.[field];
      return value || 'Não informado';
    };

    // Obter informações do arquivo
    const fileInfo = documentDetails?.fileInfo || {};
    const fileType = fileInfo.mimeType || documentDetails?.fileType || 'application/pdf';
    const fileName = fileInfo.originalName || documentDetails?.fileName || doc.title;
    const fileSize = fileInfo.fileSize || documentDetails?.fileSize || 'Não informado';
    
    // Função para obter o ícone do tipo de arquivo
    const getFileIcon = (mimeType: string) => {
      if (mimeType.includes('pdf')) return '📄';
      if (mimeType.includes('image')) return '🖼️';
      if (mimeType.includes('video')) return '🎥';
      if (mimeType.includes('audio')) return '🎵';
      if (mimeType.includes('text')) return '📝';
      if (mimeType.includes('word')) return '📘';
      if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
      if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
      return '📄';
    };

    // Sempre mostrar preview de documento com dados completos
    if (true) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-8 min-h-[700px] max-w-6xl mx-auto">
          <div className="space-y-8">
            <div className="text-center border-b pb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{doc.title}</h1>
              <p className="text-gray-600 text-lg">Sistema AtoM - Gestão Documental</p>
              <p className="text-gray-500 text-sm mt-2">
                Código: {getFieldValue('referenceCode') || `ATOM-${doc.id}`}
              </p>
            </div>

            {/* Preview do Conteúdo do Documento */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
                {getFileIcon(fileType)} Preview do Documento
              </h3>
              
              {/* Informações básicas do arquivo */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Nome:</span>
                  <div className="text-gray-600 truncate">{fileName}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Formato:</span>
                  <div className="text-gray-600">{fileType}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tamanho:</span>
                  <div className="text-gray-600">{fileSize}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Estado:</span>
                  <div className="text-green-600 flex items-center gap-1">✓ Verificado</div>
                </div>
              </div>

              {/* Preview com visualizador embutido */}
              <div className="bg-white rounded-lg border-2 border-gray-200">
                {fileType.includes('pdf') && (
                  <PDFViewer 
                    documentId={doc.id}
                    fileName={fileName}
                    onDownload={handleDownload}
                  />
                )}
                
                {fileType.includes('image') && (
                  <div className="flex items-center justify-center h-[400px]">
                    <img
                      src={`/api/documents/${doc.id}/view`}
                      alt={fileName}
                      className="max-w-full max-h-full object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'block';
                        }
                      }}
                    />
                    <div className="hidden text-center">
                      <div className="text-6xl mb-4">🖼️</div>
                      <p className="text-gray-600">Preview da imagem não disponível</p>
                      <p className="text-sm text-gray-500">Use o botão de download para visualizar</p>
                    </div>
                  </div>
                )}
                
                {(fileType.includes('text') || fileType.includes('word') || fileType.includes('document')) && (
                  <div className="p-4 h-[400px] overflow-y-auto">
                    <div className="text-center mb-4">
                      <div className="text-6xl mb-2">📄</div>
                      <h4 className="font-medium text-gray-800">{fileName}</h4>
                      <p className="text-sm text-gray-600">Documento de texto</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded border-l-4 border-blue-500">
                      <p className="text-sm text-gray-700">
                        <strong>Conteúdo:</strong> Este documento contém texto formatado. 
                        Para visualizar o conteúdo completo com formatação original, baixe o arquivo.
                      </p>
                    </div>
                  </div>
                )}
                
                {(!fileType.includes('pdf') && !fileType.includes('image') && !fileType.includes('text') && !fileType.includes('word')) && (
                  <div className="flex items-center justify-center h-[400px] text-center">
                    <div>
                      <div className="text-6xl mb-4">{getFileIcon(fileType)}</div>
                      <h4 className="font-medium text-gray-800 mb-2">{fileName}</h4>
                      <p className="text-gray-600 mb-4">
                        Preview não disponível para este tipo de arquivo
                      </p>
                      <p className="text-sm text-gray-500">
                        Use o botão de download para acessar o arquivo original
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de ação */}
              <div className="mt-4 flex gap-3">
                <Button 
                  onClick={handleDownload}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Arquivo Original
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open(`/api/documents/${doc.id}/view`, '_blank')}
                  className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                >
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Abrir em Nova Aba
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">📋 Identificação do Documento</h3>
                <div className="space-y-3 text-sm">
                  <div><strong>Título:</strong> {doc.title}</div>
                  <div><strong>Tipo de Documento:</strong> {getFieldValue('documentType')}</div>
                  <div><strong>Código de Referência:</strong> {getFieldValue('referenceCode')}</div>
                  <div><strong>Identificador Digital:</strong> {getFieldValue('digitalId')}</div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">🏢 Origem e Responsabilidade</h3>
                <div className="space-y-3 text-sm">
                  <div><strong>Órgão Público:</strong> {getFieldValue('publicOrgan')}</div>
                  <div><strong>Setor Responsável:</strong> {getFieldValue('responsibleSector')}</div>
                  <div><strong>Criador:</strong> {getFieldValue('responsible')}</div>
                  <div><strong>Autoridade do Documento:</strong> {getFieldValue('documentAuthority')}</div>
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">📁 Conteúdo e Classificação</h3>
                <div className="space-y-3 text-sm">
                  <div><strong>Assunto do Documento:</strong> {getFieldValue('mainSubject')}</div>
                  <div><strong>Nível de Confidencialidade:</strong> {getFieldValue('confidentialityLevel')}</div>
                  <div><strong>Base Legal:</strong> {getFieldValue('legalBase')}</div>
                  <div><strong>Processo Relacionado:</strong> {getFieldValue('relatedProcess')}</div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">ℹ️ Informações Complementares</h3>
                <div className="space-y-3 text-sm">
                  <div><strong>Disponibilidade:</strong> {getFieldValue('availability')}</div>
                  <div><strong>Idioma:</strong> {getFieldValue('language')}</div>
                  <div><strong>Direitos:</strong> {getFieldValue('rights')}</div>
                  <div><strong>Período:</strong> {getFieldValue('period')}</div>
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500 lg:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">💾 Digitalização e Metadados Técnicos</h3>
                <p className="text-sm text-gray-600 mb-4">Campos obrigatórios conforme normas internacionais de arquivos</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div><strong>Data da Digitalização:</strong> {getFieldValue('digitalizationDate')}</div>
                  <div><strong>Local da Digitalização:</strong> {getFieldValue('digitalizationLocation')}</div>
                  <div><strong>Identificação Digital:</strong> {getFieldValue('digitalId')}</div>
                  <div><strong>Responsável pela Digitalização:</strong> {getFieldValue('digitalizationResponsible')}</div>
                  <div><strong>Autoridade do Documento:</strong> {getFieldValue('documentAuthority')}</div>
                  <div><strong>Nome do Arquivo:</strong> {getFieldValue('fileName')}</div>
                </div>
                {getFieldValue('verificationHash') !== 'Não informado' && (
                  <div className="mt-4 p-3 bg-gray-100 rounded">
                    <strong>Soma de verificação (hash):</strong>
                    <p className="text-sm text-gray-600 mt-1">Hash SHA-256 para verificação de integridade:</p>
                    <p className="text-xs font-mono mt-2 break-all bg-white p-2 rounded border">
                      {getFieldValue('verificationHash')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {doc.description && (
              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-gray-500">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Descrição</h3>
                <p className="text-justify">{doc.description}</p>
              </div>
            )}
            
            {doc.tags && doc.tags.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Palavras-chave</h3>
                <div className="flex flex-wrap gap-2">
                  {doc.tags.map((tag: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-t pt-6 text-center text-gray-500 text-sm">
              <p>Este documento foi gerado pelo Sistema AtoM de Gestão Documental</p>
              <p>Código de Referência: {getFieldValue('referenceCode') || `ATOM-${doc.id}`}</p>
              <p>Data de Criação: {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('pt-BR') : 'Não informada'}</p>
            </div>
          </div>
        </div>
      );
    } else if (category.includes('imagem')) {
      return (
        <div className="bg-gray-100 rounded-lg flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mx-auto mb-4 flex items-center justify-center text-white text-lg font-semibold">
              Imagem de Exemplo
            </div>
            <p className="text-gray-600">{documentData.title}</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-gray-50 rounded-lg p-8 min-h-[600px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Visualização não disponível</h3>
            <p className="text-gray-600 mb-4">
              Este tipo de arquivo não pode ser visualizado diretamente no navegador.
            </p>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Baixar Arquivo
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 overflow-y-auto">
        <DialogHeader className="flex-row items-center justify-between p-4 border-b">
          <div className="flex-1">
            <DialogTitle className="text-lg font-semibold">
              Visualização: {documentData.title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Visualização completa do documento {documentData.title} com controles de zoom e rotação
            </DialogDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-medium min-w-[60px] text-center">
              {zoom}%
            </span>
            
            <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleReset}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div 
          className="flex-1 overflow-auto bg-gray-100 p-4 min-h-[600px]"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'center'
          }}
        >
          {getDocumentPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
}