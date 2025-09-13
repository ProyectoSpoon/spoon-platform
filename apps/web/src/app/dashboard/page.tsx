// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Menu, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Eye,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Coffee,
  Heart
} from 'lucide-react';

// Type casting to resolve React version conflicts
const LinkComponent = Link as any;
const SettingsComponent = Settings as any;
const MenuComponent = Menu as any;
const AlertCircleComponent = AlertCircle as any;
const CheckCircleComponent = CheckCircle as any;
const ClockComponent = Clock as any;
const EyeComponent = Eye as any;
const MapPinComponent = MapPin as any;
const PhoneComponent = Phone as any;
const MailComponent = Mail as any;
const ExternalLinkComponent = ExternalLink as any;
const CoffeeComponent = Coffee as any;
const HeartComponent = Heart as any;

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // Evitar hydration error
  useEffect(() => {
    setMounted(true);
  }, []);

  // Actualizar hora cada segundo
  useEffect(() => {
    if (!mounted) return;
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [mounted]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Bienvenida principal */}
  <div className="bg-gradient-to-r from-[color:var(--sp-primary-50)] to-[color:var(--sp-info-50)] rounded-lg border border-[color:var(--sp-primary-200)] p-8 text-center">
        <div className="max-w-2xl mx-auto">
      <div className="flex justify-center mb-4">
    <div className="w-16 h-16 bg-[color:var(--sp-primary-600)] rounded-full flex items-center justify-center">
      <CoffeeComponent className="h-8 w-8 text-[color:var(--sp-on-primary)]" />
            </div>
          </div>
          
          <h1 className="heading-page mb-4">
            ¡Bienvenido a SPOON! 🍽️
          </h1>
          
          <p className="subtitle mb-6">
            Tu plataforma para gestionar tu restaurante y conectar con más comensales
          </p>
          
  <div className="bg-[color:var(--sp-surface-elevated)]/60 rounded-lg p-4 inline-block">
            {mounted ? (
              <>
        <div className="value-number text-[color:var(--sp-primary-600)] mb-1">
                  {formatTime(currentTime)}
                </div>
        <div className="text-sm text-[color:var(--sp-neutral-600)] capitalize">
                  {formatDate(currentTime)}
                </div>
              </>
            ) : (
              <>
        <div className="value-number text-[color:var(--sp-primary-600)] mb-1">
                  --:--:--
                </div>
        <div className="text-sm text-[color:var(--sp-neutral-600)]">
                  Cargando fecha...
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cards de acciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Configuración */}
        <LinkComponent href="/dashboard/configuracion" className="group">
          <div className="bg-[color:var(--sp-surface-elevated)] rounded-lg border border-[color:var(--sp-border)] p-6 hover:shadow-lg transition-all duration-200 hover:border-[color:var(--sp-primary-300)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[color:var(--sp-primary-100)] rounded-lg group-hover:bg-[color:var(--sp-primary-200)] transition-colors">
                <SettingsComponent className="h-6 w-6 text-[color:var(--sp-primary-600)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[color:var(--sp-neutral-900)]">Configuración</h3>
                <p className="text-sm text-[color:var(--sp-neutral-600)]">Configura tu restaurante</p>
              </div>
            </div>
            <p className="text-[color:var(--sp-neutral-700)] text-sm">
              Completa la información de tu restaurante, horarios, ubicación y más.
            </p>
            <div className="mt-4 flex items-center text-[color:var(--sp-primary-600)] text-sm font-medium group-hover:text-[color:var(--sp-primary-700)]">
              Ir a configuración
              <ExternalLinkComponent className="h-4 w-4 ml-1" />
            </div>
          </div>
        </LinkComponent>

        {/* Menú Diario */}
  <div className="bg-[color:var(--sp-surface-elevated)] rounded-lg border border-[color:var(--sp-border)] p-6 opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[color:var(--sp-info-100)] rounded-lg">
              <MenuComponent className="h-6 w-6 text-[color:var(--sp-info-600)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[color:var(--sp-neutral-900)]">Menú Diario</h3>
              <p className="text-sm text-[color:var(--sp-neutral-600)]">Próximamente</p>
            </div>
          </div>
          <p className="text-[color:var(--sp-neutral-700)] text-sm">
            Configura los platos disponibles para hoy y aparece en búsquedas.
          </p>
          <div className="mt-4 text-[color:var(--sp-neutral-400)] text-sm">
            Disponible pronto
          </div>
        </div>

        {/* Analytics */}
  <div className="bg-[color:var(--sp-surface-elevated)] rounded-lg border border-[color:var(--sp-border)] p-6 opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[color:var(--sp-success-100)] rounded-lg">
              <EyeComponent className="h-6 w-6 text-[color:var(--sp-success-600)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[color:var(--sp-neutral-900)]">Analytics</h3>
              <p className="text-sm text-[color:var(--sp-neutral-600)]">Próximamente</p>
            </div>
          </div>
          <p className="text-[color:var(--sp-neutral-700)] text-sm">
            Ve las estadísticas de búsquedas, visitas y rendimiento de tu restaurante.
          </p>
          <div className="mt-4 text-[color:var(--sp-neutral-400)] text-sm">
            Disponible pronto
          </div>
        </div>
      </div>

      {/* Estado actual */}
  <div className="bg-[color:var(--sp-surface-elevated)] rounded-lg border border-[color:var(--sp-border)] p-6">
  <h2 className="heading-section mb-4">Estado Actual</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[color:var(--sp-warning-50)] border border-[color:var(--sp-warning-200)] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircleComponent className="h-5 w-5 text-[color:var(--sp-warning-600)]" />
              <span className="font-medium text-[color:var(--sp-warning-900)]">Configuración</span>
            </div>
            <p className="text-sm text-[color:var(--sp-warning-700)]">
              Completa la configuración de tu restaurante para empezar
            </p>
          </div>

          <div className="p-4 bg-[color:var(--sp-error-50)] border border-[color:var(--sp-error-200)] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircleComponent className="h-5 w-5 text-[color:var(--sp-error-600)]" />
              <span className="font-medium text-[color:var(--sp-error-900)]">Menú</span>
            </div>
            <p className="text-sm text-[color:var(--sp-error-700)]">
              Sin menú configurado para hoy
            </p>
          </div>

          <div className="p-4 bg-[color:var(--sp-neutral-50)] border border-[color:var(--sp-neutral-200)] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <EyeComponent className="h-5 w-5 text-[color:var(--sp-neutral-600)]" />
              <span className="font-medium text-[color:var(--sp-neutral-900)]">Visibilidad</span>
            </div>
            <p className="text-sm text-[color:var(--sp-neutral-700)]">
              No visible en búsquedas aún
            </p>
          </div>
        </div>
      </div>

      {/* Información de SPOON */}
  <div className="bg-[color:var(--sp-surface-elevated)] rounded-lg border border-[color:var(--sp-border)] p-6">
  <h2 className="heading-section mb-4">Acerca de SPOON</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-[color:var(--sp-neutral-900)] mb-2">¿Qué es SPOON?</h3>
            <p className="text-sm text-[color:var(--sp-neutral-700)] mb-4">
              SPOON es tu socio tecnológico que te ayuda a vender más con nuestro menú digital gratuito, 
              y luego usa esa información para que ahorres tiempo y dinero comprando tus insumos.
            </p>
            
            <h4 className="font-medium text-[color:var(--sp-neutral-900)] mb-2">¿Cómo funciona?</h4>
            <ul className="text-sm text-[color:var(--sp-neutral-700)] space-y-1">
              <li>• Configuras tu restaurante y menú diario</li>
              <li>• Los comensales te encuentran cuando buscan comida</li>
              <li>• Analizamos tu demanda para optimizar compras</li>
              <li>• Te conectamos con los mejores proveedores</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-[color:var(--sp-neutral-900)] mb-2">Beneficios para tu restaurante</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircleComponent className="h-5 w-5 text-[color:var(--sp-success-500)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[color:var(--sp-neutral-900)]">Más clientes</p>
                  <p className="text-xs text-[color:var(--sp-neutral-600)]">Aparece cuando buscan tu tipo de comida</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircleComponent className="h-5 w-5 text-[color:var(--sp-success-500)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[color:var(--sp-neutral-900)]">Ahorro en compras</p>
                  <p className="text-xs text-[color:var(--sp-neutral-600)]">Mejores precios en insumos basados en tu demanda</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircleComponent className="h-5 w-5 text-[color:var(--sp-success-500)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[color:var(--sp-neutral-900)]">Gratis para empezar</p>
                  <p className="text-xs text-[color:var(--sp-neutral-600)]">Sin costos iniciales, pagas solo cuando vendes más</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer motivacional */}
  <div className="bg-gradient-to-r from-[color:var(--sp-primary-600)] to-[color:var(--sp-info-600)] rounded-lg p-6 text-[color:var(--sp-on-primary)] text-center">
        <div className="flex justify-center mb-3">
          <HeartComponent className="h-6 w-6" />
        </div>
        <h3 className="font-semibold mb-2">¡Estamos aquí para ayudarte a crecer!</h3>
        <p className="text-sm opacity-90">
          Comienza configurando tu restaurante y pronto verás más comensales descubriendo tu deliciosa comida.
        </p>
      </div>
    </div>
  );
}


