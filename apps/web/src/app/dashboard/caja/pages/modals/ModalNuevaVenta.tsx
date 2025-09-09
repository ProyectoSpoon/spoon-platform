'use client';

import React from 'react';
import { Button as ButtonRaw } from '@spoon/shared/components/ui/Button';
import { Input as InputRaw } from '@spoon/shared/components/ui/Input';
import { METODOS_PAGO } from '../../constants/cajaConstants';
import { formatCurrencyCOP } from '@spoon/shared/lib/utils';
import type { MetodoPago } from '../../types/cajaTypes';
import { useMenuDelDia } from '../../../domicilios/hooks/useMenuDelDia';
import { DEFAULT_DELIVERY_FEE } from '../../../domicilios/constants/domiciliosConstants';
import { DEFAULT_PACKAGING_FEE } from '../../../domicilios/constants/domiciliosConstants';
import { X, Pencil, Search, ShoppingCart, Trash2 } from 'lucide-react';

// Cast temporales para evitar conflicto de múltiples definiciones de React en monorepo
// TODO: remover cuando se unifiquen versiones de react & @types/react
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Button = ButtonRaw as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Input = InputRaw as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const XIcon = X as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PencilIcon = Pencil as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SearchIcon = Search as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ShoppingCartIcon = ShoppingCart as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Trash2Icon = Trash2 as any;

export interface ItemSeleccionado {
  id: string;
  nombre: string;
  precio: number; // centavos
  cantidad: number;
}

export interface NuevaVentaPayload {
  items: ItemSeleccionado[];
  deliveryFee: number; // centavos
  packagingFee: number; // centavos
  metodoPago: MetodoPago;
  montoRecibido?: number; // centavos si efectivo
  total: number; // centavos
  notas?: string;
}

interface ModalNuevaVentaProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (venta: NuevaVentaPayload) => Promise<{ success: boolean; cambio?: number; error?: string }>;
  loading?: boolean;
}

const formatCurrency = (cents: number) => formatCurrencyCOP(cents);

const ModalNuevaVenta: React.FC<ModalNuevaVentaProps> = ({ 
  isOpen, 
  onClose, 
  onConfirmar, 
  loading = false 
}) => {
  const { menu, combinacionesDisponibles, loading: loadingMenu, error: menuError } = useMenuDelDia();
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [seleccion, setSeleccion] = React.useState<Record<string, ItemSeleccionado>>({});
  const [deliveryFee, setDeliveryFee] = React.useState<number>(DEFAULT_DELIVERY_FEE);
  const [packagingFee, setPackagingFee] = React.useState<number>(DEFAULT_PACKAGING_FEE); // 1.000 COP en centavos
  const [includeDelivery, setIncludeDelivery] = React.useState<boolean>(false);
  const [includePackaging, setIncludePackaging] = React.useState<boolean>(false);
  const [showDeliveryModal, setShowDeliveryModal] = React.useState<boolean>(false);
  const [showPackagingModal, setShowPackagingModal] = React.useState<boolean>(false);
  const [deliveryEditValue, setDeliveryEditValue] = React.useState<number>(DEFAULT_DELIVERY_FEE / 100);
  const [packagingEditValue, setPackagingEditValue] = React.useState<number>(1000); // 1.000 COP en pesos
  const [metodoPago, setMetodoPago] = React.useState<MetodoPago>('efectivo');
  const [montoRecibido, setMontoRecibido] = React.useState<number>(0);
  const [errorLocal, setErrorLocal] = React.useState<string | null>(null);
  const [exito, setExito] = React.useState<{ cambio: number } | null>(null);
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setSeleccion({});
      setDeliveryFee(DEFAULT_DELIVERY_FEE);
  setPackagingFee(DEFAULT_PACKAGING_FEE); // reset 1.000 COP en centavos
      setIncludeDelivery(false);
      setIncludePackaging(false);
      setShowDeliveryModal(false);
      setShowPackagingModal(false);
      setDeliveryEditValue(DEFAULT_DELIVERY_FEE / 100);
  setPackagingEditValue(1000); // reset 1.000 COP en pesos
      setMetodoPago('efectivo');
      setMontoRecibido(0);
      setErrorLocal(null);
      setExito(null);
      setSearchTerm('');
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const itemsSeleccionados: ItemSeleccionado[] = React.useMemo(() => 
    Object.values(seleccion).filter(i => i.cantidad > 0), [seleccion]
  );
  
  const subtotal = React.useMemo(() => 
    itemsSeleccionados.reduce((sum, it) => sum + it.precio * it.cantidad, 0), [itemsSeleccionados]
  );
  
  const cargos = (includeDelivery ? deliveryFee : 0) + (includePackaging ? packagingFee : 0);
  const total = subtotal + cargos;
  const cambio = metodoPago === 'efectivo' ? Math.max(0, (montoRecibido || 0) - total) : 0;

  // Filtrar combinaciones por búsqueda
  const combinacionesFiltradas = React.useMemo(() => {
    if (!combinacionesDisponibles) return [];
    if (!searchTerm.trim()) return combinacionesDisponibles;
    
    const term = searchTerm.toLowerCase();
    return combinacionesDisponibles.filter((comb: any) => 
      comb.combination_name?.toLowerCase().includes(term) ||
      comb.combination_description?.toLowerCase().includes(term)
    );
  }, [combinacionesDisponibles, searchTerm]);

  const eliminarItem = (id: string) => {
    setSeleccion(prev => {
      const { [id]: _omit, ...rest } = prev as any;
      return rest as Record<string, ItemSeleccionado>;
    });
  };

  const incrementar = (id: string, nombre: string, precioPesos: number) => {
    const precio = Math.round((precioPesos || 0) * 100);
    setSeleccion(prev => {
      const actual = prev[id] || { id, nombre, precio, cantidad: 0 };
      return { ...prev, [id]: { ...actual, precio, cantidad: actual.cantidad + 1 } };
    });
  };

  const decrementar = (id: string) => {
    setSeleccion(prev => {
      const actual = prev[id];
      if (!actual) return prev;
      const nuevaCantidad = Math.max(0, actual.cantidad - 1);
      const next = { ...prev, [id]: { ...actual, cantidad: nuevaCantidad } };
      if (nuevaCantidad === 0) {
        const { [id]: _omit, ...rest } = next as any;
        return rest as Record<string, ItemSeleccionado>;
      }
      return next;
    });
  };

  const handleConfirmar = async () => {
    if (itemsSeleccionados.length === 0) {
      setErrorLocal('Selecciona al menos 1 ítem');
      return;
    }
    if (metodoPago === 'efectivo' && montoRecibido < total) {
      setErrorLocal('El monto recibido no puede ser menor al total');
      return;
    }
    setErrorLocal(null);

    const payload: NuevaVentaPayload = {
      items: itemsSeleccionados,
      deliveryFee: includeDelivery ? deliveryFee : 0,
      packagingFee: includePackaging ? packagingFee : 0,
      metodoPago,
      montoRecibido: metodoPago === 'efectivo' ? montoRecibido : undefined,
      total
    };

    const res = await onConfirmar(payload);
    if (res.success) {
      setExito({ cambio: res.cambio || 0 });
      if ((res.cambio || 0) === 0) setTimeout(() => onClose(), 1500);
    } else {
      setErrorLocal(res.error || 'Error procesando la venta');
    }
  };

  if (!isOpen) return null;

  // Vista de éxito
  if (exito) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-[color:var(--sp-overlay)] backdrop-blur-sm" onClick={onClose} />
        <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[color:var(--sp-surface-elevated)] shadow-xl p-6 flex flex-col items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-base font-semibold text-[color:var(--sp-neutral-900)]">✅ Venta registrada</div>
            <div className="text-sm text-[color:var(--sp-neutral-700)]">Cambio: {formatCurrency(exito.cambio)}</div>
          </div>
          <Button onClick={onClose} className="mt-4 w-full">Continuar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-[color:var(--sp-overlay)] backdrop-blur-sm" onClick={onClose} />
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-4xl bg-[color:var(--sp-surface-elevated)] shadow-xl transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isAnimating ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 border-b bg-[color:var(--sp-surface)] sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--sp-neutral-900)]">Nueva venta</h2>
            <p className="text-sm text-[color:var(--sp-neutral-600)] mt-0.5">
              Selecciona ítems del menú y registra el pago
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading || loadingMenu}>
            <XIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Content - 2 Columns */}
        <div className="flex h-[calc(100%-80px)]">
          {/* Left Column - Menu */}
          <div className="flex-1 flex flex-col bg-[color:var(--sp-surface)]">
            {/* Menu Header */}
            <div className="p-5 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-[color:var(--sp-neutral-900)]">Menú del día</h3>
                {menu && (
                  <span className="text-sm text-[color:var(--sp-neutral-600)] bg-[color:var(--sp-neutral-100)] px-3 py-1 rounded-full">
                    {menu.menu_date}
                  </span>
                )}
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--sp-neutral-400)] w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar plato..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-5">
              {loadingMenu ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-sm text-[color:var(--sp-neutral-600)]">Cargando menú...</div>
                </div>
              ) : menuError ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-sm text-[color:var(--sp-error-600)]">{menuError}</div>
                </div>
              ) : combinacionesFiltradas.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="text-sm text-[color:var(--sp-neutral-600)]">
                      {searchTerm ? 'No se encontraron platos' : 'No hay combinaciones disponibles hoy'}
                    </div>
                    {searchTerm && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSearchTerm('')}
                        className="mt-2"
                      >
                        Limpiar búsqueda
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {combinacionesFiltradas.map((comb: any) => {
                    const cantidad = seleccion[comb.id]?.cantidad || 0;
                    const isSelected = cantidad > 0;
                    
                    return (
                      <div 
                        key={comb.id} 
                        className={`flex items-center p-3 border rounded-lg bg-[color:var(--sp-surface-elevated)] transition-all duration-200 hover:border-[color:var(--sp-primary-300)] hover:shadow-sm ${
                          isSelected ? 'border-[color:var(--sp-primary-300)] bg-[color:var(--sp-primary-50)]' : 'border-[color:var(--sp-neutral-200)]'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-[color:var(--sp-neutral-900)] mb-1">
                            {comb.combination_name}
                          </div>
                          {comb.combination_description && (
                            <div className="text-xs text-[color:var(--sp-neutral-600)] line-clamp-2">
                              {comb.combination_description}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-sm font-semibold text-[color:var(--sp-neutral-900)] mx-4">
                          {formatCurrency(Math.round((comb.combination_price || 0) * 100))}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => decrementar(comb.id)}
                            className="w-8 h-8 p-0"
                            disabled={cantidad === 0}
                          >
                            -
                          </Button>
                          <span className="w-6 text-center text-sm font-medium">
                            {cantidad}
                          </span>
                          <Button 
                            size="sm" 
                            onClick={() => incrementar(comb.id, comb.combination_name, comb.combination_price)}
                            className="w-8 h-8 p-0 bg-[color:var(--sp-warning-600)] hover:bg-[color:var(--sp-warning-700)]"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="w-80 border-l bg-[color:var(--sp-surface-elevated)] flex flex-col">
            {/* Order Header */}
            <div className="p-5 border-b">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCartIcon className="w-4 h-4 text-[color:var(--sp-neutral-600)]" />
                <h3 className="text-base font-semibold text-[color:var(--sp-neutral-900)]">
                  Resumen de orden
                </h3>
              </div>
              
              {/* Delivery Options */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIncludeDelivery(v => !v)}
                  className={`p-2 text-xs border rounded-lg transition-colors text-center ${
                    includeDelivery 
                      ? 'bg-[color:var(--sp-success-100)] border-[color:var(--sp-success-300)] text-[color:var(--sp-success-800)]' 
                      : 'bg-[color:var(--sp-neutral-50)] border-[color:var(--sp-neutral-200)] text-[color:var(--sp-neutral-600)]'
                  }`}
                >
                  <div className="mb-1">Domicilio</div>
                  <div className="font-medium text-xs">{formatCurrency(deliveryFee)}</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setIncludePackaging(v => !v)}
                  className={`p-2 text-xs border rounded-lg transition-colors text-center ${
                    includePackaging 
                      ? 'bg-[color:var(--sp-success-100)] border-[color:var(--sp-success-300)] text-[color:var(--sp-success-800)]' 
                      : 'bg-[color:var(--sp-neutral-50)] border-[color:var(--sp-neutral-200)] text-[color:var(--sp-neutral-600)]'
                  }`}
                >
                  <div className="mb-1">Recipientes</div>
                  <div className="font-medium text-xs">{formatCurrency(packagingFee)}</div>
                </button>
              </div>
              
              <div className="flex justify-center gap-4 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setDeliveryEditValue(deliveryFee / 100);
                    setShowDeliveryModal(true);
                  }}
                  className="text-xs"
                >
                  <PencilIcon className="w-3 h-3 mr-1" />
                  Editar costo domicilio
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setPackagingEditValue(packagingFee / 100);
                    setShowPackagingModal(true);
                  }}
                  className="text-xs"
                >
                  <PencilIcon className="w-3 h-3 mr-1" />
                  Editar costo recipientes
                </Button>
              </div>
            </div>

            {/* Order Items */}
            <div className="flex-1 overflow-y-auto p-5">
              {itemsSeleccionados.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <div className="text-sm text-[color:var(--sp-neutral-600)]">
                    No hay items seleccionados
                  </div>
                  <div className="text-xs text-[color:var(--sp-neutral-500)] mt-1">
                    Agrega items del menú para comenzar
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {itemsSeleccionados.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border border-[color:var(--sp-neutral-200)] rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[color:var(--sp-neutral-900)] mb-1">
                          {item.nombre}
                        </div>
                        <div className="text-xs text-[color:var(--sp-neutral-600)]">
                          Cantidad: {item.cantidad}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-[color:var(--sp-neutral-900)]">
                          {formatCurrency(item.precio * item.cantidad)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => eliminarItem(item.id)}
                          className="w-7 h-7 p-0 text-[color:var(--sp-error-600)] hover:text-[color:var(--sp-error-700)] hover:bg-[color:var(--sp-error-50)]"
                        >
                          <Trash2Icon className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary */}
            {itemsSeleccionados.length > 0 && (
              <div className="p-5 border-t bg-[color:var(--sp-neutral-50)]">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[color:var(--sp-neutral-600)]">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  {includeDelivery && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--sp-neutral-600)]">Domicilio</span>
                      <span className="font-medium">{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}
                  {includePackaging && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--sp-neutral-600)]">Recipientes</span>
                      <span className="font-medium">{formatCurrency(packagingFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  {metodoPago === 'efectivo' && cambio > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--sp-warning-700)]">Cambio</span>
                      <span className="font-medium text-[color:var(--sp-warning-700)]">
                        {formatCurrency(cambio)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Section */}
            <div className="p-5 border-t">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[color:var(--sp-neutral-900)] mb-3 block">
                    Método de pago
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {METODOS_PAGO.map((m) => (
                      <Button
                        key={m.value}
                        size="sm"
                        variant={metodoPago === m.value ? 'default' : 'outline'}
                        onClick={() => setMetodoPago(m.value)}
                        className="h-9 text-xs"
                      >
                        {m.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {metodoPago === 'efectivo' && (
                  <div>
                    <label className="text-sm font-medium text-[color:var(--sp-neutral-900)] mb-2 block">
                      Monto recibido
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--sp-neutral-500)] text-sm">
                        $
                      </span>
                      <Input
                        type="number"
                        min={total / 100}
                        value={montoRecibido / 100}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMontoRecibido(Math.round(parseFloat(e.target.value || '0') * 100))}
                        className="h-10 pl-8 text-right font-medium"
                        placeholder="0"
                      />
                    </div>
                    {montoRecibido < total && (
                      <div className="text-xs text-[color:var(--sp-error-600)] mt-1">
                        Monto insuficiente
                      </div>
                    )}
                  </div>
                )}

                {errorLocal && (
                  <div className="bg-[color:var(--sp-error-50)] border border-[color:var(--sp-error-200)] rounded-lg p-3 text-sm text-[color:var(--sp-error-700)]">
                    {errorLocal}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={onClose} 
                    disabled={loading || loadingMenu}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleConfirmar} 
                    disabled={
                      loading || 
                      loadingMenu || 
                      itemsSeleccionados.length === 0 || 
                      (metodoPago === 'efectivo' && montoRecibido < total)
                    }
                    className="flex-2 bg-[color:var(--sp-success-600)] hover:bg-[color:var(--sp-success-700)]"
                  >
                    {loading ? 'Procesando...' : 'Confirmar venta'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

  {/* Mini modal: Editar costo de Domicilio (formato miles) */}
        {showDeliveryModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-[color:var(--sp-neutral-950)]/30" onClick={() => setShowDeliveryModal(false)} />
            <div className="relative bg-[color:var(--sp-surface-elevated)] border border-[color:var(--sp-neutral-200)] rounded-lg shadow-xl w-full max-w-sm p-4 mx-4">
              <div className="text-sm font-medium mb-3">Editar costo de domicilio</div>
              <Input
                type="text"
                value={deliveryEditValue ? deliveryEditValue.toLocaleString('es-CO') : ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const raw = e.target.value.replace(/\D/g,'');
                  setDeliveryEditValue(raw ? parseInt(raw,10) : 0);
                }}
                placeholder="$ 1.000"
                className="mb-4"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeliveryModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => { 
                  setDeliveryFee(Math.max(0, Math.round((deliveryEditValue || 0) * 100))); 
                  setShowDeliveryModal(false); 
                }}>
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        )}

  {/* Mini modal: Editar costo de Recipientes (formato miles) */}
        {showPackagingModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-[color:var(--sp-neutral-950)]/30" onClick={() => setShowPackagingModal(false)} />
            <div className="relative bg-[color:var(--sp-surface-elevated)] border border-[color:var(--sp-neutral-200)] rounded-lg shadow-xl w-full max-w-sm p-4 mx-4">
              <div className="text-sm font-medium mb-3">Editar costo de recipientes</div>
              <Input
                type="text"
                value={packagingEditValue ? packagingEditValue.toLocaleString('es-CO') : ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const raw = e.target.value.replace(/\D/g,'');
                  setPackagingEditValue(raw ? parseInt(raw,10) : 0);
                }}
                placeholder="$ 1.000"
                className="mb-4"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPackagingModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => { 
                  setPackagingFee(Math.max(0, Math.round((packagingEditValue || 0) * 100))); 
                  setShowPackagingModal(false); 
                }}>
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalNuevaVenta;