// Service Layer - Lógica de negócio para ações de documentos
export interface DocumentAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
}

export class ActionService {
  private static instance: ActionService;

  static getInstance(): ActionService {
    if (!ActionService.instance) {
      ActionService.instance = new ActionService();
    }
    return ActionService.instance;
  }

  createDownloadAction(onDownload: () => void): DocumentAction {
    return {
      id: 'download',
      label: 'Baixar',
      icon: 'Download',
      color: 'green',
      onClick: onDownload
    };
  }

  createOpenInNewTabAction(documentId: number): DocumentAction {
    return {
      id: 'new-tab',
      label: 'Nova Aba',
      icon: 'ExternalLink',
      color: 'blue',
      onClick: () => {
        window.open(`/api/documents/${documentId}/view`, '_blank');
      }
    };
  }

  createEditAction(onEdit: () => void, disabled = false): DocumentAction {
    return {
      id: 'edit',
      label: 'Editar',
      icon: 'Edit',
      color: 'yellow',
      onClick: onEdit,
      disabled
    };
  }

  createDeleteAction(onDelete: () => void, disabled = false): DocumentAction {
    return {
      id: 'delete',
      label: 'Excluir',
      icon: 'Trash2',
      color: 'red',
      onClick: onDelete,
      disabled
    };
  }

  createAttachAction(onAttach: () => void, disabled = false): DocumentAction {
    return {
      id: 'attach',
      label: 'Anexar',
      icon: 'Paperclip',
      color: 'purple',
      onClick: onAttach,
      disabled
    };
  }

  createHelpAction(onHelp: () => void): DocumentAction {
    return {
      id: 'help',
      label: 'Ajuda',
      icon: 'HelpCircle',
      color: 'gray',
      onClick: onHelp
    };
  }

  getActionColorClasses(color: string) {
    const colorMap = {
      green: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
      blue: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      yellow: 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700',
      red: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      purple: 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700',
      gray: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
    };

    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  }
}