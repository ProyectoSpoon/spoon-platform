import { renderHook } from '@testing-library/react';
import * as supa from '@spoon/shared/lib/supabase';

jest.mock('@spoon/shared/lib/supabase', () => require('../../__mocks__/supabase.mock'));

describe('useCaja edge cases', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna error si no hay sesión abierta', async () => {
    jest.isolateModules(async () => {
      jest.doMock('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion', () => ({
        useCajaSesion: () => ({ sesionActual: null, estadoCaja: 'cerrada' })
      }));
      const { useCaja } = await import('../../../../apps/web/src/app/dashboard/caja/hooks/useCaja');
      const { result } = renderHook(() => useCaja());
      const orden = { id: 'o1', tipo: 'mesa' as const, identificador: 'Mesa 1', monto_total: 1000, fecha_creacion: new Date().toISOString() };
      const res = await result.current.procesarPago(orden, 'efectivo', 1500);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/No hay sesión de caja abierta/);
    });
  });

  it('propaga error de RPC al procesar pago', async () => {
    jest.isolateModules(async () => {
      jest.doMock('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion', () => ({
        useCajaSesion: () => ({ sesionActual: { id: 'ses-x', monto_inicial: 0, restaurant_id: 'rest-1' }, estadoCaja: 'abierta' })
      }));
      const { useCaja } = await import('../../../../apps/web/src/app/dashboard/caja/hooks/useCaja');
      (supa as any).supabase.rpc.mockResolvedValue({ data: null, error: { message: 'db down' } });
      const { result } = renderHook(() => useCaja());
      const orden = { id: 'o2', tipo: 'mesa' as const, identificador: 'Mesa 1', monto_total: 1000, fecha_creacion: new Date().toISOString() };
      const res = await result.current.procesarPago(orden, 'tarjeta');
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });
  });
});
