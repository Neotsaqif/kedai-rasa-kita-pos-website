import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 rounded-2xl border-2 border-dashed border-stone-200 bg-[#FAF8F5]/60 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-[#EFECE6] text-stone-500 flex items-center justify-center mb-3.5 shadow-xs">
        {icon || <PackageOpen className="w-7 h-7" />}
      </div>
      <h4 className="text-base font-bold text-stone-800">{title}</h4>
      {description && (
        <p className="text-xs text-stone-500 max-w-sm mt-1 mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
