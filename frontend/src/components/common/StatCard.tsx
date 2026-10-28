import React from 'react';
import { Card } from './Card';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  change?: {
    value: number | string;
    label?: string;
    isPositiveGreen?: boolean; // For CO2 / consumption, decrease is green (positive)
    type?: 'decrease' | 'increase' | 'neutral';
  };
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  change,
  onClick,
  className = '',
}) => {
  return (
    <Card hoverEffect={!!onClick} onClick={onClick} className={`p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-display tracking-tight">
            {value}
          </div>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 flex-shrink-0">
            {icon}
          </div>
        )}
      </div>

      {(change || subtitle) && (
        <div className="mt-3 flex items-center justify-between text-xs gap-2 pt-2 border-t border-slate-100/60">
          {change && (
            <div
              className={`inline-flex items-center gap-1 font-semibold ${
                change.type === 'decrease'
                  ? change.isPositiveGreen !== false
                    ? 'text-emerald-600'
                    : 'text-red-600'
                  : change.type === 'increase'
                  ? change.isPositiveGreen === false
                    ? 'text-red-600'
                    : 'text-emerald-600'
                  : 'text-slate-500'
              }`}
            >
              {change.type === 'decrease' && <TrendingDown className="w-3.5 h-3.5" />}
              {change.type === 'increase' && <TrendingUp className="w-3.5 h-3.5" />}
              {change.type === 'neutral' && <Minus className="w-3.5 h-3.5" />}
              <span>{change.value}</span>
              {change.label && <span className="text-slate-400 font-normal">vs {change.label}</span>}
            </div>
          )}
          {subtitle && !change && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
};
