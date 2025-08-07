// src/app/dashboard/layout.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Settings, 
  Menu,
  BarChart3,
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
    label: 'Facturación',
    href: '/dashboard/facturacion',
    icon: BarChart3,
    description: 'Reportes y analytics'
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
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    } flex flex-col h-full`}>
      
      {/* Header del sidebar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">SPOON</h1>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>
          )}
          
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
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
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${
                isActive ? 'text-orange-600' : 'text-gray-500 group-hover:text-gray-700'
              }`} />
              
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-600 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
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
      <div className="p-4 border-t border-gray-200">
        {!collapsed && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Recordatorio</span>
            </div>
            <p className="text-xs text-blue-700">
              Configura tu menú de hoy para aparecer en búsquedas.
            </p>
          </div>
        )}
        
        <button className={`w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors ${
          collapsed ? 'justify-center' : ''
        }`}>
          <LogOut className="h-5 w-5 text-gray-500" />
          {!collapsed && <span className="text-sm">Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
}

// ✅ COMPONENTE DE HEADER
function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Bienvenido de vuelta</h1>
          <p className="text-sm text-gray-600">Restaurante de Prueba • Medellín, Antioquia</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notificaciones */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Avatar del usuario */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Carlos Rodríguez</p>
              <p className="text-xs text-gray-500">Propietario</p>
            </div>
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">CR</span>
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

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
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
          {children}
        </main>
      </div>
    </div>
  );
}