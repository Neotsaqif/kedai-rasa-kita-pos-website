import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  id?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-zinc-700">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full rounded-lg border bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400
            transition-colors duration-150 focus:outline-none focus:ring-2
            ${leftIcon ? 'pl-9' : ''}
            ${rightIcon ? 'pr-9' : ''}
            ${error 
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100' 
              : 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900/10'
            }
            ${props.disabled ? 'bg-zinc-50 cursor-not-allowed text-zinc-400' : ''}
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-zinc-500">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
