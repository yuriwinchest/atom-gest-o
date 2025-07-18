// Component - Botão de ação individual
import { DocumentAction } from '@/services/ActionService';
import { ActionService } from '@/services/ActionService';
import { 
  Download, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Paperclip, 
  HelpCircle 
} from 'lucide-react';

interface ActionButtonProps {
  action: DocumentAction;
  size?: 'sm' | 'md' | 'lg';
}

const iconMap = {
  Download,
  ExternalLink,
  Edit,
  Trash2,
  Paperclip,
  HelpCircle
};

export function ActionButton({ action, size = 'md' }: ActionButtonProps) {
  const actionService = ActionService.getInstance();
  const colorClasses = actionService.getActionColorClasses(action.color);
  const IconComponent = iconMap[action.icon as keyof typeof iconMap] || HelpCircle;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <button
      onClick={action.onClick}
      disabled={action.disabled}
      className={`
        inline-flex items-center justify-center space-x-2 
        ${sizeClasses[size]}
        ${colorClasses}
        text-white font-semibold rounded-xl
        shadow-lg hover:shadow-xl 
        transform hover:scale-105 active:scale-95
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        min-w-0 flex-1
      `}
    >
      <IconComponent className={iconSizes[size]} />
      <span className="truncate">{action.label}</span>
    </button>
  );
}