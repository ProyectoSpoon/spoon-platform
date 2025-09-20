import { renderHook, act } from '@testing-library/react';
import * as supa from '@spoon/shared/lib/supabase';
import { useCaja } from '../../../../apps/web/src/app/dashboard/caja/hooks/useCaja';

jest.mock('@spoon/shared/lib/supabase', () => require('../../__mocks__/supabase.mock'));
jest.mock('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion', () => ({
  useCajaSesion: () => ({
    sesionActual: { id: 'ses-rt', monto_inicial: 0, restaurant_id: 'rest-1' },
    estadoCaja: 'abierta'
  })
}));

describe('useCaja - realtime updates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  const chans = (supa as any).supabase.__channels as any[];
  if (chans) chans.length = 0;
  });

  const setupListQueries = (mesas: any[] = [{ id: 'm1', numero_mesa: 1, monto_total: 100, fecha_creacion: new Date().toISOString() }], delivery: any[] = []) => {
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

  it('aplica INSERT transacción en efectivo sumando totales y balance', async () => {
    setupListQueries();
    const { result } = renderHook(() => useCaja());
    await act(async () => {});

    // Emit a new transaction event on channel transacciones-ses-rt
    const channels = (supa as any).supabase.__channels as any[];
    const ch = channels.find((c: any) => c.name === 'transacciones-ses-rt');
    expect(ch).toBeDefined();

    await act(async () => {
      ch.emit('postgres_changes', { new: { id: 't-rt', metodo_pago: 'efectivo', monto_total: 250 } });
      await Promise.resolve();
    });

    expect(result.current.metricas.ventasTotales).toBe(250);
    expect(result.current.metricas.totalEfectivo).toBe(250);
    expect(result.current.metricas.balance).toBe(250);
  });

  it('aplica INSERT tarjeta y digital actualizando totales por método, sin cambiar balance', async () => {
    setupListQueries();
    const { result } = renderHook(() => useCaja());
    await act(async () => {});

    const channels = (supa as any).supabase.__channels as any[];
    const ch = channels.find((c: any) => c.name === 'transacciones-ses-rt');
    expect(ch).toBeDefined();

    await act(async () => {
      ch.emit('postgres_changes', { new: { id: 't-1', metodo_pago: 'tarjeta', monto_total: 300 } });
      ch.emit('postgres_changes', { new: { id: 't-2', metodo_pago: 'digital', monto_total: 150 } });
      await Promise.resolve();
    });

    expect(result.current.metricas.totalTarjeta).toBe(300);
    expect(result.current.metricas.totalDigital).toBe(150);
    expect(result.current.metricas.ventasTotales).toBe(450);
    // Balance no cambia porque no hubo efectivo
    expect(result.current.metricas.balance).toBe(0);
  });

  it('aplica INSERT gasto restando balance y sumando gastos', async () => {
    setupListQueries();
    const { result } = renderHook(() => useCaja());
    await act(async () => {});

    const channels = (supa as any).supabase.__channels as any[];
    const ch = channels.find((c: any) => c.name === 'gastos-ses-rt');
    expect(ch).toBeDefined();

    await act(async () => {
      ch.emit('postgres_changes', { new: { id: 'g-rt', monto: 40 } });
      await Promise.resolve();
    });

    expect(result.current.metricas.gastosTotales).toBe(40);
    expect(result.current.metricas.balance).toBe(-40);
  });

  it('elimina orden mesa pagada y actualiza porCobrar', async () => {
    setupListQueries([{ id: 'm2', numero_mesa: 2, monto_total: 100, fecha_creacion: new Date().toISOString() }]);
    const { result } = renderHook(() => useCaja());
    await act(async () => {});

    // porCobrar initially 100
    expect(result.current.metricas.porCobrar).toBe(100);

    const channels = (supa as any).supabase.__channels as any[];
    const ch = channels.find((c: any) => c.name === 'ordenes-caja-rest-1');
    expect(ch).toBeDefined();

    await act(async () => {
      ch.emit('postgres_changes', { old: { estado: 'activa' }, new: { id: 'm2', estado: 'pagada', monto_total: 100 } });
      await Promise.resolve();
    });

    expect(result.current.metricas.porCobrar).toBe(0);
    expect(result.current.totalOrdenesPendientes).toBe(0);
  });
});
