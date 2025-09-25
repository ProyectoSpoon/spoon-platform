/* eslint-disable react/no-unescaped-entities */
/* eslint react/no-unescaped-entities: off */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, hasAnyRole, getCurrentRestaurantId, getSesionCajaActiva } from '@spoon/shared/lib/supabase';

type OrdenHeader = {
  id: string;
  numero_mesa: number;
  nombre_mesero?: string | null;
  estado: string;
  fecha_creacion: string;
  monto_total: number;
};

type ItemOrden = {
  id: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  tipo_item: 'menu_dia' | 'especial';
  combinacion_id?: string | null;
  combinacion_especial_id?: string | null;
  nombre_producto: string;
};

export default function OrdenBuilderPage({ params }: { params: { numero: string; ordenId: string } }) {
  const router = useRouter();
  const numeroMesa = useMemo(() => Number(params.numero), [params.numero]);
  const ordenId = params.ordenId;
  const [auth, setAuth] = useState<'checking' | 'denied' | 'ok'>('checking');
  const [loading, setLoading] = useState(true);
  const [orden, setOrden] = useState<OrdenHeader | null>(null);
  const [items, setItems] = useState<ItemOrden[]>([]);
  const [sending, setSending] = useState(false);
  const [cajaOpen, setCajaOpen] = useState<null | boolean>(null);

  // Guard de sesión y rol
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session) { setAuth('denied'); return; }
      const allowed = await hasAnyRole(['mesero', 'waiter', 'mozo']);
      if (!mounted) return;
      if (!allowed) { setAuth('denied'); return; }
      setAuth('ok');
    })();
    return () => { mounted = false; };
  }, []);

  // Cargar orden + items
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (auth !== 'ok') return;
      // Verificar caja abierta primero
      try {
        const rid = await getCurrentRestaurantId();
        if (!mounted) return;
        if (!rid) { setCajaOpen(false); return; }
        const sesion = await getSesionCajaActiva(rid);
        if (!mounted) return;
        setCajaOpen(!!sesion);
        if (!sesion) return; // No continuamos cargando datos de orden
      } catch (e) {
        console.error('Error verificando caja:', e);
        if (!mounted) return;
        setCajaOpen(false);
        return;
      }
      setLoading(true);
      try {
        const { data: ordenData, error: ordenErr } = await supabase
          .from('ordenes_mesa')
          .select('id, numero_mesa, nombre_mesero, estado, fecha_creacion, monto_total')
          .eq('id', ordenId)
          .maybeSingle();
        if (ordenErr) throw ordenErr;
        if (!mounted) return;
        setOrden(ordenData as unknown as OrdenHeader);

        const { data: itemsData, error: itemsErr } = await supabase
          .from('items_orden_mesa')
          .select(`
            id,
            cantidad,
            precio_unitario,
            precio_total,
            tipo_item,
            combinacion_id,
            combinacion_especial_id,
            generated_combinations ( combination_name ),
            generated_special_combinations ( combination_name )
          `)
          .eq('orden_mesa_id', ordenId)
          .order('id', { ascending: true });
        if (itemsErr) throw itemsErr;
        if (!mounted) return;
        const mapped = (itemsData || []).map((it: any) => ({
          id: it.id,
          cantidad: it.cantidad,
          precio_unitario: it.precio_unitario,
          precio_total: it.precio_total,
          tipo_item: it.tipo_item,
          combinacion_id: it.combinacion_id,
          combinacion_especial_id: it.combinacion_especial_id,
          nombre_producto: it.tipo_item === 'menu_dia'
            ? (it.generated_combinations?.combination_name || 'Menú del día')
            : (it.generated_special_combinations?.combination_name || 'Plato especial')
        })) as ItemOrden[];
        setItems(mapped);
      } catch (e) {
        console.error('Error cargando orden:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [auth, ordenId]);

  if (auth === 'checking') {
    return <div className="h-screen grid place-items-center text-[color:var(--sp-neutral-600)]">Verificando acceso…</div>;
  }
  if (auth === 'denied') {
    return <div className="h-screen grid place-items-center text-[color:var(--sp-neutral-700)]">Acceso restringido</div>;
  }
  if (cajaOpen === false) {
    return (
      <div className="h-screen grid place-items-center p-6">
        <div className="max-w-sm w-full text-center bg-[color:var(--sp-surface-elevated)] border border-[color:var(--sp-border)] rounded-xl p-6">
          <h2 className="font-semibold mb-1 text-[color:var(--sp-neutral-900)]">Caja cerrada</h2>
          <p className="text-sm text-[color:var(--sp-neutral-600)] mb-4">No puedes gestionar órdenes mientras la caja esté cerrada. Pídele al administrador que abra la caja.</p>
          <button onClick={() => router.replace(`/comandas/mesa/${numeroMesa}`)} className="px-4 py-2 rounded-lg border border-[color:var(--sp-border)] text-[color:var(--sp-neutral-900)] text-sm font-medium hover:bg-[color:var(--sp-neutral-100)]">Volver</button>
        </div>
      </div>
    );
  }

  const total = items.reduce((s, it) => s + (Number(it.precio_total) || 0), 0);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-lg font-semibold text-[color:var(--sp-neutral-900)]">Mesa {numeroMesa} · Orden {ordenId}</h1>
          <p className="text-sm text-[color:var(--sp-neutral-600)]">{orden?.nombre_mesero ? `Mesero: ${orden.nombre_mesero}` : 'Mesero no asignado'}</p>
        </div>
        <button
          onClick={() => router.replace(`/comandas/mesa/${numeroMesa}`)}
          className="px-3 py-1.5 rounded-lg border border-[color:var(--sp-border)] text-sm"
        >Volver</button>
      </div>

      <div className="rounded-xl border border-[color:var(--sp-border)] bg-[color:var(--sp-surface-elevated)] p-4">
        {loading ? (
          <div className="text-sm text-[color:var(--sp-neutral-600)]">Cargando orden…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-[color:var(--sp-neutral-700)]">Sin productos aún.</div>
        ) : (
          <ul className="divide-y divide-[color:var(--sp-border)]">
            {items.map((it) => (
              <li key={it.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-[color:var(--sp-neutral-900)]">{it.nombre_producto}</div>
                  <div className="text-xs text-[color:var(--sp-neutral-600)]">{it.tipo_item === 'menu_dia' ? 'Menú del día' : 'Especial'} • Cant: {it.cantidad}</div>
                </div>
                <div className="text-[color:var(--sp-neutral-900)] font-medium">${(it.precio_total || 0).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-[color:var(--sp-neutral-600)]">Total</div>
          <div className="text-base font-semibold text-[color:var(--sp-neutral-900)]">${total.toLocaleString()}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => router.push(`/comandas/mesa/${numeroMesa}/orden/${ordenId}/agregar`)}
          className="px-4 py-2 rounded-lg border border-[color:var(--sp-border)] text-[color:var(--sp-neutral-900)] text-sm font-medium"
        >Agregar productos</button>
        <button
          onClick={async () => {
            try {
              setSending(true);
              // Placeholder: aquí marcaremos estado de orden como 'en_cocina' cuando definamos backend
              await new Promise((r) => setTimeout(r, 600));
              alert('Orden enviada a cocina (placeholder).');
            } finally {
              setSending(false);
            }
          }}
          disabled={sending || items.length === 0}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${items.length === 0 ? 'bg-[color:var(--sp-neutral-200)] text-[color:var(--sp-neutral-600)] cursor-not-allowed' : 'bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)]'}`}
        >{sending ? 'Enviando…' : 'Enviar a cocina'}</button>
      </div>

      <p className="mt-3 text-xs text-[color:var(--sp-neutral-500)]">MVP: pronto selector de productos, notas y cambios de estado reales.</p>
    </div>
  );
}
