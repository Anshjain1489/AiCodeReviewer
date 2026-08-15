import React from 'react';
import { AlertOctagon, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

const SeverityBadge = ({ severity = 'MEDIUM', className = '' }) => {
  const configs = {
    CRITICAL: {
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/30',
      glow: 'shadow-[0_0_10px_rgba(239,68,68,0.2)]',
      icon: AlertOctagon,
      label: 'CRITICAL',
    },
    HIGH: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      glow: 'shadow-[0_0_8px_rgba(249,115,22,0.15)]',
      icon: ShieldAlert,
      label: 'HIGH',
    },
    MEDIUM: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      glow: '',
      icon: AlertTriangle,
      label: 'MEDIUM',
    },
    LOW: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      glow: '',
      icon: Info,
      label: 'LOW',
    },
    INFO: {
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      border: 'border-slate-500/30',
      glow: '',
      icon: Info,
      label: 'INFO',
    },
  };

  const key = (severity || 'MEDIUM').toUpperCase();
  const config = configs[key] || configs.MEDIUM;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-md border ${config.bg} ${config.text} ${config.border} ${config.glow} ${className}`}
      aria-label={`Severity ${config.label}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};

export default SeverityBadge;
