/**
 * TESTS PARA VALIDADORES DE MESA
 * Testing crítico para validaciones de entrada
 */

import { 
  validarConfiguracionMesa,
  validarCrearOrden,
  validarReserva
} from '@spoon/shared/utils/mesas/mesaValidators';
import { CrearOrdenData } from '@spoon/shared/types/mesas';

describe('mesaValidators', () => {
  describe('validarConfiguracionMesa', () => {
    test('configuración válida pasa validación', () => {
      const result = validarConfiguracionMesa(1, 'Mesa VIP', 'Principal', 4);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('número de mesa inválido falla', () => {
      const result = validarConfiguracionMesa(0, 'Mesa Test', 'Principal', 4);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El número de mesa debe ser mayor a 0');
    });

    test('capacidad fuera de rango falla', () => {
      const result = validarConfiguracionMesa(1, 'Mesa Test', 'Principal', 25);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La capacidad debe estar entre 1 y 20');
    });

    test('zona vacía no falla (zona opcional)', () => {
      const result = validarConfiguracionMesa(1, 'Mesa Test', '', 4);
      
      expect(result.valid).toBe(true);
      expect(result.errors).not.toContain('La zona es requerida');
    });

    test('nombre muy largo falla', () => {
      const nombreLargo = 'A'.repeat(51);
      const result = validarConfiguracionMesa(1, nombreLargo, 'Principal', 4);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El nombre no puede exceder 50 caracteres');
    });
  });

  describe('validarCrearOrden', () => {
    const ordenValida: CrearOrdenData = {
      numeroMesa: 1,
      mesero: 'Juan',
      items: [
        {
          tipo: 'menu_dia',
          cantidad: 2,
          precioUnitario: 15000,
          combinacionId: 'combo-1'
        }
      ]
    };

    test('orden válida pasa validación', () => {
      const result = validarCrearOrden(ordenValida);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('número de mesa inválido falla', () => {
      const ordenInvalida = { ...ordenValida, numeroMesa: 0 };
      const result = validarCrearOrden(ordenInvalida);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Número de mesa inválido');
    });

    test('sin items falla', () => {
      const ordenInvalida = { ...ordenValida, items: [] };
      const result = validarCrearOrden(ordenInvalida);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Debe seleccionar al menos un producto');
    });

    test('item con tipo inválido falla', () => {
      const ordenInvalida = {
        ...ordenValida,
        items: [{ ...ordenValida.items[0], tipo: 'invalido' as any }]
      };
      const result = validarCrearOrden(ordenInvalida);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Item 1: Tipo de producto inválido');
    });

    test('item con cantidad inválida falla', () => {
      const ordenInvalida = {
        ...ordenValida,
        items: [{ ...ordenValida.items[0], cantidad: 0 }]
      };
      const result = validarCrearOrden(ordenInvalida);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Item 1: Cantidad debe ser mayor a 0');
    });
  });

  describe('validarReserva', () => {
    test('reserva válida pasa validación', () => {
      const result = validarReserva('Juan Pérez', '3001234567', '7:30 PM');
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('nombre vacío falla', () => {
      const result = validarReserva('', '3001234567', '7:30 PM');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El nombre del cliente es requerido');
    });

    test('nombre muy largo falla', () => {
      const nombreLargo = 'A'.repeat(101);
      const result = validarReserva(nombreLargo, '3001234567', '7:30 PM');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El nombre del cliente no puede exceder 100 caracteres');
    });

    test('teléfono muy largo falla', () => {
      const telefonoLargo = '1'.repeat(21);
      const result = validarReserva('Juan Pérez', telefonoLargo, '7:30 PM');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El teléfono no puede exceder 20 caracteres');
    });
  });
});

