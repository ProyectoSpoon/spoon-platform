// Panel lateral para gestión completa de mesas (Administrador) - CON WIZARD INTEGRADO
import React, { useState, useEffect } from 'react';
import { Button } from '@spoon/shared/components/ui/Button';
import { 
  getDetallesMesa,
  crearOrdenMesa,
  eliminarOrdenMesa,
  ponerMesaMantenimiento,
  activarMesaManual,
  reservarMesaManual,
  liberarReservaManual,
  actualizarNotasMesa,
  inactivarMesaManual
} from '@spoon/shared/lib/supabase';
import { 
  DollarSign, 
  Clock, 
  AlertCircle, 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar,
  Users,
  ChefHat,
  Receipt
} from 'lucide-react';
import type { ItemMesa } from '@spoon/shared/types/mesas/mesasTypes';
import CrearOrdenWizard from '@spoon/shared/components/mesas/CrearOrdenWizard';

interface MesaDetallesPanelProps {
  mesaNumero: number | null;
  isVisible: boolean;
  onCobrar: (numero: number) => Promise<boolean>;
  onClose: () => void;
  restaurantId: string | null;
  // Props adicionales para identificar el estado
  mesasOcupadas: { [key: number]: any };
  mesasCompletas: any[];
}

// ========================================
// INTERFACE PARA ITEMS SELECCIONADOS
// ========================================

interface ItemSeleccionado {
  combinacionId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  tipo: 'menu_dia' | 'especial';
}

const MesaDetallesPanel: React.FC<MesaDetallesPanelProps> = ({ 
  mesaNumero, 
  isVisible,
  onCobrar, 
  onClose,
  restaurantId,
  mesasOcupadas,
  mesasCompletas
}) => {
  const [detalles, setDetalles] = useState<{
    mesa: number;
    items: any[];
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [cobrando, setCobrando] = useState(false);
  
  // ========================================
  // NUEVO ESTADO PARA EL WIZARD
  // ========================================
  const [wizardAbierto, setWizardAbierto] = useState(false);
  const [creandoOrden, setCreandoOrden] = useState(false);

  // ========================================
  // DETERMINAR ESTADO DE LA MESA
  // ========================================
  
  const mesaInfo = mesaNumero ? mesasCompletas.find(m => m.numero === mesaNumero) : null;
  const estaOcupada = mesaNumero ? !!mesasOcupadas[mesaNumero] : false;
  const estaReservada = mesaInfo?.estado === 'reservada';
  const estaInactiva = mesaInfo?.estado === 'inactiva';
  const estaMantenimiento = mesaInfo?.estado === 'mantenimiento';

  console.log('🔍 Estado mesa', mesaNumero, ':', { estaOcupada, estaReservada, estaInactiva, estaMantenimiento, mesaInfo });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const cargarDetalles = async () => {
    if (!mesaNumero || !restaurantId || !estaOcupada) {
      // Solo cargar detalles si la mesa está ocupada
      setDetalles(null);
      return;
    }
    
    setLoading(true);
    try {
      const data = await getDetallesMesa(restaurantId, mesaNumero);
      console.log('🎯 MesaDetallesPanel - Datos recibidos:', data);
      setDetalles(data);
    } catch (error) {
      console.error('Error cargando detalles:', error);
      setDetalles(null);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // NUEVA FUNCIÓN: CREAR ORDEN CON WIZARD
  // ========================================
  
  const handleCrearOrden = async () => {
    console.log('➕ Abriendo wizard para crear orden en mesa', mesaNumero);
    
    if (!restaurantId || !mesaNumero) {
      alert('Error: Faltan datos del restaurante o mesa');
      return;
    }

    // Abrir wizard en lugar de crear orden vacía
    setWizardAbierto(true);
  };

  // ========================================
  // NUEVA FUNCIÓN: PROCESAR ITEMS DEL WIZARD
  // ========================================
  
  const handleProcesarOrdenWizard = async (itemsSeleccionados: ItemSeleccionado[]): Promise<boolean> => {
    if (!restaurantId || !mesaNumero) {
      alert('Error: Faltan datos del restaurante o mesa');
      return false;
    }

    console.log('🚀 Procesando orden con items del wizard:', itemsSeleccionados);
    
    setCreandoOrden(true);
    try {
      // Convertir items seleccionados al formato esperado por crearOrdenMesa
      const itemsParaOrden = itemsSeleccionados.map(item => ({
        combinacionId: item.tipo === 'menu_dia' ? item.combinacionId : undefined,
        combinacionEspecialId: item.tipo === 'especial' ? item.combinacionId : undefined,
        tipoItem: item.tipo,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
        observacionesItem: undefined
      }));

      // Crear la orden con items reales
      const nuevaOrden = await crearOrdenMesa({
        restaurantId,
        numeroMesa: mesaNumero,
        nombreMesero: 'Administrador',
        observaciones: `Orden creada desde panel administrativo - ${new Date().toLocaleString('es-CO')}`,
        items: itemsParaOrden
      });
      
      console.log('✅ Orden creada con éxito:', nuevaOrden.id);
      
      // Recargar datos para mostrar la nueva orden
      await cargarDetalles();
      
      alert(`✅ Orden creada exitosamente para Mesa ${mesaNumero}\n\n` +
        `• ${itemsSeleccionados.length} tipos de productos\n` +
        `• ${itemsSeleccionados.reduce((sum, item) => sum + item.cantidad, 0)} items en total\n` +
        `• Total: ${formatCurrency(itemsSeleccionados.reduce((sum, item) => sum + (item.precio * item.cantidad), 0))}\n\n` +
        `ID de orden: ${nuevaOrden.id}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Error creando orden:', error);
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error al crear la orden: ${mensaje}`);
      return false;
    } finally {
      setCreandoOrden(false);
    }
  };

  // ========================================
  // FUNCIONES EXISTENTES (SIN CAMBIOS)
  // ========================================

  const handleEditarOrden = async () => {
    console.log('✏️ Editar orden de mesa', mesaNumero);
    
    try {
      // TODO: Implementar página/modal de edición de orden
      // Por ahora, solo mostrar información disponible
      
      if (!detalles || detalles.items.length === 0) {
        alert('No hay órdenes activas para editar en esta mesa.');
        return;
      }
      
      const mensaje = `🔧 FUNCIONALIDAD EN DESARROLLO\n\n` +
        `Mesa ${mesaNumero} tiene:\n` +
        `• ${detalles.items.length} productos\n` +
        `• Total: ${formatCurrency(detalles.total)}\n\n` +
        `Próximamente: Modal/página de edición completa`;
      
      alert(mensaje);
      
      // TODO: Abrir modal de edición o redirigir a página
      // window.location.href = `/dashboard/ordenes/editar/${mesaNumero}`;
      
    } catch (error) {
      console.error('Error editando orden:', error);
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error: ${mensaje}`);
    }
  };

  const handleEliminarOrden = async () => {
    console.log('🗑️ Eliminar orden de mesa', mesaNumero);
    
    if (!confirm(`⚠️ ¿Estás seguro de eliminar TODA la orden de la Mesa ${mesaNumero}?\n\nEsta acción NO se puede deshacer.\n\nSe eliminarán todos los productos y la mesa quedará libre.`)) {
      return;
    }
    
    try {
      if (!restaurantId || !mesaNumero) {
        alert('Error: Faltan datos del restaurante o mesa');
        return;
      }
      
      // Usar función real de supabase.ts
      await eliminarOrdenMesa(restaurantId, mesaNumero);
      
      console.log('✅ Orden eliminada exitosamente');
      
      // La mesa debería quedar libre automáticamente por el trigger
      // Cerrar panel y mostrar éxito
      setDetalles(null);
      onClose();
      
      alert(`✅ Orden eliminada exitosamente\n\nLa Mesa ${mesaNumero} ahora está libre para nuevos huéspedes.`);
      
    } catch (error) {
      console.error('Error eliminando orden:', error);
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error al eliminar la orden: ${mensaje}`);
    }
  };

  const handleReservarMesa = async () => {
    console.log('📅 Reservar mesa', mesaNumero);
    
    try {
      // Solicitar datos de la reserva
      const nombreCliente = prompt('Nombre del cliente para la reserva:');
      if (!nombreCliente || nombreCliente.trim() === '') {
        return; // Usuario canceló
      }
      
      const telefono = prompt('Teléfono del cliente (opcional):') || undefined;
      const horaReserva = prompt('Hora de la reserva (opcional, ej: 7:30 PM):') || undefined;
      const observaciones = prompt('Observaciones adicionales (opcional):') || undefined;
      
      if (!restaurantId || !mesaNumero) {
        alert('Error: Faltan datos del restaurante o mesa');
        return;
      }
      
      // Usar función real de supabase.ts
      await reservarMesaManual(restaurantId, mesaNumero, {
        nombreCliente: nombreCliente.trim(),
        telefono,
        horaReserva,
        observaciones
      });
      
      console.log('✅ Mesa reservada exitosamente');
      
      // Recargar datos para mostrar el nuevo estado
      // El panel se recargará automáticamente con el nuevo estado
      onClose(); // Cerrar panel para que se actualice
      
      alert(`✅ Mesa ${mesaNumero} reservada exitosamente\n\nCliente: ${nombreCliente}${telefono ? `\nTeléfono: ${telefono}` : ''}${horaReserva ? `\nHora: ${horaReserva}` : ''}`);
      
    } catch (error) {
      console.error('Error reservando mesa:', error);
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error al reservar la mesa: ${mensaje}`);
    }
  };

  const handleActivarMesa = async () => {
    console.log('✅ activarMesaManual - Activando mesa:', mesaNumero);
    
    try {
      if (!restaurantId || !mesaNumero) {
        alert('Error: Faltan datos del restaurante o mesa');
        return;
      }
      
      // Usar función real de supabase.ts
      await activarMesaManual(restaurantId, mesaNumero);
      
      console.log('✅ Mesa activada exitosamente');
      
      // Cerrar panel para que se actualice con el nuevo estado
      onClose();
      
      alert(`✅ Mesa ${mesaNumero} activada exitosamente\n\nLa mesa ahora está disponible para recibir huéspedes.`);
      
    } catch (error) {
      console.error('Error activando mesa:', error);
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error al activar la mesa: ${mensaje}`);
    }
  };

  const handlePonerMantenimiento = async () => {
    console.log('🔧 Poner en mantenimiento mesa', mesaNumero);
    
    const motivo = prompt('Motivo del mantenimiento:');
    if (!motivo || motivo.trim() === '') {
      return; // Usuario canceló
    }
    
    try {
      if (!restaurantId || !mesaNumero) {
        alert('Error: Faltan datos del restaurante o mesa');
        return;
      }
      
      // Usar función real de supabase.ts
      await ponerMesaMantenimiento(restaurantId, mesaNumero, motivo.trim());
      
      console.log('✅ Mesa puesta en mantenimiento exitosamente');
      
      // Cerrar panel para que se actualice
      onClose();
      
      alert(`🔧 Mesa ${mesaNumero} puesta en mantenimiento\n\nMotivo: ${motivo}\n\nLa mesa no estará disponible hasta que sea reactivada.`);
      
    } catch (error) {
      console.error('Error poniendo en mantenimiento:', error);
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error al poner la mesa en mantenimiento: ${mensaje}`);
    }
  };

  const handleLiberarReserva = async () => {
    console.log('🔓 Liberar reserva de mesa', mesaNumero);
    
    if (!confirm(`¿Liberar la reserva de la Mesa ${mesaNumero}?\n\nLa mesa quedará disponible para otros huéspedes.`)) {
      return;
    }
    
    try {
      if (!restaurantId || !mesaNumero) {
        alert('Error: Faltan datos del restaurante o mesa');
        return;
      }
      
      // Usar función real de supabase.ts
      await liberarReservaManual(restaurantId, mesaNumero);
      
      console.log('✅ Reserva liberada exitosamente');
      
      // Cerrar panel para que se actualice
      onClose();
      
      alert(`✅ Reserva liberada\n\nLa Mesa ${mesaNumero} ahora está libre para nuevos huéspedes.`);
      
    } catch (error) {
      console.error('Error liberando reserva:', error);
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error al liberar la reserva: ${mensaje}`);
    }
  };

  const handleActualizarNotasMantenimiento = async () => {
    console.log('📝 Actualizar notas de mantenimiento', mesaNumero);
    
    const nuevasNotas = prompt('Actualizar notas de mantenimiento:', mesaInfo?.notas || '');
    if (nuevasNotas === null) {
      return; // Usuario canceló
    }
    
    try {
      if (!restaurantId || !mesaNumero) {
        alert('Error: Faltan datos del restaurante o mesa');
        return;
      }
      
      // Usar función real de supabase.ts
      await actualizarNotasMesa(restaurantId, mesaNumero, nuevasNotas);
      
      console.log('✅ Notas actualizadas exitosamente');
      
      alert(`✅ Notas actualizadas para Mesa ${mesaNumero}`);
      
    } catch (error) {
      console.error('Error actualizando notas:', error);
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error al actualizar las notas: ${mensaje}`);
    }
  };

  const handleInactivarMesa = async () => {
    console.log('🚫 Inactivar mesa', mesaNumero);
    
    const motivo = prompt('Motivo para inactivar la mesa:');
    if (!motivo || motivo.trim() === '') {
      return; // Usuario canceló
    }
    
    try {
      if (!restaurantId || !mesaNumero) {
        alert('Error: Faltan datos del restaurante o mesa');
        return;
      }
      
      // Usar función real de supabase.ts
      await inactivarMesaManual(restaurantId, mesaNumero, motivo.trim());
      
      console.log('✅ Mesa inactivada exitosamente');
      
      // Cerrar panel para que se actualice
      onClose();
      
      alert(`🚫 Mesa ${mesaNumero} inactivada\n\nMotivo: ${motivo}\n\nLa mesa no estará disponible hasta que sea reactivada.`);
      
    } catch (error) {
      console.error('Error inactivando mesa:', error);
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error al inactivar la mesa: ${mensaje}`);
    }
  };

  const handleCobrar = async () => {
    if (!mesaNumero) return;
    
    setCobrando(true);
    try {
      const success = await onCobrar(mesaNumero);
      if (success) {
        setDetalles(null);
        onClose();
      }
    } catch (error) {
      console.error('Error procesando cobro:', error);
    } finally {
      setCobrando(false);
    }
  };

  // Cargar detalles cuando cambia la mesa seleccionada
  useEffect(() => {
    if (mesaNumero && isVisible) {
      cargarDetalles();
    } else {
      setDetalles(null);
    }
  }, [mesaNumero, isVisible, restaurantId, estaOcupada]);

  // Si no está visible, mostrar estado inicial
  if (!isVisible) {
    return (
      <div className="w-full bg-gray-50 border-l border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500 p-8">
          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Selecciona una mesa
          </h3>
          <p className="text-sm">
            Haz clic en cualquier mesa para gestionarla como administrador
          </p>
        </div>
      </div>
    );
  }

  // Determinar título y estado
  const getTituloMesa = () => {
    if (estaInactiva) return `Mesa ${mesaNumero} - Inactiva`;
    if (estaMantenimiento) return `Mesa ${mesaNumero} - Mantenimiento`;
    if (estaReservada) return `Mesa ${mesaNumero} - Reservada`;
    if (estaOcupada) return `Mesa ${mesaNumero} - Ocupada`;
    return `Mesa ${mesaNumero} - Libre`;
  };

  const getColorHeader = () => {
    if (estaInactiva) return 'bg-gray-700';
    if (estaMantenimiento) return 'bg-orange-600';
    if (estaReservada) return 'bg-yellow-600';
    if (estaOcupada) return 'bg-red-600';
    return 'bg-green-600';
  };

  return (
    <>
      <div className="w-full bg-white border-l border-gray-200 flex flex-col h-full">
        
        {/* Header del panel con estado */}
        <div className={`${getColorHeader()} text-white p-4 flex justify-between items-center`}>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{getTituloMesa()}</h2>
            {mesaInfo?.capacidad && (
              <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded">
                <Users className="h-3 w-3" />
                {mesaInfo.capacidad}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido según el estado de la mesa */}
        <div className="flex-1 overflow-y-auto">
          
          {/* ========================================
              MESA INACTIVA
              ======================================== */}
          {estaInactiva && (
            <div className="p-6 text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Mesa Inactiva</h3>
              <p className="text-sm text-gray-500 mb-6">
                Esta mesa está fuera de servicio temporalmente
              </p>
              <Button 
                onClick={handleActivarMesa}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Activar Mesa
              </Button>
            </div>
          )}

          {/* ========================================
              MESA EN MANTENIMIENTO
              ======================================== */}
          {estaMantenimiento && (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Mesa en Mantenimiento</h3>
              <p className="text-sm text-gray-500 mb-6">
                Esta mesa está temporalmente fuera de servicio por mantenimiento
              </p>
              
              {/* Información del mantenimiento */}
              {mesaInfo?.notas && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-orange-800 mb-2">Motivo:</h4>
                  <p className="text-orange-700 text-sm">{mesaInfo.notas}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Button 
                  onClick={handleActivarMesa}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Finalizar Mantenimiento
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleActualizarNotasMantenimiento}
                >
                  Actualizar Notas
                </Button>
              </div>
            </div>
          )}

          {/* ========================================
              MESA LIBRE (Opciones de administrador)
              ======================================== */}
          {!estaInactiva && !estaMantenimiento && !estaOcupada && !estaReservada && (
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Mesa Disponible</h3>
                <p className="text-sm text-gray-600">
                  Lista para recibir huéspedes. ¿Qué deseas hacer?
                </p>
              </div>

              {/* Opciones para mesa libre */}
              <div className="space-y-3">
                <Button 
                  onClick={handleCrearOrden}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
                  disabled={creandoOrden}
                >
                  <Plus className="h-4 w-4 mr-3" />
                  {creandoOrden ? 'Creando Orden...' : 'Crear Nueva Orden'}
                </Button>
                
                <Button 
                  onClick={handleReservarMesa}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Calendar className="h-4 w-4 mr-3" />
                  Reservar Mesa
                </Button>

                <Button 
                  onClick={handlePonerMantenimiento}
                  variant="outline"
                  className="w-full justify-start text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <AlertCircle className="h-4 w-4 mr-3" />
                  Poner en Mantenimiento
                </Button>

                <Button 
                  onClick={handleInactivarMesa}
                  variant="outline"
                  className="w-full justify-start text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-3" />
                  Inactivar Mesa
                </Button>
              </div>

              {/* Info de la mesa */}
              {mesaInfo && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Información de la mesa</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Número: Mesa {mesaInfo.numero}</div>
                    {mesaInfo.nombre && <div>Nombre: {mesaInfo.nombre}</div>}
                    {mesaInfo.zona && <div>Zona: {mesaInfo.zona}</div>}
                    {mesaInfo.capacidad && <div>Capacidad: {mesaInfo.capacidad} personas</div>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================
              MESA RESERVADA
              ======================================== */}
          {estaReservada && (
            <div className="p-6 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Mesa Reservada</h3>
              <p className="text-sm text-gray-500 mb-6">
                Esta mesa tiene una reservación activa
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={handleCrearOrden}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={creandoOrden}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {creandoOrden ? 'Creando...' : 'Crear Orden (Liberar Reserva)'}
                </Button>
                <Button 
                  onClick={handleLiberarReserva}
                  variant="outline"
                  className="w-full"
                >
                  Solo Liberar Reserva
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-xs"
                  onClick={() => alert('🚧 IMPLEMENTAR: Ver detalles completos de la reserva')}
                >
                  Ver Detalles de Reserva
                </Button>
              </div>
            </div>
          )}

          {/* ========================================
              MESA OCUPADA (Contenido original)
              ======================================== */}
          {estaOcupada && (
            <div className="p-4 space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-600 mt-2 text-sm">Cargando detalles...</p>
                </div>
              ) : detalles ? (
                <>
                  {/* Botones de gestión de administrador */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <Button 
                      onClick={handleEditarOrden}
                      variant="outline" 
                      size="sm"
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      onClick={handleEliminarOrden}
                      variant="outline" 
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Eliminar
                    </Button>
                  </div>

                  {/* Items consumidos */}
                  <div>
                    <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                      <Receipt className="h-4 w-4" />
                      Productos consumidos:
                    </h3>
                    
                    <div className="space-y-2">
                      {detalles.items.length > 0 ? (
                        detalles.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-sm">
                                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold mr-2">
                                  {item.cantidad}x
                                </span>
                                {item.nombre || 'Sin nombre'}
                              </div>
                              {item.observaciones && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {item.observaciones}
                                </div>
                              )}
                            </div>
                            <div className="text-right ml-2">
                              <div className="font-bold text-gray-900 text-sm">
                                {formatCurrency(item.precio_total || 0)}
                              </div>
                              {item.precio_unitario && (
                                <div className="text-xs text-gray-500">
                                  {formatCurrency(item.precio_unitario)} c/u
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No hay productos registrados</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resumen y total */}
                  <div className="border-t pt-4 space-y-3">
                    {/* Estadísticas rápidas */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-blue-50 p-2 rounded">
                        <div className="text-lg font-bold text-blue-600">
                          {detalles.items.reduce((sum, item) => sum + (item.cantidad || 0), 0)}
                        </div>
                        <div className="text-xs text-blue-700">Items</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <div className="text-lg font-bold text-green-600">
                          {detalles.items.length}
                        </div>
                        <div className="text-xs text-green-700">Productos</div>
                      </div>
                    </div>

                    {/* Total principal */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          TOTAL:
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(detalles.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Sin información
                  </h3>
                  <p className="text-sm text-gray-500">
                    No se encontraron detalles para esta mesa
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer fijo con botones según el estado */}
        {!estaInactiva && !estaMantenimiento && (
          <div className="border-t bg-gray-50 p-4 space-y-3">
            {estaOcupada && detalles ? (
              // Botones para mesa ocupada
              <>
                <Button
                  onClick={handleCobrar}
                  disabled={cobrando || !detalles.total}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg"
                >
                  {cobrando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-5 w-5 mr-2" />
                      COBRAR {formatCurrency(detalles.total)}
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full"
                  disabled={cobrando}
                >
                  Cerrar
                </Button>
              </>
            ) : (
              // Botón para cerrar en mesas no ocupadas
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Cerrar
              </Button>
            )}

            {/* Info adicional */}
            <div className="text-center text-xs text-gray-500">
              {estaOcupada 
                ? '💡 Como administrador puedes editar, eliminar o cobrar órdenes'
                : '🔧 Panel de administrador - Control total de mesas'
              }
            </div>
          </div>
        )}
      </div>

      {/* ========================================
          WIZARD DE CREAR ORDEN
          ======================================== */}
      {restaurantId && mesaNumero && (
        <CrearOrdenWizard
          isOpen={wizardAbierto}
          onClose={() => setWizardAbierto(false)}
          onCrearOrden={handleProcesarOrdenWizard}
          restaurantId={restaurantId}
          mesaNumero={mesaNumero}
          loading={creandoOrden}
        />
      )}
    </>
  );
};

export default MesaDetallesPanel;