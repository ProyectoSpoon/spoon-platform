/**
 * TESTS PARA UTILIDADES DE ESTADO DE MESA
 * Testing crítico para lógica de negocio
 */

import { 
  puedeCrearOrden, 
  estaDisponible, 
  esTransicionValida,
  getEstadoDisplay,
  calcularTiempoOcupacion,
  getAccionesDisponibles,
  necesitaAtencion
} from '@spoon/shared/utils/mesas/mesaStateUtils';
import { Mesa, MesaEstado } from '@spoon/shared/types/mesas';

// Mock mesa para tests
const createMockMesa = (estado: MesaEstado, ordenActiva?: any): Mesa => ({
  id: 'mesa-1',
  numero: 1,
  nombre: 'Mesa Test',
  zona: 'Principal',
  capacidad: 4,
  estado,
  ordenActiva,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
});

describe('mesaStateUtils', () => {
  describe('puedeCrearOrden', () => {
    test('mesa libre puede crear orden', () => {
      const mesa = createMockMesa('libre');
      expect(puedeCrearOrden(mesa)).toBe(true);
    });

    test('mesa reservada puede crear orden', () => {
      const mesa = createMockMesa('reservada');
      expect(puedeCrearOrden(mesa)).toBe(true);
    });

    test('mesa ocupada NO puede crear orden', () => {
      const mesa = createMockMesa('ocupada');
      expect(puedeCrearOrden(mesa)).toBe(false);
    });

    test('mesa inactiva NO puede crear orden', () => {
      const mesa = createMockMesa('inactiva');
      expect(puedeCrearOrden(mesa)).toBe(false);
    });
  });

  describe('estaDisponible', () => {
    test('mesa libre está disponible', () => {
      const mesa = createMockMesa('libre');
      expect(estaDisponible(mesa)).toBe(true);
    });

    test('mesa reservada está disponible', () => {
      const mesa = createMockMesa('reservada');
      expect(estaDisponible(mesa)).toBe(true);
    });

    test('mesa ocupada NO está disponible', () => {
      const mesa = createMockMesa('ocupada');
      expect(estaDisponible(mesa)).toBe(false);
    });
  });

  describe('esTransicionValida', () => {
    test('libre → ocupada es válida', () => {
      expect(esTransicionValida('libre', 'ocupada')).toBe(true);
    });

    test('ocupada → libre es válida', () => {
      expect(esTransicionValida('ocupada', 'libre')).toBe(true);
    });

    test('ocupada → reservada NO es válida', () => {
      expect(esTransicionValida('ocupada', 'reservada')).toBe(false);
    });

    test('mantenimiento → libre es válida', () => {
      expect(esTransicionValida('mantenimiento', 'libre')).toBe(true);
    });
  });

  describe('getEstadoDisplay', () => {
    test('mesa libre retorna config correcta', () => {
      const mesa = createMockMesa('libre');
      const display = getEstadoDisplay(mesa);
      
      expect(display.color).toBe('green');
      expect(display.texto).toBe('Libre');
      expect(display.descripcion).toBe('Disponible para nuevos clientes');
    });

    test('mesa ocupada retorna config correcta', () => {
      const mesa = createMockMesa('ocupada');
      const display = getEstadoDisplay(mesa);
      
      expect(display.color).toBe('red');
      expect(display.texto).toBe('Ocupada');
    });
  });

  describe('calcularTiempoOcupacion', () => {
    test('mesa libre retorna null', () => {
      const mesa = createMockMesa('libre');
      expect(calcularTiempoOcupacion(mesa)).toBeNull();
    });

    test('mesa ocupada sin orden retorna null', () => {
      const mesa = createMockMesa('ocupada');
      expect(calcularTiempoOcupacion(mesa)).toBeNull();
    });

    test('mesa ocupada con orden calcula tiempo correctamente', () => {
      const fechaCreacion = new Date(Date.now() - 60 * 60 * 1000); // 1 hora atrás
      const mesa = createMockMesa('ocupada', {
        id: 'orden-1',
        total: 50000,
        items: [],
        fechaCreacion: fechaCreacion.toISOString()
      });
      
      const tiempo = calcularTiempoOcupacion(mesa);
      expect(tiempo).toBeGreaterThan(50); // Más de 50 minutos
      expect(tiempo).toBeLessThan(70);   // Menos de 70 minutos
    });
  });

  describe('getAccionesDisponibles', () => {
    test('mesa libre tiene acciones correctas', () => {
      const mesa = createMockMesa('libre');
      const acciones = getAccionesDisponibles(mesa);
      
      expect(acciones).toContain('crear_orden');
      expect(acciones).toContain('reservar');
      expect(acciones).toContain('inactivar');
      expect(acciones).toContain('mantenimiento');
    });

    test('mesa ocupada tiene acciones correctas', () => {
      const mesa = createMockMesa('ocupada');
      const acciones = getAccionesDisponibles(mesa);
      
      expect(acciones).toContain('cobrar');
      expect(acciones).toContain('editar_orden');
      expect(acciones).toContain('eliminar_orden');
    });

    test('mesa inactiva solo puede activarse', () => {
      const mesa = createMockMesa('inactiva');
      const acciones = getAccionesDisponibles(mesa);
      
      expect(acciones).toEqual(['activar']);
    });
  });

  describe('necesitaAtencion', () => {
    test('mesa libre no necesita atención', () => {
      const mesa = createMockMesa('libre');
      expect(necesitaAtencion(mesa)).toBe(false);
    });

    test('mesa ocupada por menos de 90 minutos no necesita atención', () => {
      const fechaCreacion = new Date(Date.now() - 30 * 60 * 1000); // 30 minutos atrás
      const mesa = createMockMesa('ocupada', {
        fechaCreacion: fechaCreacion.toISOString()
      });
      
      expect(necesitaAtencion(mesa)).toBe(false);
    });

    test('mesa ocupada por más de 90 minutos necesita atención', () => {
      const fechaCreacion = new Date(Date.now() - 120 * 60 * 1000); // 2 horas atrás
      const mesa = createMockMesa('ocupada', {
        fechaCreacion: fechaCreacion.toISOString()
      });
      
      expect(necesitaAtencion(mesa)).toBe(true);
    });
  });
});

