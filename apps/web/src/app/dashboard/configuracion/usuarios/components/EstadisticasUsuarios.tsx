import React from 'react';
import { Users, CreditCard, UtensilsCrossed, ChefHat, BriefcaseBusiness, Settings as SettingsIcon } from 'lucide-react';
import { UsuariosService } from '@spoon/shared/services/usuarios';

// Type casting para componentes de lucide-react
const UsersCast = Users as any;
const CreditCardCast = CreditCard as any;
const UtensilsCrossedCast = UtensilsCrossed as any;
const ChefHatCast = ChefHat as any;
const BriefcaseBusinessCast = BriefcaseBusiness as any;
const SettingsIconCast = SettingsIcon as any;

interface EstadisticasUsuariosProps {
  estadisticas: {
    usuariosActivos: number;
    cajeros: number;
    meseros: number;
    cocineros: number;
    gerentes: number;
    total: number;
    porRol?: Record<string, number>;
  };
  className?: string;
}

export const EstadisticasUsuarios: React.FC<EstadisticasUsuariosProps> = ({ 
  estadisticas, 
  className = '' 
}) => {
  const roleNames = UsuariosService.getRoleDisplayNames();
  const byRole = estadisticas.porRol || {};

  const roleCards = Object.entries(roleNames).map(([slug, label]) => {
    const base = 'rounded-md border p-2 transition-all duration-200 hover:shadow-sm';
    let icon = <UsersCast className="h-4 w-4 text-[color:var(--sp-neutral-700)]" />;
    let color = 'border-[color:var(--sp-neutral-200)] bg-[color:var(--sp-surface)]';
    if (slug === 'cajero') {
      icon = <CreditCardCast className="h-4 w-4 text-[color:var(--sp-info-700)]" />;
      color = 'border-[color:var(--sp-neutral-200)] bg-[color:var(--sp-surface)]';
    } else if (slug === 'mesero') {
      icon = <UtensilsCrossedCast className="h-4 w-4 text-[color:var(--sp-warning-700)]" />;
      color = 'border-[color:var(--sp-neutral-200)] bg-[color:var(--sp-surface)]';
    } else if (slug === 'cocinero') {
      icon = <ChefHatCast className="h-4 w-4 text-[color:var(--sp-error-700)]" />;
      color = 'border-[color:var(--sp-neutral-200)] bg-[color:var(--sp-surface)]';
    } else if (slug === 'gerente') {
      icon = <UsersCast className="h-4 w-4 text-[color:var(--sp-info-800)]" />;
      color = 'border-[color:var(--sp-neutral-200)] bg-[color:var(--sp-surface)]';
    } else if (slug === 'propietario') {
      icon = <BriefcaseBusinessCast className="h-4 w-4 text-[color:var(--sp-purple-700)]" />;
      color = 'border-[color:var(--sp-neutral-200)] bg-[color:var(--sp-surface)]';
    } else if (slug === 'administrador') {
      icon = <SettingsIconCast className="h-4 w-4 text-[color:var(--sp-neutral-700)]" />;
      color = 'border-[color:var(--sp-neutral-200)] bg-[color:var(--sp-surface)]';
    }
    const cleanLabel = label.replace(/^[^\w]+\s*/, '');
    return {
      key: slug,
      titulo: cleanLabel,
      valor: byRole[slug] || 0,
      icon,
      color,
      base
    };
  });

  const stats = roleCards;

  return (
    <div className={`w-full ${className}`}>
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {stats.map((stat: { key: string; titulo: string; valor: number; icon: React.ReactNode; color: string; base: string }) => (
          <div key={stat.key} className={`${stat.base} ${stat.color}`}>
            <div className="flex items-center justify-between">
              <div>
        <p className="text-xs font-medium text-[color:var(--sp-neutral-700)]">{stat.titulo}</p>
        <p className="text-xl font-bold text-[color:var(--sp-neutral-900)] leading-none mt-1">{stat.valor}</p>
              </div>
              <div className="flex-shrink-0">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};