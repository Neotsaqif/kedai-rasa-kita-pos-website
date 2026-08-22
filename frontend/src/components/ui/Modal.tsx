import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-150"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div 
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden z-10 my-4 animate-in fade-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between px-5 py-4 border-b border-zinc-100 bg-zinc-50/50">
            <div className="pr-2">
              {title && <h3 className="text-sm sm:text-base font-bold text-zinc-900 leading-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <div className="p-5 max-h-[82vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
