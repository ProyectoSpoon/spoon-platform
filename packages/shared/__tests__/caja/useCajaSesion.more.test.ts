import { renderHook, act } from '@testing-library/react';
import * as supa from '@spoon/shared/lib/supabase';

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

describe('useCajaSesion - more branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cerrarCaja falla cuando validación RPC bloquea', async () => {
    const q = mockFrom();
    // Hook initial verification finds an open session today
    q.maybeSingle.mockResolvedValue({ data: { id: 'ses-X', abierta_at: new Date().toISOString(), restaurant_id: 'rest-1' }, error: null });
    // cerrarCaja -> validar rpc bloqueado
    (supa as any).supabase.rpc.mockResolvedValueOnce({ data: { bloqueado: true, mensaje: 'Hay pendientes' }, error: null });

    const { useCajaSesion } = await import('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion');
    const { result } = renderHook(() => useCajaSesion());
    await act(async () => {});

    const out = await act(async () => await result.current.cerrarCaja('intentando'));
    // using result.current after act to assert
    expect(result.current.error || '').toMatch(/pendientes|No se puede cerrar la caja/i);
    expect(result.current.estadoCaja).toBe('abierta');
  });

  it('abrirCaja maneja error de conexión (error retornado por RPC)', async () => {
    const q = mockFrom();
    // No session open
    q.maybeSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
    // RPC returns error
    (supa as any).supabase.rpc.mockResolvedValueOnce({ data: null, error: { message: 'db down' } });

    const { useCajaSesion } = await import('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion');
    const { result } = renderHook(() => useCajaSesion());
    await act(async () => {});

    const resp = await result.current.abrirCaja(1234, 'nota');
    expect(resp.success).toBe(false);
    expect(resp.error).toBe('Error de conexión con la base de datos');
  });

  it('abrirCaja devuelve error claro si ya existe una caja abierta (CAJA_YA_ABIERTA)', async () => {
    const q = mockFrom();
    q.maybeSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
    (supa as any).supabase.rpc.mockResolvedValueOnce({ data: { success: false, error_code: 'CAJA_YA_ABIERTA' }, error: null });

    const { useCajaSesion } = await import('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion');
    const { result } = renderHook(() => useCajaSesion());
    await act(async () => {});

    const resp = await result.current.abrirCaja(1000);
    expect(resp.success).toBe(false);
    expect(resp.error).toMatch(/Ya existe una caja abierta/i);
  });

  it('autocierre exitoso de sesión del día previo vía verificarSesionAbierta', async () => {
    const q1: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
    };
    const qUpdate: any = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'ses-prev', estado: 'cerrada' }, error: null }),
    };
    // First call for maybeSingle returns a session from yesterday
    (supa as any).supabase.from
      .mockReturnValueOnce(q1) // verificarSesionAbierta
      .mockReturnValueOnce(qUpdate); // cerrarCaja update

    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    q1.maybeSingle.mockResolvedValue({ data: { id: 'ses-prev', abierta_at: ayer.toISOString(), restaurant_id: 'rest-1' }, error: null });
    // validar RPC no bloquea
    (supa as any).supabase.rpc.mockResolvedValueOnce({ data: { bloqueado: false }, error: null });

    const { useCajaSesion } = await import('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion');
    const { result } = renderHook(() => useCajaSesion());
    await act(async () => {});

    // After mount, autocierre should have succeeded, leaving box closed
    expect(result.current.estadoCaja).toBe('cerrada');
    expect(result.current.sesionActual).toBeNull();
    expect(result.current.requiereSaneamiento).toBe(false);
  });

  it('cerrarCaja sin sesión activa devuelve error inmediato', async () => {
    const q = mockFrom();
    // No open session on mount
    q.maybeSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

    const { useCajaSesion } = await import('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion');
    const { result } = renderHook(() => useCajaSesion());
    await act(async () => {});

    const out = await result.current.cerrarCaja('n/a');
    expect(out.success).toBe(false);
    expect(out.error).toMatch(/No hay sesión activa/i);
  });

  it('verificarSesionAbierta sale temprano si perfil no tiene restaurant_id', async () => {
    const q = mockFrom();
    // Ensure getUserProfile returns no restaurant
    (supa as any).getUserProfile.mockResolvedValueOnce({ id: 'user-1' });
    // If it returned early, maybeSingle should not be called and state remains cerrada
    q.maybeSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

    const { useCajaSesion } = await import('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion');
    const { result } = renderHook(() => useCajaSesion());
    await act(async () => {});

    expect(result.current.estadoCaja).toBe('cerrada');
    expect(result.current.sesionActual).toBeNull();
  });

  it('marca requiereSaneamiento=true cuando cierre automático falla por órdenes activas', async () => {
    const q: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
    };
    (supa as any).supabase.from.mockReturnValue(q);

    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    q.maybeSingle.mockResolvedValue({ data: { id: 'ses-prev2', abierta_at: ayer.toISOString(), restaurant_id: 'rest-1' }, error: null });
    // RPC falla -> fallback encuentra órdenes
    (supa as any).supabase.rpc.mockRejectedValue(new Error('rpc fail'));
    // fallback query returns at least one order active
    q.limit.mockResolvedValue({ data: [{ id: 'o1' }], error: null });

    const { useCajaSesion } = await import('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion');
    const { result } = renderHook(() => useCajaSesion());
    await act(async () => {});

    expect(result.current.estadoCaja).toBe('abierta');
    expect(result.current.requiereSaneamiento).toBe(true);
  });

  it('cerrarCaja devuelve error si update falla', async () => {
    const q1: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
    };
    const qUpdate: any = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { message: 'db err' } }),
    };
    (supa as any).supabase.from
      .mockReturnValueOnce(q1)
      .mockReturnValueOnce(qUpdate);
    q1.maybeSingle.mockResolvedValue({ data: { id: 'ses-open', abierta_at: new Date().toISOString(), restaurant_id: 'rest-1' }, error: null });
    // validar RPC no bloquea
    (supa as any).supabase.rpc.mockResolvedValueOnce({ data: { bloqueado: false }, error: null });

    const { useCajaSesion } = await import('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion');
    const { result } = renderHook(() => useCajaSesion());
    await act(async () => {});

    const out = await result.current.cerrarCaja('closing');
    expect(out.success).toBe(false);
    expect(out.error).toBeDefined();
    // Sigue abierta porque no se pudo cerrar
    expect(result.current.estadoCaja).toBe('abierta');
  });

  it('abrirCaja maneja fallo genérico de la RPC (success=false sin mensaje)', async () => {
    const q = mockFrom();
    q.maybeSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
    (supa as any).supabase.rpc.mockResolvedValueOnce({ data: { success: false }, error: null });

    const { useCajaSesion } = await import('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion');
    const { result } = renderHook(() => useCajaSesion());
    await act(async () => {});

    const resp = await result.current.abrirCaja(50);
    expect(resp.success).toBe(false);
    expect(resp.error).toBe('Error desconocido');
  });

  it('verificarSesionAbierta captura errores e informa en error state', async () => {
    const q = mockFrom();
    // Force maybeSingle error with code not equal to PGRST116
    q.maybeSingle.mockResolvedValue({ data: null, error: { code: '500', message: 'boom' } });

    const { useCajaSesion } = await import('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion');
    const { result } = renderHook(() => useCajaSesion());
    await act(async () => {});

    expect(result.current.error).toBe('boom');
  });
});
