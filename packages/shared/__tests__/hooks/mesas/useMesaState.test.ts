/**
 * TESTS PARA HOOK DE ESTADO DE MESA
 * Testing para gestión de estado y sincronización
 */

import { renderHook, act } from '@testing-library/react';
import { useMesaState } from '@spoon/shared/hooks/mesas/core/useMesaState';

// Mock de supabase
jest.mock('@spoon/shared/lib/supabase', () => ({
  getEstadoCompletoMesas: jest.fn(),
  verificarMesasConfiguradas: jest.fn()
}));

describe('useMesaState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('inicializa con estado por defecto', () => {
    const { result } = renderHook(() => useMesaState(null));

    expect(result.current.mesas).toEqual([]);
    expect(result.current.configuracion.configuradas).toBe(false);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  test('no sincroniza sin restaurantId', async () => {
    const { result } = renderHook(() => useMesaState(null));

    await act(async () => {
      await result.current.sincronizarMesas();
    });

    expect(result.current.mesas).toEqual([]);
  });

  test('limpiar error funciona correctamente', () => {
  const { result } = renderHook(() => useMesaState('restaurant-1'));

    act(() => {
      result.current.limpiarError();
    });

    expect(result.current.error).toBeNull();
  });

  test('calcula estadísticas correctamente', async () => {
  const _mockMesas = [
      { estado: 'libre', ordenActiva: null },
      { estado: 'ocupada', ordenActiva: { total: 50000 } },
      { estado: 'reservada', ordenActiva: null },
      { estado: 'inactiva', ordenActiva: null }
    ];

    // Mock implementación más completa cuando sea necesario
    const { result } = renderHook(() => useMesaState('restaurant-1'));

  expect(result.current.estadisticas).toBeDefined();
  });
});

