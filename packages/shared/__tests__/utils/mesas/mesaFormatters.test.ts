/**
 * TESTS PARA FORMATEADORES DE MESA
 * Testing para funciones de formateo
 */

import {
  formatearMoneda,
  formatearTiempoOcupacion,
  formatearNombreMesa,
  formatearCapacidad,
  formatearResumenOrden,
  formatearPorcentaje
} from '@spoon/shared/utils/mesas/mesaFormatters';

describe('mesaFormatters', () => {
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

    test('múltiplos de 60 muestran solo horas', () => {
      expect(formatearTiempoOcupacion(120)).toBe('2h');
      expect(formatearTiempoOcupacion(180)).toBe('3h');
    });
  });

  describe('formatearNombreMesa', () => {
    test('con nombre personalizado incluye número', () => {
      expect(formatearNombreMesa(5, 'VIP Terraza')).toBe('VIP Terraza (#5)');
    });

    test('sin nombre usa formato estándar', () => {
      expect(formatearNombreMesa(3)).toBe('Mesa 3');
      expect(formatearNombreMesa(10, '')).toBe('Mesa 10');
      expect(formatearNombreMesa(7, '   ')).toBe('Mesa 7');
    });
  });

  describe('formatearCapacidad', () => {
    test('una persona usa singular', () => {
      expect(formatearCapacidad(1)).toBe('1 persona');
    });

    test('múltiples personas usa plural', () => {
      expect(formatearCapacidad(4)).toBe('4 personas');
      expect(formatearCapacidad(8)).toBe('8 personas');
      expect(formatearCapacidad(0)).toBe('0 personas');
    });
  });

  describe('formatearResumenOrden', () => {
    test('array vacío retorna mensaje específico', () => {
      expect(formatearResumenOrden([])).toBe('Sin productos');
    });

    test('un item usa singular', () => {
      expect(formatearResumenOrden([{}])).toBe('1 producto');
    });

    test('múltiples items usa plural', () => {
      expect(formatearResumenOrden([{}, {}])).toBe('2 productos');
      expect(formatearResumenOrden([{}, {}, {}])).toBe('3 productos');
    });
  });

  describe('formatearPorcentaje', () => {
    test('formatea con decimales por defecto', () => {
      expect(formatearPorcentaje(75.456)).toBe('75.5%');
      expect(formatearPorcentaje(100)).toBe('100.0%');
    });

    test('formatea con decimales personalizados', () => {
      expect(formatearPorcentaje(75.456, 2)).toBe('75.46%');
      expect(formatearPorcentaje(33.333, 0)).toBe('33%');
    });
  });
});

