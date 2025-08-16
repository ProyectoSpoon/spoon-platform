import React from 'react';
import { Card, CardContent } from '@spoon/shared/components/ui/Card';
import { TrendingUp, DollarSign, Receipt, AlertCircle, ListOrdered } from 'lucide-react';
import { formatCurrencyCOP } from '@spoon/shared/lib/utils';

interface MetricasData {
  balance: number;
  ventasTotales: number;
  gastosTotales: number;
  transaccionesDelDia: any[];
  totalEfectivo?: number;
  totalTarjeta?: number;
  totalDigital?: number;
}

interface MetricasDashboardProps {
  metricas: MetricasData;
  loading?: boolean;
}

// Componente individual para cada métrica
const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  subtitle?: string;
  color: 'green' | 'blue' | 'red' | 'gray';
  trend?: 'up' | 'down' | 'neutral';
  badges?: Array<{ label: string; value: number; color: string }>;
  format?: 'currency' | 'number';
}> = ({ icon, label, value, subtitle, color, trend, badges = [], format = 'currency' }) => {
  
  const formatCurrency = (centavos: number) => formatCurrencyCOP(centavos);
  const formatValue = (val: number) => (format === 'currency' ? formatCurrency(val) : new Intl.NumberFormat('es-CO').format(val));

  const colorClasses = {
    green: {
      bg: "bg-[color:var(--sp-success-50)]",
      border: "border-[color:var(--sp-border)]",
      icon: "text-[color:var(--sp-success-600)]",
      value: "text-[color:var(--sp-success-700)]",
      iconBg: "bg-[color:var(--sp-success-100)]"
    },
    red: {
      bg: "bg-[color:var(--sp-error-50)]", 
      border: "border-[color:var(--sp-border)]",
      icon: "text-[color:var(--sp-error-600)]",
      value: "text-[color:var(--sp-error-700)]",
      iconBg: "bg-[color:var(--sp-error-100)]"
    },
    blue: {
      bg: "bg-[color:var(--sp-info-50)]",
      border: "border-[color:var(--sp-border)]", 
      icon: "text-[color:var(--sp-info-600)]",
      value: "text-[color:var(--sp-info-700)]",
      iconBg: "bg-[color:var(--sp-info-100)]"
    },
    gray: {
      bg: "bg-[color:var(--sp-neutral-50)]",
      border: "border-[color:var(--sp-border)]",
      icon: "text-[color:var(--sp-neutral-600)]", 
      value: "text-[color:var(--sp-neutral-700)]",
      iconBg: "bg-[color:var(--sp-neutral-100)]"
    }
  };

  const classes = colorClasses[color];
  // Normalizar tamaño/color del ícono para que todas las tarjetas se vean consistentes
  const StyledIcon = React.isValidElement(icon)
    ? React.cloneElement(icon as React.ReactElement, { className: `w-5 h-5 ${classes.icon}` })
    : icon;

  return (
    <Card className={`rounded-lg shadow-sm ${classes.bg} ${classes.border} border transition-all duration-200 hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Icono */}
            <div className={`p-2.5 rounded-lg ${classes.iconBg}`}>
              {StyledIcon}
            </div>
            
            {/* Contenido principal */}
            <div>
              <p className="text-[13px] font-medium text-[color:var(--sp-neutral-500)] mb-1.5">
                {label}
              </p>
              <p className={`text-[22px] leading-7 font-bold ${classes.value}`}>
                {formatValue(value)}
              </p>
              {subtitle && (
                <p className="text-[11px] text-[color:var(--sp-neutral-400)] mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Indicador de tendencia */}
          {trend && (
            <div className={`p-2 rounded-full ${
              trend === 'up' ? 'bg-[color:var(--sp-success-100)]' :
              trend === 'down' ? 'bg-[color:var(--sp-error-100)]' : 'bg-[color:var(--sp-neutral-100)]'
            }`}>
              <TrendingUp className={`w-4 h-4 ${
                trend === 'up' ? 'text-[color:var(--sp-success-600)]' :
                trend === 'down' ? 'text-[color:var(--sp-error-600)] rotate-180' : 'text-[color:var(--sp-neutral-600)]'
              }`} />
            </div>
          )}
        </div>

        {/* Badges adicionales para desglose */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {badges.map((badge, index) => (
              <span 
                key={index}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
              >
                {badge.label}: {formatCurrency(badge.value)}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const MetricasDashboard: React.FC<MetricasDashboardProps> = ({ 
  metricas, 
  loading = false 
}) => {
  
  // Calcular tendencias simples
  const getBalanceTrend = (): 'up' | 'down' | 'neutral' => {
    if (metricas.balance > 0) return 'up';
    if (metricas.balance < 0) return 'down';
    return 'neutral';
  };

  // Crear badges para desglose de métodos de pago
  const getVentasBadges = () => {
    const badges = [];
    
    if (metricas.totalEfectivo && metricas.totalEfectivo > 0) {
      badges.push({
        label: '💵 Efectivo',
        value: metricas.totalEfectivo,
        color: 'bg-green-100 text-green-800'
      });
    }
    
    if (metricas.totalTarjeta && metricas.totalTarjeta > 0) {
      badges.push({
        label: '💳 Tarjeta',
        value: metricas.totalTarjeta,
        color: 'bg-blue-100 text-blue-800'
      });
    }
    
    if (metricas.totalDigital && metricas.totalDigital > 0) {
      badges.push({
        label: '📱 Digital',
        value: metricas.totalDigital,
        color: 'bg-purple-100 text-purple-800'
      });
    }
    
    return badges;
  };

  if (loading) {
    return (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
      <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-[color:var(--sp-neutral-200)] rounded-lg"></div>
                <div className="space-y-2">
      <div className="h-4 bg-[color:var(--sp-neutral-200)] rounded w-20"></div>
      <div className="h-8 bg-[color:var(--sp-neutral-200)] rounded w-32"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Balance */}
      <MetricCard
        icon={<TrendingUp />}
        label="Balance"
        value={metricas.balance}
        subtitle="Ingresos - Egresos del día"
        color={metricas.balance >= 0 ? 'blue' : 'red'}
        trend={getBalanceTrend()}
      />

      {/* Ventas Totales */}
      <MetricCard
        icon={<DollarSign />}
        label="Ventas totales"
        value={metricas.ventasTotales}
        subtitle={`${metricas.transaccionesDelDia.length} transacciones`}
        color="green"
        trend={metricas.ventasTotales > 0 ? 'up' : 'neutral'}
        badges={getVentasBadges()}
      />

      {/* Gastos Totales */}
      <MetricCard
        icon={<Receipt />}
        label="Gastos totales"
        value={metricas.gastosTotales}
        subtitle={metricas.gastosTotales > 0 ? "Egresos del día" : "Sin gastos registrados"}
        color="red"
        trend={metricas.gastosTotales > 0 ? 'down' : 'neutral'}
      />

      {/* Órdenes (KPI) */}
      <MetricCard
        icon={<ListOrdered />}
        label="Órdenes"
        value={metricas.transaccionesDelDia.length}
        subtitle="Cantidad de órdenes del día"
        color="gray"
        trend={metricas.transaccionesDelDia.length > 0 ? 'up' : 'neutral'}
        format="number"
      />
    </div>
  );
};

// Componente de alerta cuando las métricas indican problemas
export const MetricasAlert: React.FC<{
  metricas: MetricasData;
}> = ({ metricas }) => {
  
  // Detectar situaciones que requieren atención
  const alerts = [];
  
  if (metricas.balance < -50000) { // Si balance es muy negativo
    alerts.push("El balance del día está en números rojos significativos");
  }
  
  if (metricas.gastosTotales > metricas.ventasTotales && metricas.ventasTotales > 0) {
    alerts.push("Los gastos superan las ventas del día");
  }
  
  if (metricas.ventasTotales === 0 && metricas.gastosTotales > 0) {
    alerts.push("Hay gastos registrados pero no hay ventas");
  }

  if (alerts.length === 0) return null;

  return (
    <Card className="bg-[color:var(--sp-warning-50)] border-[color:var(--sp-warning-200)] border">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-[color:var(--sp-warning-600)] mt-0.5" />
          <div>
            <h4 className="font-medium text-[color:var(--sp-warning-800)] mb-1">
              Atención requerida
            </h4>
            <ul className="text-sm text-[color:var(--sp-warning-700)] space-y-1">
              {alerts.map((alert, index) => (
                <li key={index}>• {alert}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};