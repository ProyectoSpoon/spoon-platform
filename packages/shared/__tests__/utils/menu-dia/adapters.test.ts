import { mapCombinationUpdatesToDb } from '../../../utils/menu-dia/adapters';

describe('mapCombinationUpdatesToDb', () => {
  test('mapea nombre, descripcion, precio, disponible', () => {
    const updates = {
      nombre: 'Combo 1',
      descripcion: 'Desc',
      precio: 12345,
      disponible: true,
    } as const;
    const res = mapCombinationUpdatesToDb(updates);
    expect(res.combination_name).toBe('Combo 1');
    expect(res.combination_description).toBe('Desc');
    expect(res.combination_price).toBe(12345);
    expect(res.is_available).toBe(true);
    expect(typeof res.updated_at).toBe('string');
  });

  test('mapea flags favorito y especial', () => {
    const res = mapCombinationUpdatesToDb({ favorito: true, especial: false });
    expect(res.is_favorite).toBe(true);
    expect(res.is_special).toBe(false);
  });

  test('omite claves no soportadas', () => {
    const res = mapCombinationUpdatesToDb({} as any);
    // Solo debe devolver updated_at al menos
    expect(Object.keys(res)).toContain('updated_at');
  });
});
