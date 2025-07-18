// Component - Grupo de ações
import { DocumentAction } from '@/services/ActionService';
import { ActionButton } from './ActionButton';

interface ActionGroupProps {
  actions: DocumentAction[];
  title?: string;
  layout?: 'horizontal' | 'grid';
  size?: 'sm' | 'md' | 'lg';
}

export function ActionGroup({ 
  actions, 
  title, 
  layout = 'grid',
  size = 'md' 
}: ActionGroupProps) {
  const layoutClasses = {
    horizontal: 'flex space-x-3',
    grid: 'grid grid-cols-2 gap-3'
  };

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      )}
      
      <div className={layoutClasses[layout]}>
        {actions.map((action) => (
          <ActionButton 
            key={action.id} 
            action={action} 
            size={size}
          />
        ))}
      </div>
    </div>
  );
}