'use client';

import React from 'react';
import Link from 'next/link';
import { DollarSign as DollarSignRaw } from 'lucide-react';
const DollarSign: any = DollarSignRaw; // cast temporal por duplicación de tipos React
const LinkAny: any = Link;

interface TopBannerCajaProps {
  visible: boolean;
}

export default function TopBannerCaja({ visible }: TopBannerCajaProps) {
  if (!visible) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-4 rounded-md border border-[color:var(--sp-warning-200)] bg-[color:var(--sp-warning-50)] px-4 py-2 flex items-center justify-between gap-3 shadow-[inset_4px_0_0_0_var(--sp-warning-400)]"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-1.5 rounded-md bg-[color:var(--sp-warning-100)] text-[color:var(--sp-warning-700)] shrink-0">
          <DollarSign className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-[color:var(--sp-warning-900)] text-sm truncate">
            No hay caja abierta
          </p>
          <p className="text-[color:var(--sp-warning-800)] text-xs leading-snug mt-0.5 truncate">
            Abre una sesión de caja para registrar pagos de domicilios.
          </p>
        </div>
      </div>
      <LinkAny
        href="/dashboard/caja"
        className="inline-flex items-center justify-center h-8 px-3 text-xs sm:text-sm font-medium rounded-md border border-[color:var(--sp-warning-300)] text-[color:var(--sp-warning-800)] bg-[color:var(--sp-warning-100)] hover:bg-[color:var(--sp-warning-200)] transition-colors shrink-0"
      >
        Abrir caja
      </LinkAny>
    </div>
  );
}
