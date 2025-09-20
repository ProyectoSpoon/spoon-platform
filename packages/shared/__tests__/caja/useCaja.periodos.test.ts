import { renderHook, act } from '@testing-library/react';
import * as supa from '@spoon/shared/lib/supabase';
import { useCaja } from '../../../../apps/web/src/app/dashboard/caja/hooks/useCaja';

jest.mock('@spoon/shared/lib/supabase', () => require('../../__mocks__/supabase.mock'));
// Mock useCajaSesion to provide an open session
jest.mock('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion', () => ({
  useCajaSesion: () => ({
    sesionActual: { id: 'ses-1', monto_inicial: 1000, restaurant_id: 'rest-1' },
    estadoCaja: 'abierta'
  })
}));

describe('useCaja - periodos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  // reset channels registry
  const chans = (supa as any).supabase.__channels as any[];
  if (chans) chans.length = 0;
  });

  const setupListQueries = (mesas: any[] = [], delivery: any[] = []) => {
    // Provide stable mocks for any number of calls
    (supa as any).supabase.from.mockImplementation((table: string) => {
      const q: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: table === 'ordenes_mesa' ? mesas : delivery,
          error: null
        })
      };
      return q;
    });
  };

  it('calcula métricas para semana usando getTransaccionesYGastosEnRango', async () => {
    setupListQueries();
    (supa as any).getTransaccionesYGastosEnRango.mockResolvedValue({
      transacciones: [{ id: 't1', metodo_pago: 'efectivo', monto_total: 200 }],
      totalVentas: 200,
      totalEfectivo: 200,
      totalTarjeta: 0,
      totalDigital: 0,
      totalGastos: 50,
      gastos: []
    });

    const { result } = renderHook(() => useCaja());

    await act(async () => {
      result.current.setPeriodo('semana');
    });
    await act(async () => {
      await result.current.refrescar();
      await Promise.resolve();
    });

    expect(result.current.metricas.ventasTotales).toBe(200);
    expect(result.current.metricas.gastosTotales).toBe(50);
    // balance = monto_inicial (1000) + 200 - 50
    expect(result.current.metricas.balance).toBe(1150);
  });

  it('calcula métricas para mes', async () => {
    setupListQueries();
    (supa as any).getTransaccionesYGastosEnRango.mockResolvedValue({
      transacciones: [{ id: 't2', metodo_pago: 'tarjeta', monto_total: 500 }],
      totalVentas: 500,
      totalEfectivo: 0,
      totalTarjeta: 500,
      totalDigital: 0,
      totalGastos: 0,
      gastos: []
    });

    const { result } = renderHook(() => useCaja());

    await act(async () => {
      result.current.setPeriodo('mes');
    });
    await act(async () => {
      await result.current.refrescar();
      await Promise.resolve();
    });

  expect(result.current.metricas.totalTarjeta).toBe(500);
  expect(result.current.metricas.ventasTotales).toBe(500);
  // Balance solo cuenta efectivo: 1000 + 0 (efectivo) - 0 = 1000
  expect(result.current.metricas.balance).toBe(1000);
  });

  it('calcula métricas para personalizado usando fechaFinFiltro', async () => {
    setupListQueries();
    (supa as any).getTransaccionesYGastosEnRango.mockResolvedValue({
      transacciones: [{ id: 't3', metodo_pago: 'digital', monto_total: 300 }],
      totalVentas: 300,
      totalEfectivo: 0,
      totalTarjeta: 0,
      totalDigital: 300,
      totalGastos: 100,
      gastos: []
    });

    const { result } = renderHook(() => useCaja());

    await act(async () => {
      result.current.setPeriodo('personalizado');
      result.current.setFechaFinFiltro('2099-12-31');
    });
    await act(async () => {
      await result.current.refrescar();
      await Promise.resolve();
    });

  expect(result.current.metricas.totalDigital).toBe(300);
  expect(result.current.metricas.gastosTotales).toBe(100);
  // Balance solo cuenta efectivo: 1000 + 0 (efectivo) - 100 = 900
  expect(result.current.metricas.balance).toBe(900);
  });
});
