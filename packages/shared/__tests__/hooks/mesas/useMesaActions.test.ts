/**
 * TESTS PARA HOOK DE ACCIONES DE MESA
 * Testing para acciones de mesa
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useMesaActions } from '@spoon/shared/hooks/mesas/core/useMesaActions';

// Mock de supabase
jest.mock('../../lib/supabase', () => ({
  crearOrdenMesa: jest.fn(),
  cobrarMesa: jest.fn(),
  reservarMesaManual: jest.fn(),
  eliminarOrdenMesa: jest.fn()
}));

describe('useMesaActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('inicializa con estados de carga false', () => {
    const { result } = renderHook(() => useMesaActions('restaurant-1'));

    expect(result.current.creandoOrden).toBe(false);
    expect(result.current.procesandoCobro).toBe(false);
    expect(result.current.cambiandoEstado).toBe(false);
  });

  test('crear orden sin restaurantId retorna error', async () => {
    const { result } = renderHook(() => useMesaActions(null));

    const ordenData = {
      numeroMesa: 1,
      items: [{ tipo: 'menu_dia' as const, cantidad: 1, precioUnitario: 15000 }]
    };

    let response;
    await act(async () => {
      response = await result.current.crearOrden(ordenData);
    });

    expect(response.success).toBe(false);
    expect(response.error).toBe('Restaurant ID no disponible');
  });

  test('cobrar mesa sin restaurantId retorna error', async () => {
    const { result } = renderHook(() => useMesaActions(null));

    let response;
    await act(async () => {
      response = await result.current.cobrarMesa(1);
    });

    expect(response.success).toBe(false);
    expect(response.error).toBe('Restaurant ID no disponible');
  });

  test('validación de crear orden funciona', async () => {
    const { result } = renderHook(() => useMesaActions('restaurant-1'));

    const ordenInvalida = {
      numeroMesa: 0, // Inválido
      items: []      // Vacío
    };

    let response;
    await act(async () => {
      response = await result.current.crearOrden(ordenInvalida);
    });

    expect(response.success).toBe(false);
    expect(response.error).toContain('Número de mesa inválido');
  });
});

