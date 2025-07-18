// Main Component - Orquestrador de metadados
import { useMetadata } from '@/hooks/useMetadata';
import { MetadataContainer } from './MetadataContainer';
import { MetadataSection } from './MetadataSection';
import { PhotoDisplay } from '../Photos/PhotoDisplay';

interface MetadataDisplayProps {
  documentContent: string;
}

export function MetadataDisplay({ documentContent }: MetadataDisplayProps) {
  const {
    sections,
    isExpanded,
    toggleExpanded,
    hasMetadata
  } = useMetadata({ documentContent });

  if (!hasMetadata) {
    return null;
  }

  return (
    <MetadataContainer 
      isExpanded={isExpanded} 
      onToggle={toggleExpanded}
    >
      {sections.map((section, index) => (
        <MetadataSection 
          key={index} 
          section={section} 
        />
      ))}
      {/* Seção especializada para fotos */}
      <PhotoDisplay documentContent={documentContent} />
    </MetadataContainer>
  );
}

export default MetadataDisplay;