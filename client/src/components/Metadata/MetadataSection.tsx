// Component - Seção individual de metadados
import { MetadataSection as MetadataSectionType, MetadataField } from '@/services/MetadataService';
import { MetadataService } from '@/services/MetadataService';
import { 
  FileText, 
  Building2, 
  Tag, 
  Info, 
  HardDrive,
  Image as ImageIcon
} from 'lucide-react';

interface MetadataSectionProps {
  section: MetadataSectionType;
}

const iconMap = {
  FileText,
  Building2,
  Tag,
  Info,
  HardDrive,
  ImageIcon
};

export function MetadataSection({ section }: MetadataSectionProps) {
  const metadataService = MetadataService.getInstance();
  const colors = metadataService.getColorClasses(section.color);
  const IconComponent = iconMap[section.icon as keyof typeof iconMap] || FileText;

  const renderFieldValue = (field: MetadataField) => {
    if (field.type === 'array' && Array.isArray(field.value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {field.value.map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      );
    }

    return (
      <span className="text-gray-800 dark:text-gray-200 font-medium break-words">
        {field.value as string}
      </span>
    );
  };

  return (
    <div className={`px-8 py-6 bg-gradient-to-r ${colors.bg} border-b border-gray-100/50 dark:border-gray-700/50 last:border-b-0`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-700/80 flex items-center justify-center`}>
          <IconComponent className={`h-4 w-4 ${colors.icon}`} />
        </div>
        <h4 className={`text-lg font-bold ${colors.text}`}>
          {section.title}
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {section.fields.map((field, index) => (
          <div key={index} className="space-y-1">
            <label className={`text-sm font-semibold ${colors.text} opacity-90`}>
              {field.label}
            </label>
            <div className="min-h-[1.5rem]">
              {renderFieldValue(field)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}