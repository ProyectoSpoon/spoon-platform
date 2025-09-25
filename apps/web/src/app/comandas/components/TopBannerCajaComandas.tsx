"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Lock as LockRaw } from 'lucide-react';
import { supabase, getCurrentRestaurantId, getSesionCajaActiva } from '@spoon/shared/lib/supabase';

const Lock: any = LockRaw;

export default function TopBannerCajaComandas() {
  const [hasOpenCaja, setHasOpenCaja] = useState<boolean | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const isComandasHome = typeof window !== 'undefined'
    ? (window.location.pathname === '/comandas' || window.location.pathname === '/comandas/')
    : false;

  const refreshCaja = useCallback(async () => {
    try {
      const rid = restaurantId ?? (await getCurrentRestaurantId());
      if (!rid) { setHasOpenCaja(null); return; }
      if (!restaurantId) setRestaurantId(rid);
      const sesion = await getSesionCajaActiva(rid);
      const abierta = !!sesion;
      setHasOpenCaja(abierta);
      // Avisar globalmente por si alguna página quiere reaccionar
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('caja:estado', { detail: { abierta } }));
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[Comandas][TopBannerCaja] Error refrescando estado de caja:', e);
      setHasOpenCaja(null);
    }
  }, [restaurantId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await refreshCaja();
      if (!mounted) return;
      const rid = restaurantId ?? (await getCurrentRestaurantId());
      if (!mounted || !rid) return;
      setRestaurantId(rid);

      // Suscripción a cambios en caja_sesiones para este restaurante
      const channel = supabase
        .channel(`caja_sesiones_comandas_${rid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'caja_sesiones', filter: `restaurant_id=eq.${rid}` }, () => {
          refreshCaja();
        })
        .subscribe();

      return () => {
        try { supabase.removeChannel(channel); } catch {/* no-op */}
      };
    })();
    return () => { mounted = false; };
  }, [refreshCaja, restaurantId]);

  // Evitar duplicar mensajes en la home de Comandas: ahí mostramos un empty state central.
  if (hasOpenCaja !== false || isComandasHome) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-4 rounded-md border border-[color:var(--sp-warning-200)] bg-[color:var(--sp-warning-50)] px-4 py-2 flex items-center gap-3 shadow-[inset_4px_0_0_0_var(--sp-warning-400)]"
    >
      <div className="p-1.5 rounded-md bg-[color:var(--sp-warning-100)] text-[color:var(--sp-warning-700)]">
        <Lock className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="font-medium text-[color:var(--sp-warning-900)] text-sm truncate">
          No hay caja abierta
        </p>
        <p className="text-[color:var(--sp-warning-800)] text-xs leading-snug mt-0.5 truncate">
          Cuando el administrador abra la caja, Comandas se habilitará automáticamente.
        </p>
      </div>
    </div>
  );
}
