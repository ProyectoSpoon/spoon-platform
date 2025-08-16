// src/app/dashboard/layout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { preloadUserAndRestaurant } from '@spoon/shared';
import { NotificationProvider } from 'packages/shared/Context/notification-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Settings, 
  Menu,
  Users,
  Package,
  Calendar,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// ✅ ITEMS DEL MENÚ PRINCIPAL
const menuItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Panel principal'
  },
     {
    label: 'Ventas',
    href: '/dashboard/caja',
    icon: Menu,
    description: 'Gestionar ventas',
  },
  {
    label: 'Domicilios',
    href: '/dashboard/domicilios',
    icon: Menu,
    description: 'Gestionar domicilios',
    },
  {
    label: 'Menú Diario',
    href: '/dashboard/carta/menu-dia',
    icon: Menu,
    description: 'Gestionar menú de hoy',
    badge: 'HOY'
  },
  {
    label: 'Especiales',
    href: '/dashboard/carta/especiales',
    icon: Menu,
    description: 'Platos Especiales',
  },
  {    label: 'Mesas',
    href: '/dashboard/mesas',
    icon: Menu,
    description: 'Control de tus mesas',
    
  },
  {
    label: 'Configuración',
    href: '/dashboard/configuracion',
    icon: Settings,
    description: 'Configurar restaurante'
  }

];

// ✅ COMPONENTE DE BARRA LATERAL
function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
  <div className={`bg-[color:var(--sp-surface)] border-r border-[color:var(--sp-border)] transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    } flex flex-col h-full`}>
      
      {/* Header del sidebar */}
  <div className="p-4 border-b border-[color:var(--sp-border)]">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[color:var(--sp-primary-600)] rounded-lg flex items-center justify-center">
                <span className="text-[color:var(--sp-on-primary)] font-bold text-sm">S</span>
              </div>
              <div>
                <h1 className="font-semibold text-[color:var(--sp-neutral-900)]">SPOON</h1>
                <p className="text-xs text-[color:var(--sp-neutral-500)]">Dashboard</p>
              </div>
            </div>
          )}
          
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md hover:bg-[color:var(--sp-neutral-100)] transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-[color:var(--sp-neutral-600)]" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-[color:var(--sp-neutral-600)]" />
            )}
          </button>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              prefetch={false}
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-[color:var(--sp-primary-50)] text-[color:var(--sp-primary-600)] border border-[color:var(--sp-primary-200)]'
                  : 'text-[color:var(--sp-neutral-700)] hover:bg-[color:var(--sp-neutral-50)] hover:text-[color:var(--sp-neutral-900)]'
              }`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${
                isActive ? 'text-[color:var(--sp-primary-600)]' : 'text-[color:var(--sp-neutral-500)] group-hover:text-[color:var(--sp-neutral-700)]'
              }`} />
              
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-[color:var(--sp-primary-100)] text-[color:var(--sp-primary-600)] rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[color:var(--sp-neutral-500)] truncate">
                      {item.description}
                    </p>
                  </div>
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer del sidebar */}
  <div className="p-4 border-t border-[color:var(--sp-border)]">
        {!collapsed && (
          <div className="mb-3 p-3 bg-[color:var(--sp-info-50)] rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="h-4 w-4 text-[color:var(--sp-info-600)]" />
              <span className="text-sm font-medium text-[color:var(--sp-info-900)]">Recordatorio</span>
            </div>
            <p className="text-xs text-[color:var(--sp-info-700)]">
              Configura tu menú de hoy para aparecer en búsquedas.
            </p>
          </div>
        )}
        
        <button className={`w-full flex items-center gap-3 px-3 py-2 text-[color:var(--sp-neutral-700)] hover:bg-[color:var(--sp-neutral-50)] rounded-lg transition-colors ${
          collapsed ? 'justify-center' : ''
        }`}>
          <LogOut className="h-5 w-5 text-[color:var(--sp-neutral-500)]" />
          {!collapsed && <span className="text-sm">Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
}

// ✅ COMPONENTE DE HEADER
function Header() {
  return (
  <header className="bg-[color:var(--sp-surface)] border-b border-[color:var(--sp-border)] px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-page">Bienvenido de vuelta</h1>
          <p className="text-sm text-[color:var(--sp-neutral-600)]">Restaurante de Prueba • Medellín, Antioquia</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notificaciones */}
          <button className="relative p-2 text-[color:var(--sp-neutral-600)] hover:text-[color:var(--sp-neutral-900)] hover:bg-[color:var(--sp-neutral-100)] rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-[color:var(--sp-error-500)] rounded-full"></span>
          </button>
          
          {/* Avatar del usuario */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-[color:var(--sp-neutral-900)]">Carlos Rodríguez</p>
              <p className="text-xs text-[color:var(--sp-neutral-500)]">Propietario</p>
            </div>
            <div className="w-10 h-10 bg-[color:var(--sp-primary-600)] rounded-full flex items-center justify-center">
              <span className="text-[color:var(--sp-on-primary)] font-medium text-sm">CR</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ✅ LAYOUT PRINCIPAL DEL DASHBOARD
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Precalentar datos de usuario/restaurante para evitar llamadas repetidas
  useEffect(() => {
    preloadUserAndRestaurant();
  }, []);

  return (
    <NotificationProvider>
  <div className="h-screen flex overflow-hidden bg-[color:var(--sp-neutral-50)]">
        {/* Barra lateral */}
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        {/* Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />
          {/* Contenido de la página */}
          <main className="flex-1 overflow-y-auto">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}