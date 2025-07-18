// Service Layer - Lógica de negócio para metadados
import { DocumentMetadata } from './DocumentService';

export interface MetadataSection {
  title: string;
  icon: string;
  color: string;
  fields: MetadataField[];
}

export interface MetadataField {
  label: string;
  value: string | string[];
  type: 'text' | 'array' | 'date';
}

export class MetadataService {
  private static instance: MetadataService;

  static getInstance(): MetadataService {
    if (!MetadataService.instance) {
      MetadataService.instance = new MetadataService();
    }
    return MetadataService.instance;
  }

  organizeSections(metadata: DocumentMetadata): MetadataSection[] {
    return [
      {
        title: "Identificação do Documento",
        icon: "FileText",
        color: "blue",
        fields: [
          { label: "Título", value: metadata.title, type: "text" },
          { label: "Tipo de Documento", value: metadata.documentType, type: "text" },
          { label: "Código de Referência", value: metadata.referenceCode, type: "text" }
        ]
      },
      {
        title: "Origem e Responsabilidade",
        icon: "Building2",
        color: "green",
        fields: [
          { label: "Órgão Público", value: metadata.publicOrgan, type: "text" },
          { label: "Setor Responsável", value: metadata.responsibleSector, type: "text" },
          { label: "Responsável", value: metadata.responsible, type: "text" },
          { label: "Período", value: metadata.period, type: "text" }
        ]
      },
      {
        title: "Conteúdo e Classificação",
        icon: "Tag",
        color: "yellow",
        fields: [
          { label: "Assunto Principal", value: metadata.mainSubject, type: "text" },
          { label: "Nível de Confidencialidade", value: metadata.confidentialityLevel, type: "text" },
          { label: "Base Legal", value: metadata.legalBase, type: "text" },
          { label: "Processo Relacionado", value: metadata.relatedProcess, type: "text" },
          { label: "Descrição", value: metadata.description, type: "text" }
        ]
      },
      {
        title: "Informações Complementares",
        icon: "Info",
        color: "purple",
        fields: [
          { label: "Disponibilidade", value: metadata.availability, type: "text" },
          { label: "Idioma", value: metadata.language, type: "text" },
          { label: "Direitos", value: metadata.rights, type: "text" },
          { label: "Palavras-chave", value: metadata.tags, type: "array" }
        ]
      },
      {
        title: "Digitalização e Metadados Técnicos",
        icon: "HardDrive",
        color: "orange",
        fields: [
          { label: "Data de Digitalização", value: metadata.digitalizationDate, type: "date" },
          { label: "Local de Digitalização", value: metadata.digitalizationLocation, type: "text" },
          { label: "Responsável pela Digitalização", value: metadata.digitalizationResponsible, type: "text" },
          { label: "Autoridade do Documento", value: metadata.documentAuthority, type: "text" },
          { label: "Hash de Verificação", value: metadata.verificationHash, type: "text" }
        ]
      },
      {
        title: "Fotos Anexadas",
        icon: "ImageIcon",
        color: "purple",
        fields: [] // Será preenchido com componente especializado
      }
    ];
  }

  getColorClasses(color: string) {
    const colorMap = {
      blue: {
        bg: "from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20",
        text: "text-blue-700 dark:text-blue-300",
        icon: "text-blue-600 dark:text-blue-400"
      },
      green: {
        bg: "from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20",
        text: "text-green-700 dark:text-green-300",
        icon: "text-green-600 dark:text-green-400"
      },
      yellow: {
        bg: "from-yellow-50/50 to-amber-50/50 dark:from-yellow-900/20 dark:to-amber-900/20",
        text: "text-yellow-700 dark:text-yellow-300",
        icon: "text-yellow-600 dark:text-yellow-400"
      },
      purple: {
        bg: "from-purple-50/50 to-violet-50/50 dark:from-purple-900/20 dark:to-violet-900/20",
        text: "text-purple-700 dark:text-purple-300",
        icon: "text-purple-600 dark:text-purple-400"
      },
      orange: {
        bg: "from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20",
        text: "text-orange-700 dark:text-orange-300",
        icon: "text-orange-600 dark:text-orange-400"
      }
    };

    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  }
}