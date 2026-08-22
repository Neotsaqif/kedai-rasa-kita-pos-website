import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  highlight?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = false,
  className = '',
}) => {
  return (
    <Card className={`relative overflow-hidden ${highlight ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-white'} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={`text-[11px] font-semibold uppercase tracking-wider ${highlight ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {title}
          </p>
          <p className={`text-xl sm:text-2xl font-bold tracking-tight ${highlight ? 'text-white' : 'text-zinc-900'}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs ${highlight ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-2.5 rounded-lg ${highlight ? 'bg-zinc-800 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className={`mt-3 pt-2.5 border-t flex items-center text-xs gap-1.5 ${highlight ? 'border-zinc-800' : 'border-zinc-100'}`}>
          <span className={`font-semibold ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend.value}
          </span>
          {trend.label && (
            <span className={highlight ? 'text-zinc-400' : 'text-zinc-500'}>
              {trend.label}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
