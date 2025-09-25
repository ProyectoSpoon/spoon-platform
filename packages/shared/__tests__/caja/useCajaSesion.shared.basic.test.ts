/**
 * Tests básicos para utilidades de caja - validaciones críticas
 * Tests unitarios sin dependencias de React
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Test de utilidades de validación
import { validateMonto, validateMetodoPago, ensureCajaAbiertaYPermisos } from '../../caja/utils/validations';
import { CAJA_ERROR_CODES, CAJA_MESSAGES } from '../../caja/constants/messages';

// Test de utilidades de moneda
import { toCentavos, toPesos, formatCentavosToCOP, calcularCambio } from '../../caja/utils/currency';

// Test de manejo de errores
import { classifyCajaError, handleCajaError } from '../../caja/utils/errorHandling';

describe('Utilidades de Caja - Validaciones Críticas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Validaciones de Monto', () => {
    it('debe validar montos válidos', () => {
      const result = validateMonto(100000);
      expect(result.isValid).toBe(true);
    });

    it('debe rechazar montos negativos', () => {
      const result = validateMonto(-1000);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(CAJA_ERROR_CODES.MONTO_NEGATIVO);
    });

    it('debe rechazar montos fuera de rango', () => {
      const result = validateMonto(20000000); // Muy alto
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(CAJA_ERROR_CODES.MONTO_FUERA_RANGO);
    });

    it('debe permitir montos cero cuando se especifica', () => {
      const result = validateMonto(0, { allowZero: true });
      expect(result.isValid).toBe(true);
    });
  });

  describe('Validaciones de Método de Pago', () => {
    it('debe aceptar métodos válidos', () => {
      expect(validateMetodoPago('efectivo').isValid).toBe(true);
      expect(validateMetodoPago('tarjeta').isValid).toBe(true);
      expect(validateMetodoPago('digital').isValid).toBe(true);
    });

    it('debe rechazar métodos inválidos', () => {
      const result = validateMetodoPago('bitcoin');
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(CAJA_ERROR_CODES.METODO_PAGO_INVALIDO);
    });
  });

  describe('Validaciones de Permisos', () => {
    it('debe permitir acciones con roles válidos', async () => {
      // Mock de roles válidos
      const mockGetActiveRoles = jest.fn() as jest.MockedFunction<() => Promise<string[]>>;
      mockGetActiveRoles.mockResolvedValue(['cajero']);
      jest.doMock('@spoon/shared/lib/supabase', () => ({
        getActiveRoles: mockGetActiveRoles
      }));

      const result = await ensureCajaAbiertaYPermisos('abrir', 'cerrada');
      expect(result.isValid).toBe(true);
    });

    it('debe rechazar acciones sin permisos', async () => {
      // Mock de roles insuficientes
      const mockGetActiveRoles = jest.fn() as jest.MockedFunction<() => Promise<string[]>>;
      mockGetActiveRoles.mockResolvedValue(['mesero']);
      jest.doMock('@spoon/shared/lib/supabase', () => ({
        getActiveRoles: mockGetActiveRoles
      }));

      const result = await ensureCajaAbiertaYPermisos('abrir', 'cerrada');
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(CAJA_ERROR_CODES.PERMISO_DENEGADO);
    });
  });

  describe('Utilidades de Moneda', () => {
    it('debe convertir pesos a centavos correctamente', () => {
      expect(toCentavos(1000)).toBe(100000);
      expect(toCentavos(1000.50)).toBe(100050);
    });

    it('debe convertir centavos a pesos correctamente', () => {
      expect(toPesos(100000)).toBe(1000);
      expect(toPesos(100050)).toBe(1000.5);
    });

    it('debe formatear montos en COP', () => {
      expect(formatCentavosToCOP(100000)).toBe('$1.000');
      expect(formatCentavosToCOP(100050)).toBe('$1.001');
    });

    it('debe calcular cambio correctamente', () => {
      expect(calcularCambio(100000, 150000)).toBe(50000);
      expect(calcularCambio(100000, 100000)).toBe(0);
    });

    it('debe rechazar cambio con monto insuficiente', () => {
      expect(() => calcularCambio(100000, 50000)).toThrow('Monto recibido insuficiente');
    });
  });

  describe('Manejo de Errores', () => {
    it('debe clasificar errores de sesión expirada', () => {
      const error = { code: 'PGRST301', message: 'JWT expired' };
      const result = classifyCajaError(error);
      expect(result.code).toBe(CAJA_ERROR_CODES.SESION_EXPIRADA);
      expect(result.severity).toBe('critical');
    });

    it('debe clasificar errores de caja ya abierta', () => {
      const error = new Error('Ya existe una caja abierta');
      const result = classifyCajaError(error);
      expect(result.code).toBe(CAJA_ERROR_CODES.CAJA_YA_ABIERTA);
      expect(result.severity).toBe('medium');
    });

    it('debe clasificar errores de conexión', () => {
      const error = new TypeError('Failed to fetch');
      const result = classifyCajaError(error);
      expect(result.code).toBe(CAJA_ERROR_CODES.CONEXION_FALLIDA);
      expect(result.severity).toBe('medium');
    });

    it('debe proporcionar acciones sugeridas', () => {
      const error = { code: 'PGRST301' };
      const result = classifyCajaError(error);
      expect(result.suggestedAction).toBe('Vuelva a iniciar sesión');
    });

    it('debe mantener compatibilidad con handleCajaError legacy', () => {
      const error = new Error('Ya existe una caja abierta');
      const result = handleCajaError(error);
      expect(result).toContain('Ya existe una caja abierta');
    });
  });
});
