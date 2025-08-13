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
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Venta
            <span className="ml-2 text-[10px] px-2 py-1 rounded bg-green-700/80">F1</span>
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <Button
              variant="outline"
              onClick={onRegistrarGasto}
              disabled={estadoCaja === 'cerrada' || !!loading}
              className="bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
            >
              <Receipt className="w-4 h-4 mr-2" /> Registrar Gasto
              <span className="ml-2 text-[10px] px-1.5 rounded bg-amber-200">F2</span>
            </Button>
            <Button
              variant="outline"
              onClick={onCerrarCaja}
              disabled={estadoCaja === 'cerrada' || !!loading}
              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
            >
              <Store className="w-4 h-4 mr-2" /> Cerrar Caja
              <span className="ml-2 text-[10px] px-1.5 rounded bg-red-200">F3</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
