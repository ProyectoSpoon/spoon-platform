// packages/shared/components/ui/Toast/toast.tsx
import React from 'react';
import { cn } from '../../../lib/utils';
import { Toast as ToastType } from './use-toast';

export interface ToastComponentProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

// Usa variables semánticas del tema para alinear con tokens globales
// Fondo y borde aplican la misma variable con opacidad
const typeStyles = {
  success: {
    bg: 'bg-[color:var(--sp-success)]/20 border-[color:var(--sp-success)]/40',
    icon: 'text-white',
    title: 'text-white font-semibold',
    description: 'text-white font-medium',
  },
  error: {
    bg: 'bg-[color:var(--sp-error)]/20 border-[color:var(--sp-error)]/40',
    icon: 'text-white',
    title: 'text-white font-semibold',
    description: 'text-white font-medium',
  },
  warning: {
    bg: 'bg-[color:var(--sp-warning)]/20 border-[color:var(--sp-warning)]/40',
    icon: 'text-black',
    title: 'text-black font-semibold',
    description: 'text-black font-medium',
  },
  info: {
    bg: 'bg-[color:var(--sp-info)]/20 border-[color:var(--sp-info)]/40',
    icon: 'text-white',
    title: 'text-white font-semibold',
    description: 'text-white font-medium',
  },
};

const icons = {
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
};

export function Toast({ toast, onClose }: ToastComponentProps) {
  const styles = typeStyles[toast.type];

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all duration-300",
        styles.bg
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={cn("flex-shrink-0", styles.icon)}>
            {icons[toast.type]}
          </div>
          
          <div className="ml-3 w-0 flex-1">
            {toast.title && (
              <p className={cn("text-sm font-medium", styles.title)}>
                {toast.title}
              </p>
            )}
            <p className={cn("text-sm", styles.description)}>
              {toast.description}
            </p>
          </div>
          
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md text-[color:var(--sp-neutral-500)] hover:text-[color:var(--sp-neutral-600)] focus:outline-none focus:ring-2 focus:ring-[color:var(--sp-focus)] focus:ring-offset-2"
              onClick={() => onClose(toast.id)}
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
