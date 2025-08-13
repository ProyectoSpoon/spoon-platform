/**
 * TESTS PARA UTILIDADES DE MESAS
 * Tests enfocados en funciones puras (sin hooks)
 */

import {
  formatearMoneda,
  formatearTiempoOcupacion,
  formatearNombreMesa,
  formatearCapacidad
} from '../../utils/mesas/mesaFormatters';

describe('Utilidades de Formateo', () => {
  describe('formatearMoneda', () => {
    test('formatea correctamente pesos colombianos', () => {
      expect(formatearMoneda(15000)).toBe('$15.000');
      expect(formatearMoneda(1500000)).toBe('$1.500.000');
      expect(formatearMoneda(0)).toBe('$0');
    });
  });

  describe('formatearTiempoOcupacion', () => {
    test('null retorna guión', () => {
      expect(formatearTiempoOcupacion(null)).toBe('-');
    });

    test('menos de 60 minutos muestra solo minutos', () => {
      expect(formatearTiempoOcupacion(45)).toBe('45m');
      expect(formatearTiempoOcupacion(1)).toBe('1m');
    });

    test('60 minutos exactos muestra 1 hora', () => {
      expect(formatearTiempoOcupacion(60)).toBe('1h');
    });

    test('más de 60 minutos muestra horas y minutos', () => {
      expect(formatearTiempoOcupacion(90)).toBe('1h 30m');
      expect(formatearTiempoOcupacion(125)).toBe('2h 5m');
    });
  });

  describe('formatearNombreMesa', () => {
    test('con nombre personalizado incluye número', () => {
      expect(formatearNombreMesa(5, 'VIP Terraza')).toBe('VIP Terraza (#5)');
    });

    test('sin nombre usa formato estándar', () => {
      expect(formatearNombreMesa(3)).toBe('Mesa 3');
      expect(formatearNombreMesa(10, '')).toBe('Mesa 10');
    });
  });

  describe('formatearCapacidad', () => {
    test('una persona usa singular', () => {
      expect(formatearCapacidad(1)).toBe('1 persona');
    });

    test('múltiples personas usa plural', () => {
      expect(formatearCapacidad(4)).toBe('4 personas');
      expect(formatearCapacidad(8)).toBe('8 personas');
    });
  });
});
