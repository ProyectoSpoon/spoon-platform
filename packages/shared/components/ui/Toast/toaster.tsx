"use client";
// packages/shared/components/ui/Toast/toaster.tsx
import React from 'react';
import { useToast } from './use-toast';
import { Toast } from './toast';

export function Toaster() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 pointer-events-none"
    >
      <div className="w-full flex flex-col items-center space-y-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-in slide-in-from-top-full duration-300"
          >
            <Toast toast={toast} onClose={removeToast} />
          </div>
        ))}
      </div>
    </div>
  );
}
