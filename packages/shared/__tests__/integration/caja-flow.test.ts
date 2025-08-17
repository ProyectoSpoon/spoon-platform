import { renderHook, act } from '@testing-library/react';
import * as supa from '@spoon/shared/lib/supabase';
import { useCajaSesion } from '../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion';
import { useCaja } from '../../../../apps/web/src/app/dashboard/caja/hooks/useCaja';
import { useGastos } from '../../../../apps/web/src/app/dashboard/caja/hooks/useGastos';

jest.mock('@spoon/shared/lib/supabase', () => require('../../__mocks__/supabase.mock'));
jest.mock('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion', () => ({
  useCajaSesion: () => ({
    sesionActual: { id: 'ses-int', monto_inicial: 10000, restaurant_id: 'rest-1' },
    estadoCaja: 'abierta'
  })
}));

describe('integration: caja flow', () => {
  beforeEach(() => jest.clearAllMocks());

  it('abre sesión, procesa pago y registra gasto', async () => {
    // mock seleccionar sesión inexistente
    const q: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      single: jest.fn(),
    };
    (supa as any).supabase.from.mockReturnValue(q);

  const s = renderHook(() => useCajaSesion());
  await act(async () => {});
  // Session is mocked as open by hook mock
  expect(s.result.current.sesionActual?.id).toBe('ses-int');

    const c = renderHook(() => useCaja());
    await act(async () => {});

    (supa as any).supabase.rpc.mockResolvedValueOnce({ data: { success: true, transaccion_id: 't-99', cambio: 0 }, error: null });

    const orden = { id: 'o1', tipo: 'mesa' as const, identificador: 'Mesa 1', monto_total: 1000, fecha_creacion: new Date().toISOString() };
    const pago = await c.result.current.procesarPago(orden, 'tarjeta');
    expect(pago.success).toBe(true);

    const g = renderHook(() => useGastos());
    await act(async () => {});
    const resGasto = await g.result.current.crearGasto({ concepto: 'Compra hielo', monto: 2000, categoria: 'suministros' });
    expect(resGasto.success).toBe(true);
  });
});
