import React from 'react';
import { FolderGit2 } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FolderGit2,
  title = 'No Data Available',
  description = 'There are currently no items to display.',
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  className = '',
}) => {
  return (
    <div className={`bg-dark-surface/60 border border-dark-border rounded-xl p-10 text-center space-y-4 max-w-lg mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">{description}</p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20"
          >
            {ActionIcon && <ActionIcon className="w-4 h-4" />}
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
