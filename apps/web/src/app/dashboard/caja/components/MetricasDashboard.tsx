import React from 'react';
import { Card, CardContent } from '@spoon/shared/components/ui/Card';
import { TrendingUp, DollarSign, Receipt, AlertCircle } from 'lucide-react';
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
}> = ({ icon, label, value, subtitle, color, trend, badges = [] }) => {
  
  const formatCurrency = (centavos: number) => formatCurrencyCOP(centavos);

  const colorClasses = {
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-600",
      value: "text-green-700",
      iconBg: "bg-green-100"
    },
    red: {
      bg: "bg-red-50", 
      border: "border-red-200",
      icon: "text-red-600",
      value: "text-red-700",
      iconBg: "bg-red-100"
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200", 
      icon: "text-blue-600",
      value: "text-blue-700",
      iconBg: "bg-blue-100"
    },
    gray: {
      bg: "bg-gray-50",
      border: "border-gray-200",
      icon: "text-gray-600", 
      value: "text-gray-700",
      iconBg: "bg-gray-100"
    }
  };

  const classes = colorClasses[color];

  return (
    <Card className={`${classes.bg} ${classes.border} border transition-all duration-200 hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Icono */}
            <div className={`p-2.5 rounded-lg ${classes.iconBg}`}>
              <div className={`w-5 h-5 ${classes.icon}`}>
                {icon}
              </div>
            </div>
            
            {/* Contenido principal */}
            <div>
              <p className="text-[13px] font-medium text-[#64748b] mb-1.5">
                {label}
              </p>
              <p className={`text-[22px] leading-7 font-bold ${classes.value}`}>
                {formatCurrency(value)}
              </p>
              {subtitle && (
                <p className="text-[11px] text-[#94a3b8] mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Indicador de tendencia */}
          {trend && (
            <div className={`p-2 rounded-full ${
              trend === 'up' ? 'bg-green-100' :
              trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <TrendingUp className={`w-4 h-4 ${
                trend === 'up' ? 'text-green-600' :
                trend === 'down' ? 'text-red-600 rotate-180' : 'text-gray-600'
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    <Card className="bg-yellow-50 border-yellow-200 border">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800 mb-1">
              Atención requerida
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
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