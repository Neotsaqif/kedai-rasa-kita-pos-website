import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-xs sm:text-sm gap-2',
    lg: 'px-4 py-2.5 text-sm gap-2 font-semibold',
  };

  const variantClasses = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-800 focus:ring-zinc-900',
    accent: 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-600',
    secondary: 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 focus:ring-zinc-300',
    outline: 'border border-zinc-200 text-zinc-800 bg-white hover:bg-zinc-50 focus:ring-zinc-400',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500',
    ghost: 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 focus:ring-zinc-300',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
