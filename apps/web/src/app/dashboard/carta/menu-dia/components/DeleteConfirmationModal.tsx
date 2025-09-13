"use client";

import React from 'react';
import { Trash2, RefreshCw } from 'lucide-react';

// Type casting para evitar conflictos de tipos React
const Trash2Component = Trash2 as any;
const RefreshCwComponent = RefreshCw as any;

interface Props {
  isOpen: boolean;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmationModal({ isOpen, busy, onCancel, onConfirm }: Props) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-60 overflow-hidden">
      <div className="absolute inset-0 bg-[--sp-overlay]" onClick={onCancel} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[--sp-surface-elevated] rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-[color:var(--sp-error-100)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2Component className="w-8 h-8 text-[color:var(--sp-error-600)]" />
          </div>
          <h3 className="heading-section text-[color:var(--sp-neutral-900)] mb-2">
            ¿Eliminar combinación?
          </h3>
          <p className="text-[color:var(--sp-neutral-600)] mb-6">
            Esta acción no se puede deshacer. La combinación será eliminada permanentemente del menú.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              disabled={busy}
              className="px-4 py-2 border border-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-700)] rounded-lg hover:bg-[color:var(--sp-neutral-50)] disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={busy}
              className="px-4 py-2 bg-[color:var(--sp-error-600)] text-[--sp-on-error] rounded-lg hover:bg-[color:var(--sp-error-700)] disabled:opacity-50 transition-colors flex items-center"
            >
              {busy ? (
                <>
                  <RefreshCwComponent className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2Component className="w-4 h-4 mr-2" />
                  Eliminar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

