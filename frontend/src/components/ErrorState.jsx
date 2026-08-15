import React from 'react';
import { AlertTriangle, RotateCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this view.',
  onRetry,
  showHomeBtn = true,
  className = '',
}) => {
  return (
    <div className={`bg-rose-500/10 border border-rose-500/20 rounded-xl p-8 text-center space-y-4 max-w-lg mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">{message}</p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-md shadow-rose-600/20"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}

        {showHomeBtn && (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-dark-surface border border-dark-border hover:bg-dark-hover text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
