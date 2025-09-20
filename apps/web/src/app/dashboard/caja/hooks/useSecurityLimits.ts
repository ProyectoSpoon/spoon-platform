// packages/shared/caja/hooks/useSecurityLimits.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase, getUserProfile } from '@spoon/shared/lib/supabase';
import { SecurityLimits } from '@spoon/shared/caja/types/security';

export const useSecurityLimits = () => {
  const [limits, setLimits] = useState<SecurityLimits | null>(null);
  const [loading, setLoading] = useState(false);

  const obtenerLimites = async () => {
    try {
      setLoading(true);
      const profile = await getUserProfile();
      if (!profile?.restaurant_id) return;

      const { data, error } = await supabase.rpc('get_security_limits', {
        p_restaurant_id: profile.restaurant_id
      });

      if (error) throw error;

      // Backend ahora retorna límites en PESOS directamente
      setLimits({
        limite_transaccion_normal: Number(data.limite_transaccion_normal || 0),
        limite_transaccion_efectivo: Number(data.limite_transaccion_efectivo || 0),
        limite_autorizacion_supervisor: Number(data.limite_autorizacion_supervisor || 0),
        limite_diario_cajero: Number(data.limite_diario_cajero || 0)
      });
    } catch (err) {
      console.error('Error obteniendo límites de seguridad:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerLimites();
  }, []);

  const formatearMonto = (pesos: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(pesos);
  };

  const validarMonto = useCallback((montoPesos: number, metodoPago: string): {
    valid: boolean;
    warnings: string[];
    requiresAuth: boolean;
  } => {
    if (!limits) return { valid: true, warnings: [], requiresAuth: false };

    const warnings: string[] = [];
    let requiresAuth = false;

    if (montoPesos > limits.limite_autorizacion_supervisor) {
      return {
        valid: false,
        warnings: [`Monto excede límite máximo: ${formatearMonto(limits.limite_autorizacion_supervisor)}`],
        requiresAuth: false
      };
    }

    if (montoPesos > limits.limite_transaccion_normal) {
      warnings.push(`Monto alto: ${formatearMonto(montoPesos)} > ${formatearMonto(limits.limite_transaccion_normal)}`);
      requiresAuth = true;
    }

    if (metodoPago === 'efectivo' && montoPesos > limits.limite_transaccion_efectivo) {
      warnings.push(`Efectivo alto: ${formatearMonto(montoPesos)} > ${formatearMonto(limits.limite_transaccion_efectivo)}`);
      requiresAuth = true;
    }

    return { valid: true, warnings, requiresAuth };
  }, [limits]);

  return {
    limits,
    loading,
    formatearMonto,
    validarMonto,
    refrescar: obtenerLimites
  };
};