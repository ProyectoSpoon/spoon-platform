"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClipboardList, LogOut, Lock } from 'lucide-react';
import { hasAnyRole, getActiveRoles, supabase, getCurrentRestaurantId, getMesasRestaurante, getSesionCajaActiva } from '@spoon/shared/lib/supabase';

const ClipboardListIcon = ClipboardList as any;
const LogOutIcon = LogOut as any;
const LockIcon = Lock as any;

export default function ComandasMobilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Derivar una clave estable de los query params para evitar bucles de renders
  // Nota: useSearchParams() retorna un objeto cuya identidad cambia en cada render.
  // Usar .toString() genera una cadena estable en función del contenido.
  const searchKey = searchParams.toString();
  const [auth, setAuth] = useState<'checking' | 'denied' | 'ok'>('checking');
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [mesas, setMesas] = useState<any[] | null>(null);
  const [loadingMesas, setLoadingMesas] = useState(true);
  const [cajaOpen, setCajaOpen] = useState<null | boolean>(null);
  // Debug opcional (oculto por defecto); habilítalo con NEXT_PUBLIC_COMANDAS_DEBUG=1
  const DEBUG_ENABLED = process.env.NEXT_PUBLIC_COMANDAS_DEBUG === '1' && process.env.NODE_ENV !== 'production';
  const [debug, setDebug] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Verificar sesión
      setDebug((d) => [...d, '[Comandas] Iniciando verificación de sesión']);
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session) {
        setDebug((d) => [...d, '[Comandas] Sin sesión → denied']);
        setAuth('denied');
        return;
      }
      // Guard por rol: mesero (y equivalentes) con fallback de desarrollo
      setDebug((d) => [...d, '[Comandas] Sesión OK. Verificando rol…']);
      const requestedRoles = ['mesero', 'waiter', 'mozo', 'admin', 'administrador', 'owner', 'propietario', 'dueño', 'dueno', 'gerente', 'manager'];
      let allowed = await hasAnyRole(requestedRoles);
      if (!allowed) {
        const detected = await getActiveRoles().catch(() => [] as string[]);
        setDebug((d) => [...d, `[Comandas] Roles detectados: ${Array.isArray(detected) ? detected.join(', ') || '(ninguno)' : '(desconocido)'}]`]);
        if (process.env.NODE_ENV !== 'production') {
          setDebug((d) => [...d, '[Comandas] Dev fallback: permitiendo acceso con sesión activa']);
          allowed = true;
        }
      }
      if (!mounted) return;
      if (!allowed) {
        setDebug((d) => [...d, '[Comandas] Rol NO permitido → denied']);
        setAuth('denied');
        return;
      }
      setDebug((d) => [...d, '[Comandas] Rol permitido → ok']);
      setAuth('ok');

      // Resolver restaurante y estado de caja
      setDebug((d) => [...d, '[Comandas] Obteniendo restaurantId actual…']);
      const rid = await getCurrentRestaurantId();
      if (!mounted) return;
      setRestaurantId(rid);
      if (rid) {
        try {
          setDebug((d) => [...d, `[Comandas] Verificando caja abierta para restaurante ${rid}…`]);
          const sesion = await getSesionCajaActiva(rid);
          if (!mounted) return;
          const abierta = !!sesion;
          setCajaOpen(abierta);
          setDebug((d) => [...d, `[Comandas] Caja ${abierta ? 'abierta' : 'cerrada'}`]);
          if (!abierta) {
            // Caja cerrada: no cargamos mesas ni hacemos deep-link
            setLoadingMesas(false);
            return;
          }
        } catch (e) {
          setDebug((d) => [...d, `[Comandas] Error verificando caja: ${(e as Error)?.message ?? 'desconocido'}`]);
          if (!mounted) return;
          setCajaOpen(false);
          setLoadingMesas(false);
          return;
        }

        // Deep-link inmediato si viene ?mesa= (solo si caja está abierta)
        const mesaParamLocal = new URLSearchParams(searchKey).get('mesa');
        if (mesaParamLocal) {
          setDebug((d) => [...d, `[Comandas] Deep-link detectado mesa=${mesaParamLocal} → redirect /comandas/mesa/${mesaParamLocal}`]);
          router.replace(`/comandas/mesa/${mesaParamLocal}`);
          return; // evitamos cargar mesas innecesariamente en este render
        }

        // Traer mesas configuradas
        try {
          setDebug((d) => [...d, `[Comandas] restaurantId=${rid}. Cargando mesas…`]);
          setLoadingMesas(true);
          const data = await getMesasRestaurante(rid);
          if (!mounted) return;
          setMesas(data);
          setDebug((d) => [...d, `[Comandas] Mesas cargadas: ${Array.isArray(data) ? data.length : 0}`]);
        } catch (e) {
          console.error('Error cargando mesas:', e);
          setDebug((d) => [...d, `[Comandas] Error cargando mesas: ${(e as Error)?.message ?? 'desconocido'}`]);
          if (!mounted) return;
          setMesas([]);
        } finally {
          if (mounted) setLoadingMesas(false);
        }
      } else {
        setDebug((d) => [...d, '[Comandas] No hay restaurantId']);
        setLoadingMesas(false);
      }
    })();

    return () => { mounted = false; };
  // Solo volver a ejecutar si cambia el contenido de los query params
  }, [searchKey, router]);
  // Manejo de deep-link: solo para mostrar el número de mesa en encabezado si está presente
  const mesaParam = searchParams.get('mesa');

  if (auth === 'checking') {
    return (
      <div className="h-screen flex items-center justify-center text-[color:var(--sp-neutral-600)]">Verificando acceso…</div>
    );
  }

  if (auth === 'denied') {
    return (
      <div className="h-screen flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center bg-[color:var(--sp-surface-elevated)] border border-[color:var(--sp-border)] rounded-xl p-6">
          <div className="mx-auto mb-3 p-3 bg-[color:var(--sp-error-50)] rounded-lg w-12 h-12 flex items-center justify-center">
            <LockIcon className="h-6 w-6 text-[color:var(--sp-error-600)]" />
          </div>
          <h2 className="font-semibold mb-1 text-[color:var(--sp-neutral-900)]">Acceso restringido</h2>
          <p className="text-sm text-[color:var(--sp-neutral-600)] mb-4">Debes iniciar sesión como mesero para usar Comandas.</p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace('/auth');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[color:var(--sp-neutral-900)] text-[color:var(--sp-on-primary)] text-sm font-medium hover:opacity-90"
          >
            <LogOutIcon className="h-4 w-4" />
            Ir a iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  // auth === 'ok'

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl bg-[color:var(--sp-primary-50)] text-[color:var(--sp-primary-700)] border border-[color:var(--sp-primary-200)]">
          <ClipboardListIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold leading-tight text-[color:var(--sp-neutral-900)]">Comandas (Móvil)</h1>
          <p className="text-sm text-[color:var(--sp-neutral-600)]">Toma de órdenes para meseros{mesaParam ? ` • Mesa ${mesaParam}` : ''}</p>
        </div>
      </div>

      {cajaOpen === false ? (
        <div className="rounded-2xl border border-[color:var(--sp-warning-200)] bg-[color:var(--sp-warning-50)] p-10 text-center">
          <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-[color:var(--sp-warning-100)] flex items-center justify-center text-[color:var(--sp-warning-700)]">
            <LockIcon className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold text-[color:var(--sp-warning-900)] mb-1">No hay caja abierta</h2>
          <p className="text-sm text-[color:var(--sp-warning-800)]">Cuando el administrador abra la caja, Comandas se habilitará automáticamente.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[color:var(--sp-border)] bg-[color:var(--sp-surface-elevated)] p-6">
          {loadingMesas ? (
            <div className="text-sm text-[color:var(--sp-neutral-600)]">Cargando mesas…</div>
          ) : !restaurantId ? (
            <div className="text-sm text-[color:var(--sp-neutral-700)]">
              No se pudo identificar el restaurante del usuario.
            </div>
          ) : (mesas && mesas.length > 0 ? (
            <div>
              <h2 className="font-medium mb-3 text-[color:var(--sp-neutral-900)]">Selecciona una mesa</h2>
              <div className="grid grid-cols-3 gap-3">
                {mesas.map((m) => (
                  <button
                    key={m.numero}
                    className="aspect-square rounded-lg border border-[color:var(--sp-border)] bg-[color:var(--sp-surface)] flex items-center justify-center text-[color:var(--sp-neutral-900)] text-sm font-medium hover:bg-[color:var(--sp-neutral-100)]"
                    onClick={() => {
                      // Navegar directo a la mesa
                      // eslint-disable-next-line no-console
                      console.log('[Comandas] Click mesa →', m.numero);
                      router.push(`/comandas/mesa/${m.numero}`);
                    }}
                  >
                    Mesa {m.numero}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-[color:var(--sp-neutral-700)]">
              Aún no hay mesas configuradas para este restaurante. Configúralas desde el dashboard (Administrador).
            </div>
          ))}
        </div>
      )}

      {DEBUG_ENABLED && (
        <div className="mt-4 text-xs text-[color:var(--sp-neutral-500)] whitespace-pre-wrap">
          Estado: auth={auth} · restaurantId={restaurantId ?? 'null'} · mesas={Array.isArray(mesas) ? mesas.length : 'null'} · loadingMesas={String(loadingMesas)}
          {'\n'}Logs:
          {'\n'}{debug.join('\n')}
        </div>
      )}
    </div>
  );
}
