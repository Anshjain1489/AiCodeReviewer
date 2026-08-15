import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Drawer = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm transition-opacity animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-2xl bg-dark-surface border-l border-dark-border shadow-2xl flex flex-col transform transition-transform animate-slideUp">
          <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border bg-dark-bg/60">
            <h2 id="drawer-title" className="text-base font-bold text-white tracking-tight font-sans">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close drawer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drawer;
