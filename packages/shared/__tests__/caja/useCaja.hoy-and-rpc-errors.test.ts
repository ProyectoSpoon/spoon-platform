import { renderHook, act } from '@testing-library/react';
import * as supa from '@spoon/shared/lib/supabase';
import { useCaja } from '../../../../apps/web/src/app/dashboard/caja/hooks/useCaja';

jest.mock('@spoon/shared/lib/supabase', () => require('../../__mocks__/supabase.mock'));

// Mock session open
jest.mock('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion', () => ({
  useCajaSesion: () => ({
    sesionActual: { id: 'ses-hoy', monto_inicial: 500, restaurant_id: 'rest-1' },
    estadoCaja: 'abierta',
  }),
}));

describe('useCaja - periodo hoy y procesarPago error codes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const chans = (supa as any).supabase.__channels as any[];
    if (chans) chans.length = 0;
  });

  const setupListQueries = (mesas: any[] = [], delivery: any[] = []) => {
    (supa as any).supabase.from.mockImplementation((table: string) => {
      const q: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: table === 'ordenes_mesa' ? mesas : delivery,
          error: null,
        }),
      };
      return q;
    });
  };

  it('usa getTransaccionesDelDia cuando periodo es hoy', async () => {
    setupListQueries([{ id: 'm3', numero_mesa: 3, monto_total: 150, fecha_creacion: new Date().toISOString() }]);
  (supa as any).getTransaccionesDelDia.mockResolvedValue({
      transacciones: [
        { id: 't-h1', metodo_pago: 'efectivo', monto_total: 100 },
        { id: 't-h2', metodo_pago: 'tarjeta', monto_total: 200 },
      ],
      totalVentas: 300,
      totalEfectivo: 100,
      totalTarjeta: 200,
      totalDigital: 0,
    });
  (supa as any).getGastosDelDia.mockResolvedValue({
      gastos: [{ id: 'g-h1', monto: 80 }],
      totalGastos: 80,
      gastosPorCategoria: { proveedor: 80, servicios: 0, suministros: 0, otro: 0 },
    });

    const { result } = renderHook(() => useCaja());
    await act(async () => {
      // ensure we're on 'hoy' and trigger refresh
      result.current.setPeriodo('hoy');
      await result.current.refrescar();
      await Promise.resolve();
    });

    expect(result.current.metricas.ventasTotales).toBe(300);
    expect(result.current.metricas.totalEfectivo).toBe(100);
    expect(result.current.metricas.totalTarjeta).toBe(200);
  expect(result.current.metricas.gastosTotales).toBe(80);
  // Balance solo efectivo: 500 + 100 (efectivo) - 80 = 520
  expect(result.current.metricas.balance).toBe(520);
  });

  it('procesarPago maneja VALIDACION_SEGURIDAD_FALLIDA y REQUIERE_AUTORIZACION', async () => {
    setupListQueries();
    const { result } = renderHook(() => useCaja());

    // Mock RPC to return security validation failed on first call
    (supa as any).supabase.rpc.mockResolvedValueOnce({
      data: { success: false, error_code: 'VALIDACION_SEGURIDAD_FALLIDA', security_details: { blocks: ['limite'] } },
      error: null,
    });

    const orden: any = { id: 'o-1', tipo: 'mesa', identificador: 'Mesa 1', monto_total: 100 };

    let out = await result.current.procesarPago(orden, 'efectivo', 100);
    expect(out.success).toBe(false);
    expect(out.error).toMatch(/Transacción bloqueada/);

    // Mock RPC to require authorization
    (supa as any).supabase.rpc.mockResolvedValueOnce({
      data: { success: false, error_code: 'REQUIERE_AUTORIZACION', security_details: { warnings: ['aprobación'] } },
      error: null,
    });
    out = await result.current.procesarPago(orden, 'efectivo', 100);
    expect(out.success).toBe(false);
    expect(out.error).toMatch(/Autorización requerida/);

    // Mock RPC default error
    (supa as any).supabase.rpc.mockResolvedValueOnce({ data: { success: false, mensaje: 'Fallo' }, error: null });
    out = await result.current.procesarPago(orden, 'efectivo', 100);
    expect(out.success).toBe(false);
    expect(out.error).toBe('Fallo');
  });
});
