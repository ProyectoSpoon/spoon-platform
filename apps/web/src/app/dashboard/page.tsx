// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDashboardSnapshot } from './hooks/useDashboardSnapshot';
import { useRestaurantSetupStatus } from './hooks/useRestaurantSetupStatus';
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
const ImageComponent = Image as any;

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const { loading, caja, menu, mesas } = useDashboardSnapshot();
  const setup = useRestaurantSetupStatus();

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
            <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-[color:var(--sp-border)] bg-[color:var(--sp-surface-elevated)] flex items-center justify-center">
              <ImageComponent
                src="/images/spoon-logo.jpg"
                alt="SPOON"
                width={64}
                height={64}
                className="w-16 h-16 object-cover"
                priority
              />
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

      {/* Cards de estado y acciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Caja */}
        <LinkComponent href="/dashboard/caja" className="group">
          <div className={`rounded-lg border p-6 hover:shadow-lg transition-all ${caja.abierta ? 'bg-[color:var(--sp-success-50)] border-[color:var(--sp-success-200)]' : 'bg-[color:var(--sp-warning-50)] border-[color:var(--sp-warning-200)]'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-3 rounded-lg ${caja.abierta ? 'bg-[color:var(--sp-success-100)]' : 'bg-[color:var(--sp-warning-100)]'}`}>
                <CheckCircleComponent className={`h-6 w-6 ${caja.abierta ? 'text-[color:var(--sp-success-600)]' : 'text-[color:var(--sp-warning-600)]'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-[color:var(--sp-neutral-900)]">Caja</h3>
                <p className="text-sm text-[color:var(--sp-neutral-600)]">{caja.abierta ? 'Abierta' : 'Cerrada'}</p>
              </div>
            </div>
            <p className="text-sm text-[color:var(--sp-neutral-700)]">{caja.abierta ? `Abierta desde ${caja.apertura ? new Date(caja.apertura).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'}) : '—'}` : 'Abre la caja para iniciar el servicio'}</p>
            <div className="mt-4 flex items-center text-[color:var(--sp-primary-700)] text-sm font-medium group-hover:underline">
              Ir a Caja
              <ExternalLinkComponent className="h-4 w-4 ml-1" />
            </div>
          </div>
        </LinkComponent>

        {/* Menú del Día */}
        <div className={`group rounded-lg border p-6 hover:shadow-lg transition-all ${menu.hayMenuHoy ? 'bg-[color:var(--sp-info-50)] border-[color:var(--sp-info-200)]' : 'bg-[color:var(--sp-warning-50)] border-[color:var(--sp-warning-200)]'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-[color:var(--sp-info-100)] rounded-lg">
                <MenuComponent className="h-6 w-6 text-[color:var(--sp-info-600)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[color:var(--sp-neutral-900)]">Menú del Día</h3>
                <p className="text-sm text-[color:var(--sp-neutral-600)]">{menu.hayMenuHoy ? 'Activo para hoy' : 'No configurado'}</p>
              </div>
            </div>
            <p className="text-sm text-[color:var(--sp-neutral-700)]">{menu.loading ? 'Cargando…' : menu.hayMenuHoy ? `${menu.totalCombinaciones} combinaciones` : 'Configura el menú para habilitar Domicilios'}</p>
            <LinkComponent href="/dashboard/carta/menu-dia" className="mt-4 inline-flex items-center text-[color:var(--sp-primary-700)] text-sm font-medium hover:underline focus:underline">
              {menu.hayMenuHoy ? 'Editar Menú' : 'Configurar Menú'}
              <ExternalLinkComponent className="h-4 w-4 ml-1" />
            </LinkComponent>
        </div>

        {/* Mesas */}
        <LinkComponent href="/dashboard/mesas" className="group">
          <div className="rounded-lg border p-6 hover:shadow-lg transition-all bg-[color:var(--sp-surface-elevated)] border-[color:var(--sp-border)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-[color:var(--sp-primary-100)] rounded-lg">
                <CoffeeComponent className="h-6 w-6 text-[color:var(--sp-primary-600)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[color:var(--sp-neutral-900)]">Mesas</h3>
                <p className="text-sm text-[color:var(--sp-neutral-600)]">{caja.abierta ? 'En servicio' : 'Requiere caja abierta'}</p>
              </div>
            </div>
            <p className="text-sm text-[color:var(--sp-neutral-700)]">{caja.abierta ? `${mesas.activas} activas • ${mesas.enCocina} en cocina • Por cobrar ${Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(mesas.porCobrarCOP)}` : 'Abre la caja para gestionar mesas'}</p>
            <div className="mt-4 flex items-center text-[color:var(--sp-primary-700)] text-sm font-medium group-hover:underline">
              Ir a Mesas
              <ExternalLinkComponent className="h-4 w-4 ml-1" />
            </div>
          </div>
        </LinkComponent>
      </div>

      {/* Estado actual */}
  <div className="bg-[color:var(--sp-surface-elevated)] rounded-lg border border-[color:var(--sp-border)] p-6">
  <h2 className="heading-section mb-4">Estado Actual</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Configuración: dinámica según checklist */}
          <div className={`p-4 rounded-lg border ${setup.completed
            ? 'bg-[color:var(--sp-success-50)] border-[color:var(--sp-success-200)]'
            : 'bg-[color:var(--sp-warning-50)] border-[color:var(--sp-warning-200)]'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircleComponent className={`h-5 w-5 ${setup.completed ? 'text-[color:var(--sp-success-600)]' : 'text-[color:var(--sp-warning-600)]'}`} />
              <span className={`font-medium ${setup.completed ? 'text-[color:var(--sp-success-900)]' : 'text-[color:var(--sp-warning-900)]'}`}>Configuración</span>
            </div>
            {setup.completed ? (
              <p className="text-sm text-[color:var(--sp-success-700)]">Configuración básica completa</p>
            ) : (
              <p className="text-sm text-[color:var(--sp-warning-700)]">Completa la configuración de tu restaurante para empezar</p>
            )}
          </div>

          {/* Menú: enlazado al snapshot real */}
          <div className={`p-4 rounded-lg border ${menu.hayMenuHoy
            ? 'bg-[color:var(--sp-info-50)] border-[color:var(--sp-info-200)]'
            : 'bg-[color:var(--sp-error-50)] border-[color:var(--sp-error-200)]'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircleComponent className={`h-5 w-5 ${menu.hayMenuHoy ? 'text-[color:var(--sp-info-600)]' : 'text-[color:var(--sp-error-600)]'}`} />
              <span className={`font-medium ${menu.hayMenuHoy ? 'text-[color:var(--sp-info-900)]' : 'text-[color:var(--sp-error-900)]'}`}>Menú</span>
            </div>
            <p className={`text-sm ${menu.hayMenuHoy ? 'text-[color:var(--sp-info-700)]' : 'text-[color:var(--sp-error-700)]'}`}>
              {menu.loading ? 'Cargando…' : menu.hayMenuHoy ? `Activo para hoy • ${menu.totalCombinaciones} combinaciones` : 'Sin menú configurado para hoy'}
            </p>
          </div>

          {/* Visibilidad: placeholder controlado */}
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
        <div className="mt-4">
          <h3 className="text-sm font-medium text-[color:var(--sp-neutral-900)]">Configuración del restaurante</h3>
          {setup.loading ? (
            <p className="text-sm text-[color:var(--sp-neutral-500)] mt-1">Cargando…</p>
          ) : setup.completed ? (
            <p className="text-sm text-[color:var(--sp-success-700)] mt-1">Todo listo. La configuración básica está completa.</p>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-[color:var(--sp-neutral-700)]">Falta completar:</p>
              <ul className="mt-1 list-disc list-inside space-y-1 text-sm text-[color:var(--sp-neutral-700)]">
                {setup.missing.map((m) => (
                  <li key={m.id}>
                    <a className="text-[color:var(--sp-primary-700)] hover:underline" href={m.link}>{m.label}</a>
                    <span className="text-[color:var(--sp-neutral-500)]"> — {m.hint}</span>
                  </li>
                ))}
              </ul>
              <a
                href={(() => {
                  if (setup.completed || !setup.missing.length) return '/dashboard/configuracion#general';
                  const first = setup.missing[0]?.id;
                  const map: Record<string, string> = {
                    nombre: 'general',
                    contacto: 'general',
                    tipo_cocina: 'general',
                    ubicacion: 'ubicacion',
                    horarios: 'horarios',
                    imagenes: 'imagenes'
                  };
                  const anchor = map[first || 'general'] || 'general';
                  return `/dashboard/configuracion#${anchor}`;
                })()}
                className="inline-flex mt-3 items-center rounded-md bg-[color:var(--sp-primary-600)] px-3 py-1.5 text-sm font-medium text-[color:var(--sp-on-primary)] hover:bg-[color:var(--sp-primary-700)]"
              >
                Completar configuración
              </a>
            </div>
          )}
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


