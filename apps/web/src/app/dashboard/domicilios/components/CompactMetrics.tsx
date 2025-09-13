'use client';

import React from 'react';
import { Clock as ClockRaw, Truck as TruckRaw, CheckCircle as CheckCircleRaw, DollarSign as DollarSignRaw, Users as UsersRaw } from 'lucide-react';
const Clock: any = ClockRaw;
const Truck: any = TruckRaw;
const CheckCircle: any = CheckCircleRaw;
const DollarSign: any = DollarSignRaw;
const Users: any = UsersRaw;
import TopBannerCaja from './TopBannerCaja';

interface CompactMetricsProps {
  pendientes: number;
  enRuta: number;
  entregados: number;
  totalDia: number;
  disponibles: number;
  showCajaBannerInside?: boolean; // muestra alerta dentro de En Ruta card
}

export default function CompactMetrics({ pendientes, enRuta, entregados, totalDia, disponibles, showCajaBannerInside }: CompactMetricsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
      <div className="bg-[--sp-surface-elevated] rounded-md shadow-sm p-3">
        <div className="flex items-center">
          <div className="p-2.5 rounded-full bg-[color:var(--sp-warning-100)]">
            <Clock className="h-5 w-5 text-[color:var(--sp-warning-600)]" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-[color:var(--sp-neutral-600)]">Pendientes</p>
            <p className="value-number text-[color:var(--sp-neutral-900)]">{pendientes}</p>
          </div>
        </div>
      </div>
      <div className="bg-[--sp-surface-elevated] rounded-md shadow-sm p-3">
        <div className="flex items-center">
          <div className="p-2.5 rounded-full bg-[color:var(--sp-info-100)]">
            <Truck className="h-5 w-5 text-[color:var(--sp-info-600)]" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-[color:var(--sp-neutral-600)]">En Ruta</p>
            <p className="value-number text-[color:var(--sp-neutral-900)]">{enRuta}</p>
          </div>
        </div>
        {showCajaBannerInside && (
          <div className="mt-3">
            <TopBannerCaja visible={true} />
          </div>
        )}
      </div>
      <div className="bg-[--sp-surface-elevated] rounded-md shadow-sm p-3">
        <div className="flex items-center">
          <div className="p-2.5 rounded-full bg-[color:var(--sp-success-100)]">
            <CheckCircle className="h-5 w-5 text-[color:var(--sp-success-600)]" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-[color:var(--sp-neutral-600)]">Entregados</p>
            <p className="value-number text-[color:var(--sp-neutral-900)]">{entregados}</p>
          </div>
        </div>
      </div>
      <div className="bg-[--sp-surface-elevated] rounded-md shadow-sm p-3">
        <div className="flex items-center">
          <div className="p-2.5 rounded-full bg-[color:var(--sp-info-100)]">
            <DollarSign className="h-5 w-5 text-[color:var(--sp-info-600)]" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-[color:var(--sp-neutral-600)]">Total Dia</p>
            <p className="value-number text-[color:var(--sp-neutral-900)]">{'$' + totalDia.toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div className="bg-[--sp-surface-elevated] rounded-md shadow-sm p-3">
        <div className="flex items-center">
          <div className="p-2.5 rounded-full bg-[color:var(--sp-error-100)]">
            <Users className="h-5 w-5 text-[color:var(--sp-error-600)]" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-[color:var(--sp-neutral-600)]">Disponibles</p>
            <p className="value-number text-[color:var(--sp-neutral-900)]">{disponibles}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
