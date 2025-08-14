// packages/shared/components/ui/Toast/use-toast.tsx
"use client";
// packages/shared/components/ui/Toast/use-toast.tsx
import React, { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title?: string;
  description: string;
  type: ToastType;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

let toastCount = 0;

function generateId(): string {
  return `toast-${++toastCount}`;
}

// Global state para toasts
let globalState: ToastState = { toasts: [] };
let listeners: Array<(state: ToastState) => void> = [];

function updateGlobalState(newState: ToastState) {
  globalState = newState;
  listeners.forEach(listener => listener(newState));
}

export function useToast() {
  const [_toastState, setState] = useState<ToastState>(globalState);

  // Suscribirse a cambios globales
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);
  const removeToast = useCallback((id: string) => {
    const newState = {
      toasts: globalState.toasts.filter(toast => toast.id !== id),
    };
    updateGlobalState(newState);
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const newToast: Toast = {
      ...toast,
      id: generateId(),
      duration: toast.duration || 5000,
    };

    const newState = {
      toasts: [...globalState.toasts, newToast],
    };

    updateGlobalState(newState);

    // Auto-remove toast after duration
    setTimeout(() => {
      removeToast(newToast.id);
    }, newToast.duration);

    return newToast.id;
  }, [removeToast]);

  const toastMethods = React.useMemo(() => ({
    success: (message: string, title?: string) => 
      addToast({ type: 'success', description: message, title }),
    error: (message: string, title?: string) => 
      addToast({ type: 'error', description: message, title }),
    warning: (message: string, title?: string) => 
      addToast({ type: 'warning', description: message, title }),
    info: (message: string, title?: string) => 
      addToast({ type: 'info', description: message, title }),
  }), [addToast]);

  return {
    toasts: _toastState.toasts,
    toast: toastMethods,
    removeToast,
  };
}

// Export individual functions for convenience
export const toast = {
  success: (message: string, title?: string) => {
    const newToast: Toast = {
      id: generateId(),
      type: 'success',
      description: message,
      title,
      duration: 5000,
    };

    updateGlobalState({
      toasts: [...globalState.toasts, newToast],
    });

    setTimeout(() => {
      updateGlobalState({
        toasts: globalState.toasts.filter(t => t.id !== newToast.id),
      });
    }, newToast.duration);

    return newToast.id;
  },
  error: (message: string, title?: string) => {
    const newToast: Toast = {
      id: generateId(),
      type: 'error',
      description: message,
      title,
      duration: 5000,
    };

    updateGlobalState({
      toasts: [...globalState.toasts, newToast],
    });

    setTimeout(() => {
      updateGlobalState({
        toasts: globalState.toasts.filter(t => t.id !== newToast.id),
      });
    }, newToast.duration);

    return newToast.id;
  },
  warning: (message: string, title?: string) => {
    const newToast: Toast = {
      id: generateId(),
      type: 'warning',
      description: message,
      title,
      duration: 5000,
    };

    updateGlobalState({
      toasts: [...globalState.toasts, newToast],
    });

    setTimeout(() => {
      updateGlobalState({
        toasts: globalState.toasts.filter(t => t.id !== newToast.id),
      });
    }, newToast.duration);

    return newToast.id;
  },
  info: (message: string, title?: string) => {
    const newToast: Toast = {
      id: generateId(),
      type: 'info',
      description: message,
      title,
      duration: 5000,
    };

    updateGlobalState({
      toasts: [...globalState.toasts, newToast],
    });

    setTimeout(() => {
      updateGlobalState({
        toasts: globalState.toasts.filter(t => t.id !== newToast.id),
      });
    }, newToast.duration);

    return newToast.id;
  },
};