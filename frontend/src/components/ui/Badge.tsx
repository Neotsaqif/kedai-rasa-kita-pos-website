import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px] font-medium',
    md: 'px-2 py-0.5 text-xs font-medium',
  };

  const variantClasses = {
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    info: 'bg-sky-50 text-sky-700 border border-sky-200/80',
    neutral: 'bg-zinc-100 text-zinc-700 border border-zinc-200/80',
    brand: 'bg-orange-50 text-orange-700 border border-orange-200/80',
  };

  const dotColor = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    neutral: 'bg-zinc-400',
    brand: 'bg-orange-500',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md ${sizeClasses[size]} ${variantClasses[variant]} whitespace-nowrap ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor[variant]}`} />}
      {children}
    </span>
  );
};
