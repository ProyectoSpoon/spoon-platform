"use client";
import React from 'react';
import { Button } from '@spoon/shared/components/ui/Button';
import { Card, CardContent } from '@spoon/shared/components/ui/Card';
import { Plus, Receipt, Store } from 'lucide-react';

export const AccionesPrincipales: React.FC<{
  estadoCaja: 'abierta' | 'cerrada';
  onNuevaVenta: () => void;
  onRegistrarGasto: () => void;
  onCerrarCaja: () => void;
  loading?: boolean;
}> = ({ estadoCaja, onNuevaVenta, onRegistrarGasto, onCerrarCaja, loading }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={onNuevaVenta}
            disabled={estadoCaja === 'cerrada' || !!loading}
            className="bg-[color:var(--sp-success-600)] hover:bg-[color:var(--sp-success-700)] text-[color:var(--sp-neutral-0)] px-8 py-6 text-lg font-semibold rounded-xl shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Venta
            <span className="ml-2 text-[10px] px-2 py-1 rounded bg-[color:color-mix(in_srgb,var(--sp-success-700)_80%,transparent)]">F1</span>
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <Button
              variant="outline"
              onClick={onRegistrarGasto}
              disabled={estadoCaja === 'cerrada' || !!loading}
              className="bg-[color:var(--sp-warning-50)] text-[color:var(--sp-warning-800)] border-[color:var(--sp-warning-200)] hover:bg-[color:var(--sp-warning-100)]"
            >
              <Receipt className="w-4 h-4 mr-2" /> Registrar Gasto
              <span className="ml-2 text-[10px] px-1.5 rounded bg-[color:var(--sp-warning-200)]">F2</span>
            </Button>
            <Button
              variant="outline"
              onClick={onCerrarCaja}
              disabled={estadoCaja === 'cerrada' || !!loading}
              className="bg-[color:var(--sp-error-50)] text-[color:var(--sp-error-700)] border-[color:var(--sp-error-200)] hover:bg-[color:var(--sp-error-100)]"
            >
              <Store className="w-4 h-4 mr-2" /> Cerrar Caja
              <span className="ml-2 text-[10px] px-1.5 rounded bg-[color:var(--sp-error-200)]">F3</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
