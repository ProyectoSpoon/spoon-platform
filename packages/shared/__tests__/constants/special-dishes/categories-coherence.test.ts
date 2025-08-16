/**
 * Coherencia entre categorías de Menú del Día y Especiales
 */

import { CATEGORIAS_MENU_CONFIG } from '@spoon/shared/constants/menu-dia/menuConstants';
import { CATEGORIAS_ESPECIALES_CONFIG } from '@spoon/shared/constants/special-dishes/specialDishConstants';

describe('Coherencia: categorías especiales vs menú del día', () => {
  test('incluye pasos extra info y configuracion-final en posiciones correctas', () => {
    expect(CATEGORIAS_ESPECIALES_CONFIG[0].id).toBe('info');
    expect(CATEGORIAS_ESPECIALES_CONFIG.at(-1)?.id).toBe('configuracion-final');
  });

  test('mismas categorías base (orden, ids, uuids y nombres) que menú del día', () => {
    const menuBase = CATEGORIAS_MENU_CONFIG.filter(c => c.id !== 'configuracion-final');
    const specialsCore = CATEGORIAS_ESPECIALES_CONFIG.filter(
      c => c.id !== 'info' && c.id !== 'configuracion-final'
    );

    // Orden e ids iguales
    expect(specialsCore.map(c => c.id)).toEqual(menuBase.map(c => c.id));

    // UUIDs iguales
    expect(specialsCore.map(c => c.uuid)).toEqual(menuBase.map(c => c.uuid));

    // Nombres iguales
    const menuNameById = Object.fromEntries(menuBase.map(c => [c.id, c.nombre]));
    specialsCore.forEach(c => {
      expect(c.nombre).toBe(menuNameById[c.id]);
    });
  });

  test('flags required esperados: info y configuracion-final true; proteinas true; demás false', () => {
    const specialsCore = CATEGORIAS_ESPECIALES_CONFIG.filter(
      c => c.id !== 'info' && c.id !== 'configuracion-final'
    );

    // info/configuración final
    expect(CATEGORIAS_ESPECIALES_CONFIG[0].required).toBe(true);
    expect(CATEGORIAS_ESPECIALES_CONFIG.at(-1)?.required).toBe(true);

    // proteinas requerido, demás no
    specialsCore.forEach(c => {
      const expected = c.id === 'proteinas';
      expect(c.required).toBe(expected);
    });
  });
});
