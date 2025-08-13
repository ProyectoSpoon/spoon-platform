// packages/shared/caja/hooks/useSecurityLimits.ts
import { useState, useEffect } from 'react';
import { supabase, getUserProfile } from '@spoon/shared/lib/supabase';
import { formatCurrencyCOP } from '@spoon/shared/lib/utils';

interface SecurityLimits {
  limite_transaccion_normal: number;
  limite_transaccion_efectivo: number;
  limite_autorizacion_supervisor: number;
  limite_diario_cajero: number;
}

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
      setLimits(data);
    } catch (err) {
      console.error('Error obteniendo límites de seguridad:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerLimites();
  }, []);

  const formatearMonto = (centavos: number): string => formatCurrencyCOP(centavos);

  const validarMonto = (monto: number, metodoPago: string): {
    valid: boolean;
    warnings: string[];
    requiresAuth: boolean;
  } => {
    if (!limits) return { valid: true, warnings: [], requiresAuth: false };

    const warnings: string[] = [];
    let requiresAuth = false;

    if (monto > limits.limite_autorizacion_supervisor) {
      return { 
        valid: false, 
        warnings: [`Monto excede límite máximo: ${formatearMonto(limits.limite_autorizacion_supervisor)}`],
        requiresAuth: false 
      };
    }

    if (monto > limits.limite_transaccion_normal) {
      warnings.push(`Monto alto: ${formatearMonto(monto)} > ${formatearMonto(limits.limite_transaccion_normal)}`);
      requiresAuth = true;
    }

    if (metodoPago === 'efectivo' && monto > limits.limite_transaccion_efectivo) {
      warnings.push(`Efectivo alto: ${formatearMonto(monto)} > ${formatearMonto(limits.limite_transaccion_efectivo)}`);
      requiresAuth = true;
    }

    return { valid: true, warnings, requiresAuth };
  };

  return {
    limits,
    loading,
    formatearMonto,
    validarMonto,
    refrescar: obtenerLimites
  };
};