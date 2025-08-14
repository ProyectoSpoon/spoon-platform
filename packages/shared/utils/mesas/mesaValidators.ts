/**
 * VALIDADORES PARA DATOS DE MESA
 * Generado automáticamente por refactoring
 */

import { CrearOrdenData } from '@spoon/shared/types/mesas/actionTypes';
// Otros imports de actionTypes si los hay;
import { CONFIG_MESAS } from '@spoon/shared/constants/mesas';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Valida configuración básica de mesa
 */
export const validarConfiguracionMesa = (
  numero: number,
  nombre: string,
  zona: string,
  capacidad: number
): ValidationResult => {
  const errors: string[] = [];
  
  if (!numero || numero < 1) {
    errors.push('El número de mesa debe ser mayor a 0');
  }
  
  if (capacidad < CONFIG_MESAS.CAPACIDAD_MINIMA || capacidad > CONFIG_MESAS.CAPACIDAD_MAXIMA) {
    errors.push(`La capacidad debe estar entre ${CONFIG_MESAS.CAPACIDAD_MINIMA} y ${CONFIG_MESAS.CAPACIDAD_MAXIMA}`);
  }
  
  if (!zona || zona.trim().length === 0) {
    errors.push('La zona es requerida');
  }
  
  if (nombre && nombre.length > 50) {
    errors.push('El nombre no puede exceder 50 caracteres');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Valida datos para crear orden
 */
export const validarCrearOrden = (data: CrearOrdenData): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.numeroMesa || data.numeroMesa < 1) {
    errors.push('Número de mesa inválido');
  }
  
  if (!data.items || data.items.length === 0) {
    errors.push('Debe seleccionar al menos un producto');
  }
  
  data.items?.forEach((item, index) => {
    if (!item.tipo || !['menu_dia', 'especial'].includes(item.tipo)) {
      errors.push(`Item ${index + 1}: Tipo de producto inválido`);
    }
    
    if (!item.cantidad || item.cantidad < 1) {
      errors.push(`Item ${index + 1}: Cantidad debe ser mayor a 0`);
    }
    
    if (!item.precioUnitario || item.precioUnitario < 0) {
      errors.push(`Item ${index + 1}: Precio unitario inválido`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Valida parámetros de reserva
 */
export const validarReserva = (
  nombreCliente: string,
  telefono?: string,
  horaReserva?: string
): ValidationResult => {
  const errors: string[] = [];
  
  if (!nombreCliente || nombreCliente.trim().length === 0) {
    errors.push('El nombre del cliente es requerido');
  }
  
  if (nombreCliente && nombreCliente.length > 100) {
    errors.push('El nombre del cliente no puede exceder 100 caracteres');
  }
  
  if (telefono && telefono.length > 20) {
    errors.push('El teléfono no puede exceder 20 caracteres');
  }
  
  if (horaReserva && horaReserva.length > 50) {
    errors.push('La hora de reserva no puede exceder 50 caracteres');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};






