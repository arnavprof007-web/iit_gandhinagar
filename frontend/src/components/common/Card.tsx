import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glass = true,
  hoverEffect = false,
  onClick,
}) => {
  const baseClasses =
    'rounded-2xl transition-all duration-200 border overflow-hidden';
  const glassClasses = glass
    ? 'bg-white/90 backdrop-blur-md border-emerald-100 shadow-sm'
    : 'bg-white border-slate-200 shadow-sm';
  const hoverClasses = hoverEffect
    ? 'hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-300 cursor-pointer'
    : '';

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${glassClasses} ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, icon, className = '' }) => (
  <div className={`p-5 border-b border-slate-100 flex items-start justify-between gap-4 ${className}`}>
    <div className="flex items-center gap-3 min-w-0">
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-100">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <h3 className="font-semibold text-base text-slate-900 truncate">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`p-5 ${className}`}>{children}</div>;
