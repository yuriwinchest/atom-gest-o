import React, { useState, useEffect } from 'react';

interface PDFViewerSimpleProps {
  base64Data: string;
  fileName: string;
}

export default function PDFViewerSimple({ base64Data, fileName }: PDFViewerSimpleProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    // Seguindo exatamente o documento de referência
    try {
      // 1. Converter base64 para bytes
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      
      // 2. Criar Blob com tipo correto
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // 3. Criar URL do blob
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      
      console.log('✅ PDF URL criada:', url);
      console.log('✅ Blob size:', blob.size, 'bytes');
      
    } catch (error) {
      console.error('❌ Erro ao criar PDF URL:', error);
    }
    
    // 4. Cleanup (como no documento de referência)
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        console.log('🧹 URL.revokeObjectURL executado');
      }
    };
  }, [base64Data]);

  if (!pdfUrl) {
    return <div>Carregando PDF...</div>;
  }

  // 5. Usar iframe nativo (como recomendado no documento)
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <iframe
        src={pdfUrl}
        title={fileName}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      />
    </div>
  );
}