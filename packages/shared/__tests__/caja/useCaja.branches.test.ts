import { renderHook, act } from '@testing-library/react';
import * as supa from '@spoon/shared/lib/supabase';
import { useCaja } from '../../../../apps/web/src/app/dashboard/caja/hooks/useCaja';

jest.mock('@spoon/shared/lib/supabase', () => require('../../__mocks__/supabase.mock'));

let mockSesion: any = { sesionActual: null, estadoCaja: 'cerrada' };
jest.mock('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion', () => ({
  useCajaSesion: () => mockSesion,
}));

describe('useCaja - branch coverage', () => {
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

  it('no crea websockets cuando la caja está cerrada y balance queda 0 sin sesión', async () => {
    setupListQueries([{ id: 'm1', numero_mesa: 1, monto_total: 100, fecha_creacion: new Date().toISOString() }]);
    mockSesion = { sesionActual: null, estadoCaja: 'cerrada' };
    const { result } = renderHook(() => useCaja());
    await act(async () => {
      result.current.setPeriodo('semana');
      await result.current.refrescar();
    });

    const channels = (supa as any).supabase.__channels as any[];
    expect(channels.length).toBe(0);
    expect(result.current.metricas.balance).toBe(0);
  });

  it('usa fallback de unsubscribe cuando subscribe no existe', async () => {
    // Patch channel() to create channels sin subscribe
    const origChannel = (supa as any).supabase.channel;
    (supa as any).supabase.channel = jest.fn((name: string) => {
      const base = origChannel(name);
      base.subscribe = undefined;
      return base;
    });

    mockSesion = { sesionActual: { id: 'ses-fb', monto_inicial: 0, restaurant_id: 'rest-1' }, estadoCaja: 'abierta' };
    const { unmount } = renderHook(() => useCaja());
    await act(async () => {});

    const channels = (supa as any).supabase.__channels as any[];
    expect(channels.length).toBeGreaterThan(0);

    // trigger cleanup
    unmount();
    channels.forEach((c: any) => {
      expect(c.unsubscribe).toHaveBeenCalled();
    });

    // restore
    (supa as any).supabase.channel = origChannel;
  });

  it('crea canal global de órdenes cuando no hay restaurant_id', async () => {
    setupListQueries();
  mockSesion = { sesionActual: { id: 'ses-no-restaurant', monto_inicial: 0 }, estadoCaja: 'abierta' };
  renderHook(() => useCaja());
    await act(async () => {});
    const channels = (supa as any).supabase.__channels as any[];
    const globalCh = channels.find((c: any) => c.name === 'ordenes-caja-global');
    expect(globalCh).toBeDefined();
  });
});
