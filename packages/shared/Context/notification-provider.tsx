'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Toaster, toast } from '../components/ui/Toast';
import { DialogV2 } from '../components/ui/DialogV2';

type NotifyType = 'success' | 'error' | 'warning' | 'info';

export interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: NotifyType; // color hint
}

interface NotificationAPI {
  notify: (type: NotifyType, message: string, title?: string, durationMs?: number) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationAPI | null>(null);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within <NotificationProvider/>');
  return ctx;
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }>= ({ children }) => {
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    opts: ConfirmOptions;
    resolver?: (v: boolean) => void;
  }>({ open: false, opts: {} });

  const notify = useCallback((type: NotifyType, message: string, title?: string, durationMs?: number) => {
    // Use our toast system
    const id = toast[type](message, title);
    if (durationMs && durationMs > 0) {
      // Auto dismiss is already handled internally; keep hook for custom durations in future
    }
    return id;
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ open: true, opts: options, resolver: resolve });
    });
  }, []);

  const onConfirm = useCallback(() => {
    confirmState.resolver?.(true);
    setConfirmState({ open: false, opts: {} });
  }, [confirmState]);

  const onCancel = useCallback(() => {
    confirmState.resolver?.(false);
    setConfirmState({ open: false, opts: {} });
  }, [confirmState]);

  const value = useMemo<NotificationAPI>(() => ({ notify, confirm }), [notify, confirm]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <Toaster />
      {/* Simple confirm dialog using DialogV2 */}
      <DialogV2
        open={confirmState.open}
        onClose={onCancel}
        title={confirmState.opts.title ?? 'Confirmación'}
        description={confirmState.opts.description}
        size="sm"
      >
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded bg-[color:var(--sp-neutral-100)] hover:bg-[color:var(--sp-neutral-200)] text-[color:var(--sp-neutral-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sp-focus)] focus-visible:ring-offset-2"
          >
            {confirmState.opts.cancelText ?? 'Cancelar'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-[color:var(--sp-primary)] text-white hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sp-focus)] focus-visible:ring-offset-2"
          >
            {confirmState.opts.confirmText ?? 'Confirmar'}
          </button>
        </div>
      </DialogV2>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;