'use client';

import React from 'react';
import { Plus as PlusRaw, Minus as MinusRaw, ShoppingCart as ShoppingCartRaw } from 'lucide-react';
const Plus: any = PlusRaw;
const Minus: any = MinusRaw;
const ShoppingCart: any = ShoppingCartRaw;
import { MenuDelDiaSimple, ItemPedido } from '../../types/domiciliosTypes';
// Carga de especiales desde el paquete compartido
// Tipado laxo para no bloquear por tipos del paquete compartido
import { useSpecialData as useSpecialDataRaw } from '@spoon/shared/hooks/special-dishes/useSpecialData';
const useSpecialData: any = useSpecialDataRaw as any;
import { DEFAULT_DELIVERY_FEE } from '../../constants/domiciliosConstants';
// Obtener especiales disponibles hoy desde Supabase (RPC)
import * as SharedAny from '@spoon/shared';
const getAvailableSpecialsToday: any = (SharedAny as any)?.getAvailableSpecialsToday;

type ItemSinSubtotal = Omit<ItemPedido, 'subtotal'>;

interface MenuStepProps {
  menu: MenuDelDiaSimple;
  items: ItemSinSubtotal[];
  agregarItem: (combinacionId: string) => void;
  agregarItemEspecial: (nombre: string, precio: number) => void;
  actualizarCantidad: (index: number, cantidad: number) => void;
  calcularSubtotal: (item: ItemSinSubtotal) => number;
  subtotalItems: number;
  totalPedido: number;
  onNext: () => void;
}

const formatMoney = (valor: number) => '$' + valor.toLocaleString('es-CO');
// Truncar texto a un fragmento controlado
const truncate = (s: string, n: number) => (typeof s === 'string' && s.length > n ? s.slice(0, n).trimEnd() + '…' : s);

export default function MenuStep({ menu, items, agregarItem, agregarItemEspecial, actualizarCantidad, calcularSubtotal, subtotalItems, totalPedido, onNext }: MenuStepProps) {
  const itemsCount = items.reduce((acc, it) => acc + it.quantity, 0);
  const [tab, setTab] = React.useState<'combinaciones' | 'especial'>('combinaciones');

  // Datos de platos especiales (listado global configurado en Carta > Especiales)
  const specialData: any = useSpecialData?.() ?? {};
  const specials: any[] = Array.isArray(specialData?.specialDishes) ? specialData.specialDishes : [];
  const specialsLoading: boolean = !!specialData?.initialLoading;
  const activeSpecials: any[] = specials.filter((d: any) => d?.is_active);
  // Carga directa de especiales disponibles hoy (RPC) para mayor fidelidad
  const [availableSpecials, setAvailableSpecials] = React.useState<any[] | null>(null);
  const [availableLoading, setAvailableLoading] = React.useState(false);

  React.useEffect(() => {
    const restaurantId = specialData?.restaurantId;
    if (!restaurantId) return;
    let cancelled = false;
    setAvailableLoading(true);
    Promise.resolve(getAvailableSpecialsToday?.(restaurantId))
      .then((data: any[]) => {
        if (cancelled) return;
        if (Array.isArray(data)) setAvailableSpecials(data);
      })
      .catch((err: any) => {
        console.warn('No se pudo cargar especiales (RPC), uso fallback is_active', err);
      })
      .finally(() => !cancelled && setAvailableLoading(false));
    return () => { cancelled = true; };
  }, [specialData?.restaurantId]);

  // Preferir RPC pero incluir también los activos no incluidos por la RPC (union)
  // Genera una llave estable SIEMPRE de tipo string para evitar colisiones 'undefined' que oculten items.
  const getDishKey = (d: any): string => {
    const id = d?.id ?? d?.special_dish_id ?? d?.dish_id;
    const slug = d?.slug;
    if (id !== undefined && id !== null && id !== '') return `id:${String(id)}`;
    if (slug) return `slug:${String(slug)}`;
    const name = d?.dish_name ?? d?.name ?? '';
    const price = d?.dish_price ?? d?.price ?? '';
    const desc = d?.dish_description ?? d?.description ?? '';
    return `meta:${String(name).trim().toLowerCase()}|${String(price)}|${String(desc).trim().toLowerCase().slice(0, 32)}`;
  };
  const availableIds = new Set((availableSpecials || []).map((d: any) => getDishKey(d)));
  const displaySpecials: any[] = (availableSpecials && availableSpecials.length > 0)
    ? [
        ...availableSpecials,
  ...activeSpecials.filter((d: any) => !availableIds.has(getDishKey(d)))
      ]
    : activeSpecials;

  // Se elimina la opción de crear un especial manual desde este modal.

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8">
        <div className="mb-3 flex items-center gap-2" role="tablist" aria-label="Tipo de menú">
          <button
            role="tab"
            aria-selected={tab==='combinaciones'}
            className={`px-3 py-1.5 text-sm rounded-md border ${tab==='combinaciones' ? 'bg-[color:var(--sp-neutral-100)] font-medium' : ''}`}
            onClick={()=> setTab('combinaciones')}
          >Menú con combinaciones</button>
          <button
            role="tab"
            aria-selected={tab==='especial'}
            className={`px-3 py-1.5 text-sm rounded-md border ${tab==='especial' ? 'bg-[color:var(--sp-neutral-100)] font-medium' : ''}`}
            onClick={()=> setTab('especial')}
          >Menú especial</button>
        </div>

        {tab === 'combinaciones' && (
          <>
            <h3 className="heading-section mb-3">Selecciona combinaciones</h3>
            {/* Una tarjeta por fila en todos los breakpoints */}
            <div className="grid gap-4 grid-cols-1 items-stretch" role="list" aria-label="Combinaciones disponibles">
              {menu.combinaciones.filter(c => c.is_available).map((c) => (
                <div key={c.id} role="listitem" className="group h-full">
                  <button
                    type="button"
                    onClick={() => agregarItem(c.id)}
                    className="relative w-full h-full text-left border border-[color:var(--sp-neutral-200)] rounded-lg p-4 hover:border-[color:var(--sp-primary-300)] focus-visible:border-[color:var(--sp-primary-400)] focus-visible:ring-2 focus-visible:ring-[color:var(--sp-primary-200)] outline-none transition-colors bg-[--sp-surface] hover:shadow-sm flex flex-col"
                    aria-label={`Agregar ${c.combination_name}`}
                  >
                    <div className="pr-8">
                      <h4
                        title={c.combination_name}
                        className="text-base font-medium text-[color:var(--sp-neutral-900)] break-words"
                      >
                        {c.combination_name}
                      </h4>
                      {c.combination_description && (
                        <p className="mt-1 text-sm text-[color:var(--sp-neutral-700)] break-words">
                          {c.combination_description}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 pr-8 flex items-center justify-between">
                      <p className="text-base font-semibold text-[color:var(--sp-neutral-900)]">{formatMoney(c.combination_price)}</p>
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-[color:var(--sp-neutral-200)] text-[color:var(--sp-neutral-800)] group-hover:bg-[color:var(--sp-neutral-300)] border border-[color:var(--sp-neutral-300)]">
                        <Plus className="w-4 h-4" />
                      </span>
                    </div>
                    {/* Indicador accesible de acción */}
                    <span className="sr-only">Agregar al carrito</span>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'especial' && (
          <div className="space-y-4">
            {/* Listado de especiales activos (1 por fila) */}
            <div className="bg-[--sp-surface-elevated] border border-[color:var(--sp-neutral-200)] rounded-lg p-4">
              <h3 className="heading-section mb-3">Platos especiales del restaurante</h3>
        {specialsLoading || availableLoading ? (
                <div className="flex items-center gap-3 text-[color:var(--sp-on-surface-variant)]">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[color:var(--sp-primary-600)]"></div>
                  <span className="text-sm">Cargando especiales…</span>
                </div>
        ) : displaySpecials.length === 0 ? (
                <p className="text-sm text-[color:var(--sp-on-surface-variant)]">No hay platos especiales activos hoy.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3" role="list" aria-label="Platos especiales disponibles">
                  {displaySpecials.map((dish: any, idx: number) => {
                    // Alinear con Supabase: useSpecialData -> getRestaurantSpecialDishes retorna dish_name, dish_description, dish_price
                    const name = dish?.dish_name ?? dish?.name ?? 'Especial';
                    const price: number = Number(dish?.dish_price ?? dish?.price ?? 0) || 0;
                    const descriptionFull = dish?.dish_description ?? dish?.description ?? '';
                    const imageUrl = dish?.image_url || (specialData?.specialImages?.[dish?.id] ?? '');
                    const imageAlt = dish?.image_alt || name;
                    const baseKey = getDishKey(dish);
                    const key = `${baseKey}-${idx}`;
                    const isToday = availableIds.has(baseKey);
                    const description = truncate(descriptionFull, 100);
                    return (
                      <div key={key} role="listitem" className="group">
                        <button
                          type="button"
                          onClick={() => agregarItemEspecial(name, Math.round(price))}
                          className="w-full text-left border border-[color:var(--sp-neutral-200)] rounded-lg p-4 hover:border-[color:var(--sp-primary-300)] focus-visible:border-[color:var(--sp-primary-400)] focus-visible:ring-2 focus-visible:ring-[color:var(--sp-primary-200)] outline-none transition-colors bg-[--sp-surface] hover:shadow-sm"
                          aria-label={`Agregar especial ${name}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            {/* Imagen del especial si existe */}
                            {imageUrl ? (
                              <div className="shrink-0">
                                <img
                                  src={imageUrl}
                                  alt={imageAlt}
                                  className="w-16 h-16 rounded-md object-cover border border-[color:var(--sp-neutral-200)]"
                                  loading="lazy"
                                />
                              </div>
                            ) : null}
                            <div className="min-w-0 pr-4">
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-medium text-[color:var(--sp-neutral-900)] truncate">{name}</h4>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border ${isToday ? 'bg-[color:var(--sp-success-50)] text-[color:var(--sp-success-800)] border-[color:var(--sp-success-200)]' : 'bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-700)] border-[color:var(--sp-neutral-200)]'}`}>
                                  {isToday ? 'Hoy' : 'Activo'}
                                </span>
                              </div>
                              {description && (
                                <p className="mt-1 text-sm text-[color:var(--sp-neutral-700)]">{description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-semibold text-[color:var(--sp-neutral-900)]">{formatMoney(price)}</span>
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-[color:var(--sp-neutral-200)] text-[color:var(--sp-neutral-800)] group-hover:bg-[color:var(--sp-neutral-300)] border border-[color:var(--sp-neutral-300)]">
                                <Plus className="w-4 h-4" />
                              </span>
                            </div>
                          </div>
                          <span className="sr-only">Agregar al carrito</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Se eliminó el formulario manual para especiales. */}
          </div>
        )}
      </div>

      {/* Carrito lateral */}
      <aside className="lg:col-span-4 lg:sticky lg:top-4">
        <div className="bg-[--sp-surface-elevated] rounded-lg border border-[color:var(--sp-neutral-200)] p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-[color:var(--sp-neutral-900)] flex items-center"><ShoppingCart className="w-4 h-4 mr-2" /> Carrito</h4>
            <span className="text-xs text-[color:var(--sp-neutral-600)]">{itemsCount} item(s)</span>
          </div>
          <div className="mt-3 space-y-2 max-h-80 overflow-auto pr-1">
            {items.length === 0 && (
              <p className="text-sm text-[color:var(--sp-neutral-600)]">Aún no has agregado items.</p>
            )}
            {items.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 p-2 rounded hover:bg-[color:var(--sp-neutral-50)]">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[color:var(--sp-neutral-900)]">{it.combination_name}</p>
                  <p className="text-xs text-[color:var(--sp-neutral-600)]">{formatMoney(calcularSubtotal(it))}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Disminuir cantidad" onClick={()=>actualizarCantidad(idx, it.quantity - 1)} className="p-1.5 rounded hover:bg-[color:var(--sp-neutral-200)]"><Minus className="w-4 h-4" /></button>
                  <span className="w-6 text-center text-sm">{it.quantity}</span>
                  <button type="button" aria-label="Incrementar cantidad" onClick={()=>actualizarCantidad(idx, it.quantity + 1)} className="p-1.5 rounded hover:bg-[color:var(--sp-neutral-200)]"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(items.length ? subtotalItems : 0)}</span></div>
            <div className="flex justify-between"><span>Domicilio</span><span>{formatMoney(items.length ? DEFAULT_DELIVERY_FEE : 0)}</span></div>
            <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span>{formatMoney(items.length ? totalPedido : 0)}</span></div>
          </div>
          <button
            type="button"
            onClick={onNext}
            disabled={items.length === 0}
            className="mt-3 w-full px-4 py-2 bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] rounded-lg hover:bg-[color:var(--sp-primary-700)] disabled:opacity-50"
          >
            Continuar
          </button>
        </div>
      </aside>

      {/* Barra móvil inferior para continuar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[--sp-surface-elevated] border-t border-[color:var(--sp-neutral-200)] p-3 flex items-center justify-between gap-3" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
  <div className="text-xs text-[color:var(--sp-neutral-700)]">
          <span className="font-medium">{itemsCount}</span> item(s) · <span className="font-medium">{formatMoney(totalPedido)}</span>
        </div>
        <button type="button" onClick={onNext} disabled={items.length===0} className="px-4 py-2 bg-[color:var(--sp-primary-600)] text-[--sp-on-primary] rounded-lg disabled:opacity-50">Continuar</button>
      </div>
    </div>
  );
}
