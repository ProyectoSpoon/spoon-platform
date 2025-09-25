 "use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasAnyRole, getActiveRoles, supabase, getCurrentRestaurantId, getMesasRestaurante, getDetallesMesa, crearOrdenMesa, getSesionCajaActiva } from '@spoon/shared/lib/supabase';

export default function ComandaPorMesaPage({ params }: { params: { numero: string } }) {
  const router = useRouter();
  const numeroMesa = useMemo(() => Number(params.numero), [params.numero]);
  const [auth, setAuth] = useState<'checking' | 'denied' | 'ok'>('checking');
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [validMesa, setValidMesa] = useState<boolean | null>(null);
  const [checkingOrden, setCheckingOrden] = useState<boolean>(true);
  const [ordenActivaId, setOrdenActivaId] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [cajaOpen, setCajaOpen] = useState<null | boolean>(null);
  const [debug, setDebug] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Sesión
      setDebug((d) => [...d, `[Mesa ${numeroMesa}] Verificando sesión…`]);
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session) { setAuth('denied'); return; }

      // Rol mesero (y equivalentes) con fallback de desarrollo
      setDebug((d) => [...d, `[Mesa ${numeroMesa}] Verificando rol…`]);
      const requestedRoles = ['mesero', 'waiter', 'mozo', 'admin', 'administrador', 'owner', 'propietario', 'dueño', 'dueno', 'gerente', 'manager'];
      let allowed = await hasAnyRole(requestedRoles);
      if (!allowed) {
        const detected = await getActiveRoles().catch(() => [] as string[]);
        setDebug((d) => [...d, `[Mesa ${numeroMesa}] Roles detectados: ${Array.isArray(detected) ? detected.join(', ') || '(ninguno)' : '(desconocido)'}]`]);
        if (process.env.NODE_ENV !== 'production') {
          setDebug((d) => [...d, `[Mesa ${numeroMesa}] Dev fallback: permitiendo acceso con sesión activa`]);
          allowed = true;
        }
      }
      if (!mounted) return;
      if (!allowed) { setAuth('denied'); return; }
      setAuth('ok');

      // Restaurante y validación de mesa
      setDebug((d) => [...d, `[Mesa ${numeroMesa}] Obteniendo restaurantId…`]);
      const rid = await getCurrentRestaurantId();
      if (!mounted) return;
      setRestaurantId(rid);
      if (!rid || !Number.isFinite(numeroMesa)) { setValidMesa(false); return; }
      // Verificar caja abierta
      try {
        setDebug((d) => [...d, `[Mesa ${numeroMesa}] Verificando caja abierta…`]);
        const sesion = await getSesionCajaActiva(rid);
        if (!mounted) return;
        const abierta = !!sesion;
        setCajaOpen(abierta);
        setDebug((d) => [...d, `[Mesa ${numeroMesa}] Caja ${abierta ? 'abierta' : 'cerrada'}`]);
        if (!abierta) {
          // Bloqueamos flujo de mesa cuando caja está cerrada
          setValidMesa(true); // la mesa puede existir, pero la sección queda bloqueada
          setCheckingOrden(false);
          return;
        }
      } catch (e) {
        setDebug((d) => [...d, `[Mesa ${numeroMesa}] Error verificando caja: ${(e as Error)?.message ?? 'desconocido'}`]);
        if (!mounted) return;
        setCajaOpen(false);
        setCheckingOrden(false);
        return;
      }
      try {
        setDebug((d) => [...d, `[Mesa ${numeroMesa}] Validando mesa en restaurante ${rid}…`]);
        const mesas = await getMesasRestaurante(rid);
        if (!mounted) return;
        setValidMesa(mesas.some(m => Number(m.numero) === numeroMesa));
      } catch {
        setDebug((d) => [...d, `[Mesa ${numeroMesa}] Error validando mesa`]);
        if (!mounted) return;
        setValidMesa(false);
      }
    })();
    return () => { mounted = false; };
  }, [numeroMesa]);

  // Cargar orden activa (si existe) cuando todo está validado y caja abierta
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (auth !== 'ok' || !restaurantId || validMesa !== true || !Number.isFinite(numeroMesa) || cajaOpen === false) return;
      setCheckingOrden(true);
      try {
        setDebug((d) => [...d, `[Mesa ${numeroMesa}] Buscando orden activa…`]);
        const detalles = await getDetallesMesa(restaurantId, numeroMesa);
        if (!mounted) return;
        const primera = detalles.ordenes?.[0];
        setOrdenActivaId(primera ? String(primera.id) : null);
        setDebug((d) => [...d, `[Mesa ${numeroMesa}] Orden activa: ${primera ? primera.id : 'ninguna'}`]);
      } catch (e) {
        console.error('Error obteniendo detalles de mesa:', e);
        setDebug((d) => [...d, `[Mesa ${numeroMesa}] Error obteniendo detalles: ${(e as Error)?.message ?? 'desconocido'}`]);
        if (!mounted) return;
        setOrdenActivaId(null);
      } finally {
        if (mounted) setCheckingOrden(false);
      }
    })();
    return () => { mounted = false; };
  }, [auth, restaurantId, validMesa, numeroMesa, cajaOpen]);

  if (auth === 'checking' || validMesa === null) {
    return <div className="h-screen grid place-items-center text-[color:var(--sp-neutral-600)]">Cargando…</div>;
  }
  if (auth === 'denied') {
    return <div className="h-screen grid place-items-center text-[color:var(--sp-neutral-700)]">Acceso restringido</div>;
  }
  if (!validMesa) {
    return (
      <div className="h-screen grid place-items-center p-6">
        <div className="max-w-sm w-full text-center bg-[color:var(--sp-surface-elevated)] border border-[color:var(--sp-border)] rounded-xl p-6">
          <h2 className="font-semibold mb-1 text-[color:var(--sp-neutral-900)]">Mesa no válida</h2>
          <p className="text-sm text-[color:var(--sp-neutral-600)] mb-4">No existe la mesa {String(numeroMesa)} en este restaurante.</p>
          <button onClick={() => router.replace('/comandas')} className="px-4 py-2 rounded-lg bg-[color:var(--sp-neutral-900)] text-[color:var(--sp-on-primary)] text-sm font-medium">Volver</button>
        </div>
      </div>
    );
  }

  if (cajaOpen === false) {
    return (
      <div className="h-screen grid place-items-center p-6">
        <div className="max-w-sm w-full text-center bg-[color:var(--sp-surface-elevated)] border border-[color:var(--sp-border)] rounded-xl p-6">
          <h2 className="font-semibold mb-1 text-[color:var(--sp-neutral-900)]">Caja cerrada</h2>
          <p className="text-sm text-[color:var(--sp-neutral-600)] mb-4">No puedes gestionar esta mesa mientras la caja esté cerrada. Pídele al administrador que abra la caja.</p>
          <button onClick={() => router.replace('/comandas')} className="px-4 py-2 rounded-lg border border-[color:var(--sp-border)] text-[color:var(--sp-neutral-900)] text-sm font-medium hover:bg-[color:var(--sp-neutral-100)]">Volver</button>
        </div>
      </div>
    );
  }

  // Acciones
  const handleContinuar = () => {
    if (!ordenActivaId) return;
    router.push(`/comandas/mesa/${numeroMesa}/orden/${ordenActivaId}`);
  };
  const handleNueva = async () => {
    if (!restaurantId || !cajaOpen) return;
    try {
      setCreating(true);
      const nueva = await crearOrdenMesa({
        restaurantId,
        numeroMesa,
        items: []
      });
      router.replace(`/comandas/mesa/${numeroMesa}/orden/${nueva.id}`);
    } catch (e) {
      console.error('Error creando nueva orden:', e);
      alert('No se pudo crear la orden. Intenta de nuevo.');
    } finally {
      setCreating(false);
    }
  };
  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-[color:var(--sp-neutral-900)]">Mesa {numeroMesa}</h1>
        <p className="text-sm text-[color:var(--sp-neutral-600)]">
          {checkingOrden ? 'Revisando orden activa…' : (ordenActivaId ? `Orden activa #${ordenActivaId}` : 'Sin orden activa')}
        </p>
      </div>
      <div className="rounded-xl border border-[color:var(--sp-border)] bg-[color:var(--sp-surface-elevated)] p-6">
        <div className="flex gap-3">
          <button
            onClick={handleContinuar}
            disabled={!ordenActivaId || checkingOrden}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${ordenActivaId ? 'bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)]' : 'bg-[color:var(--sp-neutral-200)] text-[color:var(--sp-neutral-600)] cursor-not-allowed'}`}
          >
            Continuar orden
          </button>
          <button
            onClick={handleNueva}
            disabled={!!ordenActivaId || creating}
            className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium ${ordenActivaId ? 'border-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-500)] cursor-not-allowed' : 'border-[color:var(--sp-border)] text-[color:var(--sp-neutral-900)]'}`}
          >
            {creating ? 'Creando…' : 'Nueva orden'}
          </button>
        </div>
      </div>
      <div className="mt-3 text-xs text-[color:var(--sp-neutral-500)] whitespace-pre-wrap">
        Debug:
        {'\n'}{debug.join('\n')}
      </div>
    </div>
  );
}
