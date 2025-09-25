"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, hasAnyRole, agregarItemsAOrden, getCurrentRestaurantId, getSesionCajaActiva } from '@spoon/shared/lib/supabase';

type Combo = { id: string; combination_name: string; combination_price: number };

export default function AgregarProductosPage({ params }: { params: { numero: string; ordenId: string } }) {
  const router = useRouter();
  const numeroMesa = useMemo(() => Number(params.numero), [params.numero]);
  const ordenId = params.ordenId;
  const [auth, setAuth] = useState<'checking' | 'denied' | 'ok'>('checking');
  const [loading, setLoading] = useState(true);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [especiales, setEspeciales] = useState<Combo[]>([]);
  const [adding, setAdding] = useState<string | null>(null);
  const [cajaOpen, setCajaOpen] = useState<null | boolean>(null);

  // Guard de sesión/rol
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

  // Cargar productos simples (MVP)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (auth !== 'ok') return;
      // Verificar caja abierta antes de permitir agregar
      try {
        const rid = await getCurrentRestaurantId();
        if (!mounted) return;
        if (!rid) { setCajaOpen(false); return; }
        const sesion = await getSesionCajaActiva(rid);
        if (!mounted) return;
        const abierta = !!sesion;
        setCajaOpen(abierta);
        if (!abierta) return;
      } catch (e) {
        console.error('Error verificando caja:', e);
        if (!mounted) return;
        setCajaOpen(false);
        return;
      }
      setLoading(true);
      try {
        const [{ data: c }, { data: e }] = await Promise.all([
          supabase.from('generated_combinations').select('id, combination_name, combination_price').order('id'),
          supabase.from('generated_special_combinations').select('id, combination_name, combination_price').order('id')
        ]);
        if (!mounted) return;
        setCombos((c || []) as Combo[]);
        setEspeciales((e || []) as Combo[]);
      } catch (err) {
        console.error('Error cargando combos/especiales:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [auth]);

  const handleAdd = async (tipo: 'menu_dia' | 'especial', combo: Combo) => {
    try {
      setAdding(combo.id);
      await agregarItemsAOrden(ordenId, [{
        tipoItem: tipo,
        cantidad: 1,
        precioUnitario: Number(combo.combination_price) || 0,
        combinacionId: tipo === 'menu_dia' ? combo.id : undefined,
        combinacionEspecialId: tipo === 'especial' ? combo.id : undefined
      }]);
      // Volver a la orden para ver el agregado
      router.replace(`/comandas/mesa/${numeroMesa}/orden/${ordenId}`);
    } catch (e) {
      console.error('Error agregando item:', e);
      alert('No se pudo agregar el producto.');
    } finally {
      setAdding(null);
    }
  };

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
          <p className="text-sm text-[color:var(--sp-neutral-600)] mb-4">No puedes agregar productos mientras la caja esté cerrada. Pídele al administrador que abra la caja.</p>
          <button onClick={() => router.replace(`/comandas/mesa/${numeroMesa}/orden/${ordenId}`)} className="px-4 py-2 rounded-lg border border-[color:var(--sp-border)] text-[color:var(--sp-neutral-900)] text-sm font-medium hover:bg-[color:var(--sp-neutral-100)]">Volver a la orden</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-lg font-semibold text-[color:var(--sp-neutral-900)]">Agregar productos · Mesa {params.numero}</h1>
      <p className="text-sm text-[color:var(--sp-neutral-600)]">MVP: tocar un producto lo agrega a la orden con cantidad 1.</p>

      <div className="mt-4 grid grid-cols-1 gap-6">
        <section>
          <h2 className="font-medium text-[color:var(--sp-neutral-900)] mb-2">Menú del día</h2>
          <div className="rounded-xl border border-[color:var(--sp-border)] bg-[color:var(--sp-surface-elevated)] p-3">
            {loading ? (
              <div className="text-sm text-[color:var(--sp-neutral-600)]">Cargando…</div>
            ) : combos.length === 0 ? (
              <div className="text-sm text-[color:var(--sp-neutral-600)]">Sin combos disponibles.</div>
            ) : (
              <ul className="divide-y divide-[color:var(--sp-border)]">
                {combos.map((c) => (
                  <li key={`m-${c.id}`} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="text-[color:var(--sp-neutral-900)]">{c.combination_name}</div>
                      <div className="text-xs text-[color:var(--sp-neutral-600)]">${Number(c.combination_price || 0).toLocaleString()}</div>
                    </div>
                    <button
                      disabled={adding === c.id}
                      onClick={() => handleAdd('menu_dia', c)}
                      className="px-3 py-1.5 rounded-lg border border-[color:var(--sp-border)] text-sm"
                    >{adding === c.id ? 'Agregando…' : 'Agregar'}</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-medium text-[color:var(--sp-neutral-900)] mb-2">Especiales</h2>
          <div className="rounded-xl border border-[color:var(--sp-border)] bg-[color:var(--sp-surface-elevated)] p-3">
            {loading ? (
              <div className="text-sm text-[color:var(--sp-neutral-600)]">Cargando…</div>
            ) : especiales.length === 0 ? (
              <div className="text-sm text-[color:var(--sp-neutral-600)]">Sin especiales disponibles.</div>
            ) : (
              <ul className="divide-y divide-[color:var(--sp-border)]">
                {especiales.map((e) => (
                  <li key={`e-${e.id}`} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="text-[color:var(--sp-neutral-900)]">{e.combination_name}</div>
                      <div className="text-xs text-[color:var(--sp-neutral-600)]">${Number(e.combination_price || 0).toLocaleString()}</div>
                    </div>
                    <button
                      disabled={adding === e.id}
                      onClick={() => handleAdd('especial', e)}
                      className="px-3 py-1.5 rounded-lg border border-[color:var(--sp-border)] text-sm"
                    >{adding === e.id ? 'Agregando…' : 'Agregar'}</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <Link href={`/comandas/mesa/${params.numero}/orden/${params.ordenId}`} className="inline-block mt-4 px-4 py-2 rounded-lg border border-[color:var(--sp-border)] text-sm">Volver a la orden</Link>
    </div>
  );
}
