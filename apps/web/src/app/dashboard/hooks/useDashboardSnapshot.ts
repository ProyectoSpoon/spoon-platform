'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase, getUserRestaurant } from '@spoon/shared/lib/supabase';
import { getBogotaDateISO } from '@spoon/shared/utils/datetime';
import { useCajaSesion } from '@spoon/shared/caja';
import { useMesas } from '@spoon/shared/hooks/mesas';
import { getEstadoDisplay } from '@spoon/shared/utils/mesas';

interface CajaSnapshot {
  abierta: boolean;
  apertura?: string; // ISO
}

interface MenuSnapshot {
  hayMenuHoy: boolean;
  totalCombinaciones: number;
  loading: boolean;
}

interface MesasSnapshot {
  activas: number;
  enCocina: number;
  porCobrarCOP: number;
}

export function useDashboardSnapshot() {
  // Caja
  const { estadoCaja, sesionActual, loading: loadingCaja } = useCajaSesion();

  const caja: CajaSnapshot = useMemo(() => ({
    abierta: estadoCaja === 'abierta',
    apertura: (sesionActual as any)?.abierta_at || (sesionActual as any)?.fechaApertura,
  }), [estadoCaja, sesionActual]);

  // Menú del día (consulta liviana)
  const [menu, setMenu] = useState<MenuSnapshot>({ hayMenuHoy: false, totalCombinaciones: 0, loading: true });
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const restaurant = await getUserRestaurant();
        if (!restaurant) { if (!cancelled) setMenu({ hayMenuHoy: false, totalCombinaciones: 0, loading: false }); return; }
  // Fecha de hoy en zona America/Bogota (YYYY-MM-DD)
  const fechaHoy = getBogotaDateISO();
        // Buscar TODOS los menús del día para hoy (cualquier status)
        const { data: menusHoy, error: menusErr } = await supabase
          .from('daily_menus')
          .select('id,status')
          .eq('restaurant_id', restaurant.id)
          .eq('menu_date', fechaHoy)
          .order('updated_at', { ascending: false });
        if (menusErr) throw menusErr;
        if (!menusHoy || menusHoy.length === 0) {
          if (!cancelled) setMenu({ hayMenuHoy: false, totalCombinaciones: 0, loading: false });
          return;
        }

        // Regla simplificada: consideramos el menú "Activo para hoy" si existe
        // al menos un menú de hoy con status 'active' o 'published' que tenga combinaciones disponibles.
        let bestAvailable = 0;
        let hasAnyActiveOrPublished = false;
        for (const m of menusHoy) {
          const status = (m as any).status as string | undefined;
          if (status === 'active' || status === 'published') {
            hasAnyActiveOrPublished = true;
            const { count, error: cntErr } = await supabase
              .from('generated_combinations')
              .select('id', { count: 'exact', head: true })
              .eq('daily_menu_id', (m as any).id)
              .eq('is_available', true);
            if (cntErr) throw cntErr;
            const c = count || 0;
            if (c > bestAvailable) bestAvailable = c;
          }
        }

        // Mostrar "Activo para hoy" si existe menú (active|published), aunque aún no tenga combinaciones.
        if (!cancelled) setMenu({ hayMenuHoy: hasAnyActiveOrPublished, totalCombinaciones: bestAvailable, loading: false });
      } catch (_e) {
        if (!cancelled) setMenu({ hayMenuHoy: false, totalCombinaciones: 0, loading: false });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Mesas (derivado del hook compartido)
  const { mesasCompletas, configuracion, mesasOcupadas } = useMesas();
  const mesas: MesasSnapshot = useMemo(() => {
    if (!caja.abierta) return { activas: 0, enCocina: 0, porCobrarCOP: 0 };
    const activas = configuracion?.configuradas
      ? mesasCompletas.filter(m => ['ocupada','en_cocina','servida','por_cobrar'].includes(getEstadoDisplay(m).estado)).length
      : Object.keys(mesasOcupadas || {}).length;
    const enCocina = configuracion?.configuradas
      ? mesasCompletas.filter(m => getEstadoDisplay(m).estado === 'en_cocina').length
      : 0;
    const porCobrarCOP = configuracion?.configuradas
      ? mesasCompletas
          .filter(m => getEstadoDisplay(m).estado === 'por_cobrar' && (m as any).detallesOrden)
          .reduce((sum, m) => sum + ((m as any).detallesOrden?.total || 0), 0)
      : 0;
    return { activas, enCocina, porCobrarCOP };
  }, [caja.abierta, configuracion?.configuradas, mesasCompletas, mesasOcupadas]);

  const loadingAny = loadingCaja || menu.loading;

  return { loading: loadingAny, caja, menu, mesas } as const;
}
