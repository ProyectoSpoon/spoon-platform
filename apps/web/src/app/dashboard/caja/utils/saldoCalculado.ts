import { supabase } from '@spoon/shared/lib/supabase';

export interface SaldoCalculado {
  montoInicial: number;
  totalVentasEfectivo: number;
  totalGastosEfectivo: number;
  saldoCalculado: number;
  detalles: {
    ventasEfectivo: number;
    gastosEfectivo: number;
    diferencia: number;
  };
}

/**
 * Calcula el saldo de caja basado en transacciones y gastos registrados
 */
export async function calcularSaldoCaja(
  sesionId: string,
  montoInicial: number = 0
): Promise<SaldoCalculado> {
  try {
    // 1. Obtener todas las transacciones de efectivo de esta sesión
    const { data: transacciones, error: errorTransacciones } = await supabase
      .from('transacciones_caja')
      .select('monto_total, metodo_pago')
      .eq('caja_sesion_id', sesionId)
      .eq('metodo_pago', 'efectivo');

    if (errorTransacciones) {
      console.error('Error obteniendo transacciones:', errorTransacciones);
    }

    // 2. Obtener todos los gastos de esta sesión
    const { data: gastos, error: errorGastos } = await supabase
      .from('gastos_caja')
      .select('monto')
      .eq('caja_sesion_id', sesionId);

    if (errorGastos) {
      console.error('Error obteniendo gastos:', errorGastos);
    }

    // 3. Calcular totales
    const totalVentasEfectivo = (transacciones || [])
      .reduce((sum, t) => sum + (t.monto_total || 0), 0);

    const totalGastosEfectivo = (gastos || [])
      .reduce((sum, g) => sum + (g.monto || 0), 0);

    // 4. Saldo final calculado
    const saldoCalculado = montoInicial + totalVentasEfectivo - totalGastosEfectivo;

    return {
      montoInicial,
      totalVentasEfectivo,
      totalGastosEfectivo,
      saldoCalculado,
      detalles: {
        ventasEfectivo: totalVentasEfectivo,
        gastosEfectivo: totalGastosEfectivo,
        diferencia: totalVentasEfectivo - totalGastosEfectivo
      }
    };

  } catch (error) {
    console.error('Error calculando saldo de caja:', error);
    
    // Fallback: devolver solo el monto inicial
    return {
      montoInicial,
      totalVentasEfectivo: 0,
      totalGastosEfectivo: 0,
      saldoCalculado: montoInicial,
      detalles: {
        ventasEfectivo: 0,
        gastosEfectivo: 0,
        diferencia: 0
      }
    };
  }
}

/**
 * Hook para obtener el saldo calculado de la sesión actual
 */
export async function obtenerSaldoCalculado(sesionId: string): Promise<number> {
  try {
    // Obtener información de la sesión
    const { data: sesion, error } = await supabase
      .from('caja_sesiones')
      .select('monto_inicial')
      .eq('id', sesionId)
      .single();

    if (error || !sesion) {
      console.error('Error obteniendo sesión:', error);
      return 0;
    }

    const resultado = await calcularSaldoCaja(sesionId, sesion.monto_inicial || 0);
    return resultado.saldoCalculado;

  } catch (error) {
    console.error('Error en obtenerSaldoCalculado:', error);
    return 0;
  }
}
