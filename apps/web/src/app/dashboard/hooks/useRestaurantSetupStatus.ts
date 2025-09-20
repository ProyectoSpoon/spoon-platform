'use client';

import { useEffect, useMemo, useState } from 'react';
import { getUserRestaurant, subscribeToRestaurantUpdates, type Restaurant } from '@spoon/shared/lib/supabase';

export interface SetupMissingItem {
  id: 'nombre' | 'contacto' | 'ubicacion' | 'horarios' | 'tipo_cocina' | 'imagenes';
  label: string;
  hint: string;
  link: string;
}

export function useRestaurantSetupStatus() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: { unsubscribe: () => void } | null = null;
    (async () => {
      setLoading(true);
      try {
        const r = await getUserRestaurant();
        setRestaurant(r);
        // Suscribirse a cambios en restaurantes para refrescar checklist
        if (r?.id) {
          const ch = subscribeToRestaurantUpdates(r.id, async () => {
            const updated = await getUserRestaurant();
            setRestaurant(updated);
          });
          unsub = ch as any;
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      try { (unsub as any)?.unsubscribe?.(); } catch { /* no-op */ }
    };
  }, []);

  const missing = useMemo<SetupMissingItem[]>(() => {
    const items: SetupMissingItem[] = [];
    const r = restaurant;
    if (!r) return [
  { id: 'nombre', label: 'Información general', hint: 'Completa nombre y datos básicos', link: '/dashboard/configuracion#general' },
  { id: 'ubicacion', label: 'Ubicación', hint: 'Dirección y ciudad', link: '/dashboard/configuracion#ubicacion' },
  { id: 'horarios', label: 'Horarios', hint: 'Define horarios de atención', link: '/dashboard/configuracion#horarios' }
    ];
    // Nombre / info básica
    if (!r.name || !r.contact_phone) {
  items.push({ id: 'nombre', label: 'Información general', hint: 'Nombre y teléfono de contacto', link: '/dashboard/configuracion#general' });
    }
    // Tipo de cocina
    if (!r.cuisine_type_id && !r.cuisine_type) {
  items.push({ id: 'tipo_cocina', label: 'Tipo de cocina', hint: 'Selecciona el tipo de cocina', link: '/dashboard/configuracion#general' });
    }
    // Ubicación (preferir nuevos campos FK, caer a legacy si no)
    const hasGeo = !!(r.city_id || (r.address && (r.city || r.state)));
    if (!hasGeo) {
  items.push({ id: 'ubicacion', label: 'Ubicación', hint: 'Dirección y ciudad', link: '/dashboard/configuracion#ubicacion' });
    }
    // Horarios
    if (!r.business_hours || Object.keys(r.business_hours || {}).length === 0) {
  items.push({ id: 'horarios', label: 'Horarios', hint: 'Define horarios de atención', link: '/dashboard/configuracion#horarios' });
    }
    // Imágenes
    if (!r.logo_url || !r.cover_image_url) {
  items.push({ id: 'imagenes', label: 'Imágenes', hint: 'Sube logo y portada', link: '/dashboard/configuracion#imagenes' });
    }
    return items;
  }, [restaurant]);

  const completed = missing.length === 0;

  return { loading, restaurant, missing, completed } as const;
}
