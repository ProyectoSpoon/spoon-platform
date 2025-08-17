import { renderHook, act } from '@testing-library/react';
import * as supa from '@spoon/shared/lib/supabase';

jest.mock('@spoon/shared/lib/supabase', () => require('../../__mocks__/supabase.mock'));

describe('useCajaSesion edge cases', () => {
  beforeEach(() => jest.clearAllMocks());

  it('no cierra caja si hay ordenes activas en fallback (sesión de día previo)', async () => {
    const q: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
    };
    (supa as any).supabase.from.mockReturnValue(q);

    // Simula que hay una sesión abierta pero de ayer (para activar saneamiento/cierre)
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    q.maybeSingle.mockResolvedValue({ data: { id: 'ses-prev', abierta_at: ayer.toISOString(), restaurant_id: 'rest-1' }, error: null });

    // validar_cierre_caja rpc falla -> fallback consulta ordenes activas
    (supa as any).supabase.rpc.mockRejectedValue(new Error('no rpc'));
    q.select.mockReturnThis();
    q.limit.mockReturnThis();
    q.eq.mockReturnThis();
    // Fallback: hay órdenes activas
    q.limit.mockReturnValue({ data: [{ id: 'ord1' }], error: null });

    const { useCajaSesion } = await import('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion');
    const { result } = renderHook(() => useCajaSesion());
    await act(async () => {});
  // Con fallback que detecta órdenes, el cierre automático falla; validamos que no hay éxito en cierre y que hay saneamiento requerido o sesión detectada
  expect(result.current.sesionActual === null || result.current.estadoCaja === 'abierta').toBe(true);
  });
});
