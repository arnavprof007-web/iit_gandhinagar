import React from 'react';
import { Info, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

export interface AlertProps {
  type?: 'info' | 'warning' | 'success' | 'danger';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  className = '',
}) => {
  const styles = {
    info: {
      bg: 'bg-emerald-50/70 border-emerald-200 text-emerald-950',
      icon: <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-amber-50/80 border-amber-200 text-amber-950',
      icon: <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-emerald-100/60 border-emerald-300 text-emerald-950',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-800 flex-shrink-0 mt-0.5" />,
    },
    danger: {
      bg: 'bg-red-50/80 border-red-200 text-red-950',
      icon: <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />,
    },
  };

  const current = styles[type];

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${current.bg} ${className}`}>
      {current.icon}
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5 text-slate-900">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
};
