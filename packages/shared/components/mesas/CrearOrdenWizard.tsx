// CrearOrdenWizard.tsx - Modal para crear órdenes con menús del día
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@spoon/shared/components/ui/Button';
import { 
  X, 
  Plus, 
  Minus, 
  ShoppingCart, 
  ChefHat, 
  Sparkles,
  DollarSign,
  Clock,
  Check
} from 'lucide-react';
import { supabase } from '@spoon/shared/lib/supabase';

// ========================================
// INTERFACES
// ========================================

interface CombinacionMenu {
  id: string;
  combination_name: string;
  combination_description?: string;
  combination_price: number;
  is_available: boolean;
  tipo: 'menu_dia' | 'especial';
}

interface ItemSeleccionado {
  combinacionId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  tipo: 'menu_dia' | 'especial';
}

interface CrearOrdenWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCrearOrden: (_items: ItemSeleccionado[]) => Promise<boolean>;
  restaurantId: string;
  mesaNumero: number;
  loading?: boolean;
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

const CrearOrdenWizard: React.FC<CrearOrdenWizardProps> = ({
  isOpen,
  onClose,
  onCrearOrden,
  restaurantId,
  mesaNumero,
  loading = false
}) => {
  
  // ========================================
  // ESTADOS
  // ========================================
  
  const [combinaciones, setCombinaciones] = useState<CombinacionMenu[]>([]);
  const [itemsSeleccionados, setItemsSeleccionados] = useState<ItemSeleccionado[]>([]);
  const [loadingCombinaciones, setLoadingCombinaciones] = useState(false);
  const [creandoOrden, setCreandoOrden] = useState(false);

  // ========================================
  // FUNCIONES DE CARGA
  // ========================================

  const cargarCombinaciones = useCallback(async () => {
    if (!restaurantId) return;
    
    setLoadingCombinaciones(true);
    try {
      
      
      // 1. Cargar menús del día actual usando JOIN con daily_menus
  const today = require('@spoon/shared/utils/datetime').getBogotaDateISO(); // Formato YYYY-MM-DD
      
      const { data: menusDia, error: errorMenus } = await supabase
        .from('generated_combinations')
        .select(`
          id, 
          combination_name, 
          combination_description, 
          combination_price, 
          is_available,
          daily_menus!inner(restaurant_id, menu_date)
        `)
        .eq('daily_menus.restaurant_id', restaurantId)
        .eq('daily_menus.menu_date', today)
        .eq('is_available', true)
        .order('combination_name');

      if (errorMenus) throw errorMenus;

      // 2. Cargar especiales - Primero obtener IDs de special_dishes
      const { data: specialDishes, error: errorSpecialDishes } = await supabase
        .from('special_dishes')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('setup_completed', true);

      if (errorSpecialDishes) {
        console.warn('Error cargando special_dishes:', errorSpecialDishes);
      }

      const specialDishIds = specialDishes?.map(dish => dish.id) || [];
      
      // Ahora cargar especiales si hay IDs
      let especiales: any[] = [];
      if (specialDishIds.length > 0) {
        const { data: especialesData, error: errorEspeciales } = await supabase
          .from('generated_special_combinations')
          .select('id, combination_name, combination_description, combination_price, is_available')
          .in('special_dish_id', specialDishIds)
          .eq('is_available', true)
          .order('combination_name');

        if (errorEspeciales) {
          console.warn('Error cargando generated_special_combinations:', errorEspeciales);
        } else {
          especiales = especialesData || [];
        }
      }

      // 3. Combinar y formatear datos
      const menusFormateados: CombinacionMenu[] = [
        ...(menusDia || []).map(menu => ({
          ...menu,
          tipo: 'menu_dia' as const
        })),
        ...especiales.map(especial => ({
          ...especial,
          tipo: 'especial' as const
        }))
      ];

      

      setCombinaciones(menusFormateados);
      
    } catch (error) {
      console.error('❌ Error cargando combinaciones:', error);
      setCombinaciones([]);
    } finally {
      setLoadingCombinaciones(false);
    }
  }, [restaurantId]);

  // ========================================
  // FUNCIONES DE MANEJO DE ITEMS
  // ========================================

  const agregarItem = (combinacion: CombinacionMenu) => {
    const itemExistente = itemsSeleccionados.find(item => item.combinacionId === combinacion.id);
    
    if (itemExistente) {
      // Incrementar cantidad
      setItemsSeleccionados(prev => 
        prev.map(item => 
          item.combinacionId === combinacion.id 
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      // Agregar nuevo item
      const nuevoItem: ItemSeleccionado = {
        combinacionId: combinacion.id,
        nombre: combinacion.combination_name,
        precio: combinacion.combination_price,
        cantidad: 1,
        tipo: combinacion.tipo
      };
      setItemsSeleccionados(prev => [...prev, nuevoItem]);
    }

    
  };

  const cambiarCantidad = (combinacionId: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      // Eliminar item si cantidad es 0
      setItemsSeleccionados(prev => 
        prev.filter(item => item.combinacionId !== combinacionId)
      );
    } else {
      // Actualizar cantidad
      setItemsSeleccionados(prev => 
        prev.map(item => 
          item.combinacionId === combinacionId 
            ? { ...item, cantidad: nuevaCantidad }
            : item
        )
      );
    }
  };

  const obtenerCantidadItem = (combinacionId: string): number => {
    const item = itemsSeleccionados.find(item => item.combinacionId === combinacionId);
    return item?.cantidad || 0;
  };

  // ========================================
  // CÁLCULOS
  // ========================================

  const calcularTotal = (): number => {
    return itemsSeleccionados.reduce((total, item) => {
      return total + (item.precio * item.cantidad);
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // ========================================
  // FUNCIONES DE ACCIÓN
  // ========================================

  const handleCrearOrden = async () => {
    if (itemsSeleccionados.length === 0) {
      alert('Selecciona al menos un producto para crear la orden');
      return;
    }

    
    
    setCreandoOrden(true);
    try {
      const success = await onCrearOrden(itemsSeleccionados);
      if (success) {
        // Limpiar selección y cerrar
        setItemsSeleccionados([]);
        onClose();
      }
    } catch (error) {
      console.error('❌ Error creando orden:', error);
    } finally {
      setCreandoOrden(false);
    }
  };

  const handleClose = () => {
    if (!creandoOrden && !loading) {
      setItemsSeleccionados([]);
      onClose();
    }
  };

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    if (isOpen && restaurantId) {
      cargarCombinaciones();
    }
  }, [isOpen, restaurantId, cargarCombinaciones]);

  // ========================================
  // RENDERIZADO
  // ========================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[color:color-mix(in oklab,var(--sp-neutral-950)_60%,transparent)]">
      <div className="bg-[color:var(--sp-neutral-50)] rounded-lg shadow-xl max-w-6xl w-full h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
  <div className="bg-[color:var(--sp-info-600)] text-[color:var(--sp-on-info)] p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ChefHat className="h-6 w-6" />
              Crear Orden - Mesa {mesaNumero}
            </h2>
      <p className="text-[color:var(--sp-info-200)] text-sm">
              Selecciona los productos del menú del día
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={creandoOrden || loading}
  className="text-[color:var(--sp-on-info)] hover:text-[color:var(--sp-neutral-300)] disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          
          {/* ========================================
              COLUMNA IZQUIERDA - MENÚS DISPONIBLES (70%)
              ======================================== */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            
            {loadingCombinaciones ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--sp-info-600)] mx-auto mb-4"></div>
                <p className="text-[color:var(--sp-neutral-600)]">Cargando menú del día...</p>
              </div>
            ) : combinaciones.length > 0 ? (
              <div className="space-y-6">
                
                {/* Menús del Día */}
                <div>
                  <h3 className="text-lg font-bold text-[color:var(--sp-neutral-900)] mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[color:var(--sp-info-600)]" />
                    Menú del Día - {new Date().toLocaleDateString('es-CO')} ({combinaciones.filter(c => c.tipo === 'menu_dia').length})
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {combinaciones
                      .filter(combinacion => combinacion.tipo === 'menu_dia')
                      .map((combinacion) => {
                        const cantidad = obtenerCantidadItem(combinacion.id);
                        return (
                          <div 
                            key={combinacion.id} 
                            className={`
                              border-2 rounded-lg p-3 transition-all cursor-pointer
                              ${cantidad > 0 
                                ? 'border-[color:var(--sp-info-500)] bg-[color:var(--sp-info-50)]' 
                                : 'border-[color:var(--sp-neutral-200)] bg-[color:var(--sp-neutral-50)] hover:border-[color:var(--sp-neutral-300)]'
                              }
                            `}
                            onClick={() => agregarItem(combinacion)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-[color:var(--sp-neutral-900)] text-sm leading-tight">
                                {combinacion.combination_name}
                              </h4>
                              <div className="text-right ml-2">
                                <div className="font-bold text-[color:var(--sp-success-600)]">
                                  {formatCurrency(combinacion.combination_price)}
                                </div>
                                {cantidad > 0 && (
                                  <div className="bg-[color:var(--sp-info-500)] text-[color:var(--sp-on-info)] text-xs px-2 py-1 rounded-full">
                                    {cantidad}x
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {combinacion.combination_description && (
                              <p className="text-[color:var(--sp-neutral-600)] text-xs mb-2 line-clamp-2">
                                {combinacion.combination_description}
                              </p>
                            )}
                            
                            {cantidad > 0 ? (
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => cambiarCantidad(combinacion.id, cantidad - 1)}
                                  className="w-8 h-8 rounded-full bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-600)] flex items-center justify-center hover:bg-[color:var(--sp-error-200)]"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="font-bold text-[color:var(--sp-neutral-900)] min-w-[2rem] text-center">
                                  {cantidad}
                                </span>
                                <button
                                  onClick={() => cambiarCantidad(combinacion.id, cantidad + 1)}
                                  className="w-8 h-8 rounded-full bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-600)] flex items-center justify-center hover:bg-[color:var(--sp-success-200)]"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-[color:var(--sp-info-600)]">
                                <Plus className="h-4 w-4" />
                                <span className="text-sm font-medium">Agregar</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    }
                  </div>
                </div>

                {/* Platos Especiales */}
                {combinaciones.filter(c => c.tipo === 'especial').length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-[color:var(--sp-neutral-900)] mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[color:var(--sp-warning-500)]" />
                      Platos Especiales ({combinaciones.filter(c => c.tipo === 'especial').length})
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {combinaciones
                        .filter(combinacion => combinacion.tipo === 'especial')
                        .map((combinacion) => {
                          const cantidad = obtenerCantidadItem(combinacion.id);
                          return (
                            <div 
                              key={combinacion.id} 
                              className={`
                                border-2 rounded-lg p-3 transition-all cursor-pointer
                                ${cantidad > 0 
                                  ? 'border-[color:var(--sp-warning-500)] bg-[color:var(--sp-warning-50)]' 
                                  : 'border-[color:var(--sp-warning-200)] bg-gradient-to-r from-[color:var(--sp-warning-50)] to-[color:var(--sp-warning-100)] hover:border-[color:var(--sp-warning-300)]'
                                }
                              `}
                              onClick={() => agregarItem(combinacion)}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-[color:var(--sp-neutral-900)] text-sm leading-tight flex items-center gap-1">
                                  <Sparkles className="h-4 w-4 text-[color:var(--sp-warning-500)]" />
                                  {combinacion.combination_name}
                                </h4>
                                <div className="text-right ml-2">
                                  <div className="font-bold text-[color:var(--sp-warning-600)]">
                                    {formatCurrency(combinacion.combination_price)}
                                  </div>
                                  {cantidad > 0 && (
                                    <div className="bg-[color:var(--sp-warning-500)] text-[color:var(--sp-on-warning)] text-xs px-2 py-1 rounded-full">
                                      {cantidad}x
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {combinacion.combination_description && (
                                <p className="text-[color:var(--sp-neutral-600)] text-xs mb-2 line-clamp-2">
                                  {combinacion.combination_description}
                                </p>
                              )}
                              
                              {cantidad > 0 ? (
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => cambiarCantidad(combinacion.id, cantidad - 1)}
                                    className="w-8 h-8 rounded-full bg-[color:var(--sp-error-100)] text-[color:var(--sp-error-600)] flex items-center justify-center hover:bg-[color:var(--sp-error-200)]"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="font-bold text-[color:var(--sp-neutral-900)] min-w-[2rem] text-center">
                                    {cantidad}
                                  </span>
                                  <button
                                    onClick={() => cambiarCantidad(combinacion.id, cantidad + 1)}
                                    className="w-8 h-8 rounded-full bg-[color:var(--sp-success-100)] text-[color:var(--sp-success-600)] flex items-center justify-center hover:bg-[color:var(--sp-success-200)]"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-[color:var(--sp-warning-600)]">
                                  <Plus className="h-4 w-4" />
                                  <span className="text-sm font-medium">Agregar</span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-[color:var(--sp-neutral-500)]">
                <ChefHat className="h-16 w-16 mx-auto mb-4 text-[color:var(--sp-neutral-300)]" />
                <h3 className="text-lg font-medium text-[color:var(--sp-neutral-700)] mb-2">
                  No hay menús disponibles
                </h3>
                <p className="text-sm">
                  Configura el menú del día para poder crear órdenes
                </p>
              </div>
            )}
          </div>

          {/* ========================================
              COLUMNA DERECHA - RESUMEN DE ORDEN (30%)
              ======================================== */}
          <div className="w-80 bg-[color:var(--sp-neutral-50)] border-l border-[color:var(--sp-neutral-200)] flex flex-col min-h-0">
            
            {/* Header del resumen */}
            <div className="p-4 border-b border-[color:var(--sp-neutral-200)] bg-[color:var(--sp-neutral-50)]">
              <h3 className="font-bold text-[color:var(--sp-neutral-900)] flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Resumen de Orden
              </h3>
              <p className="text-sm text-[color:var(--sp-neutral-600)]">
                Mesa {mesaNumero}
              </p>
            </div>

            {/* Items seleccionados */}
            <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 400px)' }}>
              {itemsSeleccionados.length > 0 ? (
                <div className="space-y-3">
                  {itemsSeleccionados.map((item) => (
                    <div key={item.combinacionId} className="bg-[color:var(--sp-neutral-50)] rounded-lg p-3 border border-[color:var(--sp-neutral-200)]">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-[color:var(--sp-neutral-900)] text-sm leading-tight">
                          {item.nombre}
                        </h4>
                        <button
                          onClick={() => cambiarCantidad(item.combinacionId, 0)}
                          className="text-[color:var(--sp-error-500)] hover:text-[color:var(--sp-error-700)]"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => cambiarCantidad(item.combinacionId, item.cantidad - 1)}
                            className="w-7 h-7 rounded-full bg-[color:var(--sp-neutral-100)] flex items-center justify-center hover:bg-[color:var(--sp-neutral-200)]"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-bold text-[color:var(--sp-neutral-900)] min-w-[1.5rem] text-center">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => cambiarCantidad(item.combinacionId, item.cantidad + 1)}
                            className="w-7 h-7 rounded-full bg-[color:var(--sp-neutral-100)] flex items-center justify-center hover:bg-[color:var(--sp-neutral-200)]"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-bold text-[color:var(--sp-neutral-900)]">
                            {formatCurrency(item.precio * item.cantidad)}
                          </div>
                          <div className="text-xs text-[color:var(--sp-neutral-500)]">
                            {formatCurrency(item.precio)} c/u
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[color:var(--sp-neutral-500)]">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-[color:var(--sp-neutral-300)]" />
                  <p className="text-sm">
                    Selecciona productos del menú para agregarlos a la orden
                  </p>
                </div>
              )}
            </div>

            {/* Total y botones */}
            <div className="p-4 border-t border-[color:var(--sp-neutral-200)] bg-[color:var(--sp-neutral-50)] space-y-3">
              
              {/* Total */}
              <div className="bg-[color:var(--sp-success-50)] rounded-lg p-4 border border-[color:var(--sp-success-200)]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[color:var(--sp-neutral-900)] flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[color:var(--sp-success-600)]" />
                    TOTAL:
                  </span>
                  <span className="text-2xl font-bold text-[color:var(--sp-success-600)]">
                    {formatCurrency(calcularTotal())}
                  </span>
                </div>
                {itemsSeleccionados.length > 0 && (
                  <div className="text-sm text-[color:var(--sp-success-700)] mt-1">
                    {itemsSeleccionados.reduce((sum, item) => sum + item.cantidad, 0)} productos seleccionados
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="space-y-2">
                <Button
                  onClick={handleCrearOrden}
                  disabled={itemsSeleccionados.length === 0 || creandoOrden || loading}
                  className="w-full bg-[color:var(--sp-success-600)] hover:bg-[color:var(--sp-success-700)] text-[color:var(--sp-on-success)] font-bold py-3 text-lg"
                >
                  {creandoOrden ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[color:var(--sp-on-success)] mr-2"></div>
                      Creando Orden...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Crear Orden - {formatCurrency(calcularTotal())}
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleClose}
                  variant="outline"
                  disabled={creandoOrden || loading}
                  className="w-full"
                >
                  Cancelar
                </Button>
                
                {/* Info del total */}
                {itemsSeleccionados.length > 0 && (
                  <div className="text-xs text-center text-[color:var(--sp-neutral-500)] mt-2">
                    💡 Al crear la orden, la Mesa {mesaNumero} quedará ocupada
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearOrdenWizard;
