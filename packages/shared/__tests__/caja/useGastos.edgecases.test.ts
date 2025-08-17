import { renderHook } from '@testing-library/react';
import * as supa from '@spoon/shared/lib/supabase';

jest.mock('@spoon/shared/lib/supabase', () => require('../../__mocks__/supabase.mock'));

// Mock session open
jest.mock('../../../../apps/web/src/app/dashboard/caja/hooks/useCajaSesion', () => ({
  useCajaSesion: () => ({ sesionActual: { id: 'ses-1' } }),
}));

describe('useGastos edge cases', () => {
  beforeEach(() => jest.clearAllMocks());

  it('falla crear gasto si no hay usuario autenticado', async () => {
    jest.isolateModules(async () => {
      // Override getUserProfile to return null via mock file surface
      (supa as any).getUserProfile.mockResolvedValue(null);
      const { useGastos } = await import('../../../../apps/web/src/app/dashboard/caja/hooks/useGastos');
      const { result } = renderHook(() => useGastos());
      const res = await result.current.crearGasto({ concepto: 'x', monto: 1000, categoria: 'otro' });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Usuario no autenticado/);
    });
  });
});
