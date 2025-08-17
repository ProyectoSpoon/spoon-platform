import { renderHook, act } from '@testing-library/react';
import * as supa from '@spoon/shared/lib/supabase';
import { useGastos } from '../../../../apps/web/src/app/dashboard/caja/hooks/useGastos';

jest.mock('@spoon/shared/lib/supabase', () => require('../../__mocks__/supabase.mock'));
// Provide open session for useGastos
jest.mock('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion', () => ({
  useCajaSesion: () => ({ sesionActual: { id: 'ses-1' } })
}));

const mockFrom = () => {
  const q: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };
  (supa as any).supabase.from.mockReturnValue(q);
  return q;
};

describe('useGastos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('carga gastos al montar y permite crear y eliminar', async () => {
    mockFrom();
    const { result } = renderHook(() => useGastos());

    await act(async () => {});

    expect(result.current.totalGastos).toBe(0);

    await act(async () => {
      const res = await result.current.crearGasto({ concepto: 'Agua', monto: 1500, categoria: 'servicios' });
      expect(res.success).toBe(true);
    });

    await act(async () => {
      const res = await result.current.eliminarGasto('g-1');
      expect(res.success).toBe(true);
    });
  });

  it('valida gasto correctamente', () => {
    const { result } = renderHook(() => useGastos());

    const inval = result.current.validarGasto({ concepto: 'a', monto: -1, categoria: 'otro' });
    expect(inval.esValido).toBe(false);

    const val = result.current.validarGasto({ concepto: 'Compra', monto: 1000, categoria: 'proveedor' });
    expect(val.esValido).toBe(true);
  });
});
