import { renderHook, act } from '@testing-library/react';
import * as supa from '@spoon/shared/lib/supabase';
import { useCaja } from '../../../../apps/web/src/app/dashboard/caja/hooks/useCaja';

jest.mock('@spoon/shared/lib/supabase', () => require('../../__mocks__/supabase.mock'));
// Mock useCajaSesion to provide an open session
jest.mock('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion', () => ({
  useCajaSesion: () => ({
    sesionActual: { id: 'ses-1', monto_inicial: 0, restaurant_id: 'rest-1' },
    estadoCaja: 'abierta'
  })
}));

const setupListQueries = () => {
  const q: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  };
  (supa as any).supabase.from.mockReturnValue(q);
  // mesas
  q.select.mockReturnThis?.();
  q.order.mockResolvedValue?.({ data: [], error: null });
  return q;
};

describe('useCaja', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('carga métricas y procesa pago exitoso', async () => {
    setupListQueries();

    // getTransaccionesDelDia mocked by default to zeros
    const { result } = renderHook(() => useCaja());
    await act(async () => {});

    expect(result.current.metricas.ventasTotales).toBe(0);

    // procesarPago path success
    (supa as any).supabase.rpc.mockResolvedValue({ data: { success: true, transaccion_id: 't-1', cambio: 500 }, error: null });

    const orden = { id: 'o1', tipo: 'mesa' as const, identificador: 'Mesa 1', monto_total: 1000, fecha_creacion: new Date().toISOString() };

    const res = await result.current.procesarPago(orden, 'efectivo', 1500);
    expect(res.success).toBe(true);
    expect(res.cambio).toBe(500);
  });

  it('procesarPago maneja errores de validación', async () => {
    setupListQueries();

    (supa as any).supabase.rpc.mockResolvedValue({ data: { success: false, error_code: 'REQUIERE_AUTORIZACION', security_details: { warnings: ['límite excedido'] } }, error: null });

    const { result } = renderHook(() => useCaja());
    await act(async () => {});

    const orden = { id: 'o1', tipo: 'mesa' as const, identificador: 'Mesa 1', monto_total: 1000, fecha_creacion: new Date().toISOString() };

    const res = await result.current.procesarPago(orden, 'tarjeta');
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/Autorización requerida/);
  });

  it('calcularCambio calcula correctamente', () => {
    const { result } = renderHook(() => useCaja());
    expect(result.current.calcularCambio(1000, 1500)).toBe(500);
    expect(result.current.calcularCambio(1000, 900)).toBe(0);
  });
});
