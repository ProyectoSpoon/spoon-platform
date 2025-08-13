/**
 * TESTS DE INTEGRACIÓN PARA MÓDULO DE MESAS
 * Testing de flujos completos
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useMesas } from '@spoon/shared/hooks/mesas';

// Mock completo de supabase
jest.mock('../../lib/supabase', () => ({
  getUserRestaurant: jest.fn().mockResolvedValue({ id: 'restaurant-1' }),
  getEstadoCompletoMesas: jest.fn().mockResolvedValue({ mesas: [] }),
  verificarMesasConfiguradas: jest.fn().mockResolvedValue({
    configuradas: true,
    totalMesas: 8,
    zonas: ['Principal', 'Terraza']
  }),
  crearOrdenMesa: jest.fn(),
  cobrarMesa: jest.fn(),
  configurarMesas: jest.fn()
}));

describe('Integración: Flujos de Mesa', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('flujo completo: cargar mesas → crear orden → cobrar', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useMesas());

    // Esperar inicialización
    await waitForNextUpdate();

    // Verificar estado inicial
    expect(result.current.restaurantId).toBe('restaurant-1');
    expect(result.current.configuracion.configuradas).toBe(true);

    // Crear orden
    const ordenData = {
      numeroMesa: 1,
      items: [{ tipo: 'menu_dia' as const, cantidad: 2, precioUnitario: 15000 }]
    };

    let ordenResult;
    await act(async () => {
      ordenResult = await result.current.crearOrden(ordenData);
    });

    expect(ordenResult).toBeDefined();

    // Cobrar mesa
    let cobroResult;
    await act(async () => {
      cobroResult = await result.current.procesarCobro(1);
    });

    expect(typeof cobroResult).toBe('boolean');
  });

  test('flujo de configuración inicial', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useMesas());

    await waitForNextUpdate();

    // Configurar mesas iniciales
    let configResult;
    await act(async () => {
      configResult = await result.current.configurarMesasIniciales(12);
    });

    expect(typeof configResult).toBe('boolean');
  });

  test('compatibilidad con API anterior', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useMesas());

    await waitForNextUpdate();

    // Verificar que mantiene estructura anterior
    expect(result.current.mesasOcupadas).toBeDefined();
    expect(result.current.loading).toBeDefined();
    expect(result.current.cargarMesas).toBeDefined();
    expect(result.current.procesarCobro).toBeDefined();

    // Verificar nuevas funcionalidades
    expect(result.current.estadisticas).toBeDefined();
    expect(result.current.mesasCompletas).toBeDefined();
    expect(result.current.crearOrden).toBeDefined();
  });
});


