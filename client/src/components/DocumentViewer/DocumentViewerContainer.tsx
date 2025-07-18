// Container Component - Responsável APENAS pelo layout e estrutura
import { ReactNode } from 'react';

interface DocumentViewerContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function DocumentViewerContainer({ 
  children, 
  title = "Document Viewer", 
  subtitle 
}: DocumentViewerContainerProps) {
  return (
    <div 
      className="document-viewer-container w-full bg-white dark:bg-gray-800 rounded-lg"
      style={{ 
        minHeight: '90vh',
        position: 'relative'
      }}
    >
      {subtitle && (
        <div style={{ 
          color: '#0066cc', 
          fontSize: '12px', 
          padding: '8px 12px', 
          background: '#f0f8ff',
          borderBottom: '1px solid #e1e8ed',
          fontWeight: '500'
        }}>
          {subtitle}
        </div>
      )}
      
      <div
        className="document-viewer-content"
        style={{
          height: subtitle ? 'calc(90vh - 32px)' : '90vh',
          width: '100%',
          position: 'relative',
          overflow: 'visible'
        }}
      >
        {children}
      </div>
    </div>
  );
}