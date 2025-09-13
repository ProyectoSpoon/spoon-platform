'use client';

import { useState, useMemo, useCallback } from 'react';
import { usePedidos } from '../hooks/usePedidos';
import { useDomiciliarios } from '../hooks/useDomiciliarios';
import { useMenuDelDia } from '../hooks/useMenuDelDia';
import { ESTADOS_PEDIDO, ESTADOS_DOMICILIARIO } from '../constants/domiciliosConstants';

export function useDomiciliosPageController() {
  const {
    pedidos,
    loading: loadingPedidos,
    loadingStates,
    crearPedido,
    actualizarEstado,
    registrarPago,
    cargarPedidos,
    filtros,
    updateFiltros,
    loadMore,
    limit,
    hasOpenCajaSession,
  } = usePedidos();

  const {
    domiciliarios,
    domiciliariosDisponibles,
    loading: loadingDomiciliarios,
    agregarDomiciliario,
    actualizarEstado: actualizarEstadoDomiciliario,
  } = useDomiciliarios();

  const {
    menu,
    loading: loadingMenu,
    hayMenuHoy,
  } = useMenuDelDia();

  const [tab, setTab] = useState<'hoy' | 'historial'>('hoy');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pedidoParaPago, setPedidoParaPago] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  const metrics = useMemo(() => {
    // Un solo recorrido para minimizar costos en listas largas
    let pendientes = 0, enRuta = 0, entregados = 0, totalDia = 0;
    for (const p of pedidos) {
      if (p.status === ESTADOS_PEDIDO.RECIBIDO || p.status === ESTADOS_PEDIDO.COCINANDO) pendientes++;
      else if (p.status === ESTADOS_PEDIDO.ENVIADO) enRuta++;
      else if (p.status === ESTADOS_PEDIDO.ENTREGADO || p.status === ESTADOS_PEDIDO.PAGADO) entregados++;
      totalDia += (p.total_amount + p.delivery_fee);
    }
    const disponibles = domiciliariosDisponibles.length;
    return { pendientes, enRuta, entregados, totalDia, disponibles };
  }, [pedidos, domiciliariosDisponibles.length]);

  const counts = useMemo(() => ({
    totalDomiciliarios: domiciliarios.length,
    disponibles: domiciliariosDisponibles.length,
    ocupados: domiciliarios.filter(d => d.status === ESTADOS_DOMICILIARIO.OCUPADO).length,
    desconectados: domiciliarios.filter(d => d.status === ESTADOS_DOMICILIARIO.DESCONECTADO).length,
  }), [domiciliarios, domiciliariosDisponibles]);

  const isCompact = useMemo(() => pedidos.length < 3, [pedidos.length]);

  const onChangeTab = useCallback((nuevo: 'hoy' | 'historial') => {
    setTab(nuevo);
    if (nuevo === 'hoy') {
      updateFiltros({ fecha: 'hoy' });
    } else {
      updateFiltros({ fecha: 'semana' });
    }
  }, [updateFiltros]);

  const onAplicarFiltros = useCallback(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  return {
    // data
    pedidos,
    domiciliarios,
    domiciliariosDisponibles,
    menu,
  hayMenuHoy,
    filtros,

    // loading
    loadingPedidos,
    loadingDomiciliarios,
    loadingMenu,
    loadingStates,

    // caja
    hasOpenCajaSession,

    // pagination/limits
    limit,

    // ui state
    tab, setTab,
    mostrarFormulario, setMostrarFormulario,
    pedidoParaPago, setPedidoParaPago,
    wizardOpen, setWizardOpen,
    isCompact,

    // metrics and counts
    ...metrics,
    counts,

    // actions
  crearPedido,
  actualizarEstado,
  actualizarEstadoDomiciliario,
  registrarPago,
  cargarPedidos,
  updateFiltros,
  loadMore,
  agregarDomiciliario,
  onChangeTab,
  onAplicarFiltros,
  };
}
