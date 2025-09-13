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
    <div className="mb-6 rounded-lg border border-[color:var(--sp-warning-300)] bg-[color:var(--sp-warning-50)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-2 rounded-md bg-[color:var(--sp-warning-100)] text-[color:var(--sp-warning-700)]">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-[color:var(--sp-warning-800)] text-sm">No hay caja abierta</p>
          <p className="text-[color:var(--sp-warning-700)] text-xs sm:text-sm leading-snug mt-0.5 max-w-prose">
            Debes abrir una sesión de caja para poder registrar pagos de domicilios. Los botones de pago permanecerán deshabilitados hasta entonces.
          </p>
        </div>
      </div>
      <LinkAny
        href="/dashboard/caja"
        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-[color:var(--sp-warning-600)] text-[--sp-on-warning] hover:bg-[color:var(--sp-warning-700)] transition-colors"
      >
        Abrir Caja
      </LinkAny>
    </div>
  );
}
