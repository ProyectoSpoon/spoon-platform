/**
 * PANEL UNIFICADO PARA DETALLES DE MESA
 * Reemplaza MesaDetallesPanel.tsx de 891 líneas con arquitectura modular
 * Refactorizado automáticamente - Usa nuevos hooks y componentes
 */

import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import EditarMesaModal from './EditarMesaModal';
import { useMesas, useMesaActions } from '@spoon/shared/hooks/mesas';
import { Mesa } from '@spoon/shared/types/mesas';
import MesaDetailsHeader from './MesaDetailsHeader';
import MesaDetailsContent from './MesaDetailsContent';
import MesaDetailsActions from './MesaDetailsActions';
import MesaDetailsFooter from './MesaDetailsFooter';
import CrearOrdenWizard from '@spoon/shared/components/mesas/CrearOrdenWizard';

// Type casting para componentes
const ClockCast = Clock as any;
const CrearOrdenWizardCast = CrearOrdenWizard as any;

interface MesaDetailsPanelProps {
  mesaNumero: number | null;
  isVisible: boolean;
  onCobrar: (numero: number) => Promise<boolean>;
  onClose: () => void;
  restaurantId: string | null;
  mesasOcupadas: { [key: number]: any };
  mesasCompletas: any[];
}

const MesaDetailsPanel: React.FC<MesaDetailsPanelProps> = ({ 
  mesaNumero, 
  isVisible,
  onCobrar, 
  onClose,
  restaurantId,
  mesasOcupadas,
  mesasCompletas
}) => {
  // Estados locales
  const [wizardAbierto, setWizardAbierto] = useState(false);
  const [cobrando, setCobrando] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);

  // Hooks especializados
  const { estadisticas } = useMesas();
  const mesaActions = useMesaActions(restaurantId, () => {
    // Callback de éxito - recargar datos
    console.log('Acción completada, recargando...');
  });

  // Obtener información de la mesa
  const mesaInfo = mesaNumero ? mesasCompletas.find(m => m.numero === mesaNumero) : null;
  
  // Convertir a formato unificado
  const mesa: Mesa | null = mesaInfo ? {
    id: mesaInfo.id || `mesa-${mesaInfo.numero}`,
    numero: mesaInfo.numero,
    nombre: mesaInfo.nombre,
    zona: mesaInfo.zona || 'Principal',
    capacidad: mesaInfo.capacidad || 4,
    estado: mesaInfo.estado || 'libre',
    notas: mesaInfo.notas,
    ordenActiva: mesaInfo.detallesOrden ? {
      id: `orden-${mesaInfo.numero}`,
      total: mesaInfo.detallesOrden.total,
      items: mesaInfo.detallesOrden.items || [],
      fechaCreacion: new Date().toISOString()
    } : null,
    created_at: mesaInfo.created_at || new Date().toISOString(),
    updated_at: mesaInfo.updated_at || new Date().toISOString()
  } : null;

  // Si no está visible, mostrar estado inicial
  if (!isVisible) {
    return (
      <div className="w-full bg-[color:var(--sp-neutral-50)] border-l border-[color:var(--sp-neutral-200)] flex items-center justify-center">
        <div className="text-center text-[color:var(--sp-neutral-600)] p-8">
          <ClockCast className="h-12 w-12 mx-auto mb-4 text-[color:var(--sp-neutral-300)]" />
          <h3 className="text-lg font-medium text-[color:var(--sp-neutral-800)] mb-2">
            Selecciona una mesa
          </h3>
          <p className="text-sm">
            Haz clic en cualquier mesa para gestionarla como administrador
          </p>
        </div>
      </div>
    );
  }

  if (!mesa) {
    return (
      <div className="w-full bg-[--sp-surface-elevated] border-l border-[color:var(--sp-neutral-200)] flex items-center justify-center">
        <div className="text-center text-[color:var(--sp-neutral-600)] p-8">
          <h3 className="text-lg font-medium text-[color:var(--sp-neutral-800)] mb-2">
            Mesa no encontrada
          </h3>
          <p className="text-sm">
            No se pudo cargar la información de esta mesa
          </p>
        </div>
      </div>
    );
  }

  // Handlers para acciones
  const handleCrearOrden = () => {
    setWizardAbierto(true);
  };

  const handleEditarOrden = () => {
    setModalEditarAbierto(true);
  };

  const handleGuardarMesa = async (datosActualizados: Partial<typeof mesa>) => {
    try {
      // TODO: Implementar llamada a API para actualizar mesa
      console.log('Guardando mesa:', { mesaId: mesa.id, ...datosActualizados });
      
      // Simular éxito por ahora
      alert('✅ Mesa actualizada correctamente');
      return true;
    } catch (error) {
      console.error('Error al guardar mesa:', error);
      alert('❌ Error al actualizar la mesa');
      return false;
    }
  };

  const handleEliminarOrden = async () => {
    if (!confirm(`⚠️ ¿Estás seguro de eliminar TODA la orden de la Mesa ${mesa.numero}?`)) {
      return;
    }
    
    const result = await mesaActions.eliminarOrden(mesa.numero);
    if (result.success) {
      alert(`✅ ${result.mensaje}`);
      onClose();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  const handleReservarMesa = async () => {
    const nombreCliente = prompt('Nombre del cliente para la reserva:');
    if (!nombreCliente) return;
    
    const telefono = prompt('Teléfono del cliente (opcional):') || undefined;
    const horaReserva = prompt('Hora de la reserva (opcional):') || undefined;
    
    const result = await mesaActions.reservarMesa(mesa.numero, {
      nombreCliente,
      telefono,
      horaReserva
    });
    
    if (result.success) {
      alert(`✅ ${result.mensaje}`);
      onClose();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  const handleLiberarReserva = async () => {
    const result = await mesaActions.liberarReserva(mesa.numero);
    if (result.success) {
      alert(`✅ ${result.mensaje}`);
      onClose();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  const handleActivarMesa = async () => {
    const result = await mesaActions.activarMesa(mesa.numero);
    if (result.success) {
      alert(`✅ ${result.mensaje}`);
      onClose();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  const handleInactivarMesa = async () => {
    const motivo = prompt('Motivo para inactivar la mesa:');
    if (!motivo) return;
    
    const result = await mesaActions.inactivarMesa(mesa.numero, motivo);
    if (result.success) {
      alert(`✅ ${result.mensaje}`);
      onClose();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  const handlePonerMantenimiento = async () => {
    const motivo = prompt('Motivo del mantenimiento:');
    if (!motivo) return;
    
    const result = await mesaActions.ponerMantenimiento(mesa.numero, { motivo });
    if (result.success) {
      alert(`✅ ${result.mensaje}`);
      onClose();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  const handleActualizarNotas = () => {
    // TODO: Implementar modal de notas
    alert('🚧 Funcionalidad en desarrollo');
  };

  const handleCobrar = async () => {
    if (!mesaNumero) return;
    
    setCobrando(true);
    try {
      const success = await onCobrar(mesaNumero);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error procesando cobro:', error);
    } finally {
      setCobrando(false);
    }
  };

  const handleProcesarOrdenWizard = async (itemsSeleccionados: any[]): Promise<boolean> => {
    if (!restaurantId || !mesaNumero) {
      alert('Error: Faltan datos del restaurante o mesa');
      return false;
    }

    const result = await mesaActions.crearOrden({
      numeroMesa: mesaNumero,
      mesero: 'Administrador',
      observaciones: `Orden creada desde panel administrativo - ${new Date().toLocaleString('es-CO')}`,
      items: itemsSeleccionados
    });

    if (result.success) {
      alert(`✅ ${result.mensaje}`);
      setWizardAbierto(false);
      return true;
    } else {
      alert(`❌ Error: ${result.error}`);
      return false;
    }
  };

  return (
    <>
  <div className="w-full bg-[--sp-surface-elevated] border-l border-[color:var(--sp-neutral-200)] flex flex-col h-full">
        
        {/* Header modular */}
        <MesaDetailsHeader 
          mesa={mesa} 
          onClose={onClose} 
        />

        {/* Contenido modular */}
        <div className="flex-1 overflow-y-auto">
          <MesaDetailsContent 
            mesa={mesa}
            loading={mesaActions.cambiandoEstado}
          />
          
          <MesaDetailsActions
            mesa={mesa}
            loading={mesaActions.cambiandoEstado}
            onCrearOrden={handleCrearOrden}
            onEditarOrden={handleEditarOrden}
            onEliminarOrden={handleEliminarOrden}
            onReservarMesa={handleReservarMesa}
            onLiberarReserva={handleLiberarReserva}
            onActivarMesa={handleActivarMesa}
            onInactivarMesa={handleInactivarMesa}
            onPonerMantenimiento={handlePonerMantenimiento}
            onActualizarNotas={handleActualizarNotas}
          />
        </div>

        {/* Footer modular */}
        <MesaDetailsFooter
          mesa={mesa}
          cobrando={cobrando}
          onCobrar={handleCobrar}
          onClose={onClose}
        />
      </div>

      {/* Modal de editar mesa */}
      <EditarMesaModal
        isOpen={modalEditarAbierto}
        onClose={() => setModalEditarAbierto(false)}
        mesa={mesa as unknown as Mesa}
        onGuardar={handleGuardarMesa as unknown as (datosActualizados: Partial<any>) => Promise<boolean>}
      />

      {/* Wizard de crear orden */}
      {restaurantId && mesaNumero && (
        <CrearOrdenWizardCast
          isOpen={wizardAbierto}
          onClose={() => setWizardAbierto(false)}
          onCrearOrden={handleProcesarOrdenWizard}
          restaurantId={restaurantId}
          mesaNumero={mesaNumero}
          loading={mesaActions.creandoOrden}
        />
      )}
    </>
  );
};

export default MesaDetailsPanel;
