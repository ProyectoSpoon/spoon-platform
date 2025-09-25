import { renderHook, act } from '@testing-library/react';
import * as supa from '@spoon/shared/lib/supabase';
import { useCajaSesion } from '@/app/dashboard/caja/hooks/useCajaSesion';

jest.mock('@spoon/shared/lib/supabase', () => require('../../__mocks__/supabase.mock'));

const mockFrom = () => {
  const q: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(),
    single: jest.fn(),
    update: jest.fn().mockReturnThis(),
  };
  (supa as any).supabase.from.mockReturnValue(q);
  return q;
};

describe('useCajaSesion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('verifica y establece sesión abierta del día', async () => {
    const q = mockFrom();

    // first call: caja_sesiones select ... maybeSingle
    q.maybeSingle.mockResolvedValue({ data: {
      id: 'ses-1', restaurant_id: 'rest-1', cajero_id: 'user-1', monto_inicial: 10000, estado: 'abierta', abierta_at: new Date().toISOString()
    }, error: null });

    const { result } = renderHook(() => useCajaSesion());

    // wait microtasks
    await act(async () => {});

    expect(result.current.estadoCaja).toBe('abierta');
    expect(result.current.sesionActual?.id).toBe('ses-1');
  });

  it('abrirCaja llama RPC y setea sesión', async () => {
    const q = mockFrom();
    // verificarSesionAbierta path -> none
    q.maybeSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

    // abrir rpc then select single
    (supa as any).supabase.rpc.mockResolvedValue({ data: { success: true, sesion_id: 'ses-2' }, error: null });
    q.single.mockResolvedValue({ data: { id: 'ses-2', estado: 'abierta', abierta_at: new Date().toISOString(), restaurant_id: 'rest-1', monto_inicial: 5000, cajero_id: 'user-1' }, error: null });

    const { result } = renderHook(() => useCajaSesion());
    await act(async () => {});

    await act(async () => {
      const res = await result.current.abrirCaja(5000, 'inicio');
      expect(res.success).toBe(true);
    });

  // Verifica que la RPC reciba p_monto_inicial en PESOS (5000)
  const rpcArgs = (supa as any).supabase.rpc.mock.calls[0]?.[1];
  expect(rpcArgs?.p_monto_inicial).toBe(5000);
  expect(rpcArgs?.p_cajero_id).toBe('user-1');

    expect(result.current.estadoCaja).toBe('abierta');
    expect(result.current.sesionActual?.id).toBe('ses-2');
  });

  it('cerrarCaja actualiza estado a cerrada', async () => {
    const q = mockFrom();
    // Initially session open
    q.maybeSingle.mockResolvedValue({ data: { id: 'ses-3', restaurant_id: 'rest-1', cajero_id: 'user-1', monto_inicial: 1000, estado: 'abierta', abierta_at: new Date().toISOString() }, error: null });

    const qUpdate: any = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'ses-3', estado: 'cerrada' }, error: null }),
    };
    (supa as any).supabase.from.mockReturnValueOnce(q).mockReturnValueOnce(qUpdate);

    const { result } = renderHook(() => useCajaSesion());
    await act(async () => {});

    await act(async () => {
      const res = await result.current.cerrarCaja('fin');
      expect(res.success).toBe(true);
    });

    expect(result.current.estadoCaja).toBe('cerrada');
    expect(result.current.sesionActual).toBeNull();
  });
});
