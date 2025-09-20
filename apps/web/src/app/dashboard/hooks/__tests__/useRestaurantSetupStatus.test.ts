import { renderHook, waitFor } from '@testing-library/react';
// @ts-ignore - La app tsconfig excluye __tests__; el editor no aplica paths.
// Jest usa tsconfig.jest.json donde sí existe el alias @spoon/shared/*.
import * as supa from '@spoon/shared/lib/supabase';
import { useRestaurantSetupStatus } from '../useRestaurantSetupStatus';

// Mock del módulo de supabase para evitar efectos de entorno (env vars)
jest.mock('@spoon/shared/lib/supabase', () => ({
  getUserRestaurant: jest.fn(),
  subscribeToRestaurantUpdates: jest.fn(() => ({ unsubscribe: jest.fn() })),
}));

// Simple mock channel
const mockSubscribe = (cb: () => void) => ({ unsubscribe: jest.fn(), _cb: cb });

describe('useRestaurantSetupStatus', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('detecta faltantes múltiples', async () => {
    const restaurant: any = {
      id: 'r1',
      name: '',
      contact_phone: '',
      cuisine_type_id: null,
      cuisine_type: null,
      city_id: null,
      address: '',
      city: '',
      state: '',
      business_hours: null,
      logo_url: null,
      cover_image_url: null,
    };

    jest.spyOn(supa, 'getUserRestaurant').mockResolvedValue(restaurant);
    jest.spyOn(supa, 'subscribeToRestaurantUpdates').mockImplementation((): any => mockSubscribe(() => {}));

  const { result } = renderHook(() => useRestaurantSetupStatus());
  await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.loading).toBe(false);
    // Debe listar varios faltantes
    expect(result.current.missing.length).toBeGreaterThan(0);
    // completed false
    expect(result.current.completed).toBe(false);
  });

  it('sin faltantes cuando el restaurante está completo', async () => {
    const restaurant: any = {
      id: 'r1',
      name: 'Spoon Test',
      contact_phone: '123',
      cuisine_type_id: 'ct1',
      cuisine_type: 'Colombiana',
      city_id: 'city1',
      address: 'Calle 1',
      city: 'Bogotá',
      state: 'Cundinamarca',
      business_hours: { mon: [{ from: '09:00', to: '18:00' }] },
      logo_url: 'https://img/logo.png',
      cover_image_url: 'https://img/cover.png',
    };

    jest.spyOn(supa, 'getUserRestaurant').mockResolvedValue(restaurant);
    jest.spyOn(supa, 'subscribeToRestaurantUpdates').mockImplementation((): any => mockSubscribe(() => {}));

  const { result } = renderHook(() => useRestaurantSetupStatus());
  await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.loading).toBe(false);
    expect(result.current.missing).toHaveLength(0);
    expect(result.current.completed).toBe(true);
  });
});
