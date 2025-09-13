"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
  Menu,
  AlertCircle,
  CheckCircle,
  Eye,
  ExternalLink,
  Coffee,
  Heart,
} from 'lucide-react';

// Type casting para componentes de lucide-react
const SettingsCast = Settings as any;
const MenuCast = Menu as any;
const AlertCircleCast = AlertCircle as any;
const CheckCircleCast = CheckCircle as any;
const EyeCast = Eye as any;
const ExternalLinkCast = ExternalLink as any;
const CoffeeCast = Coffee as any;
const HeartCast = Heart as any;
const LinkCast = Link as any;

export default function DashboardClient() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [mounted]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  const formatDate = (date: Date) =>
    date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-[color:var(--sp-primary-50)] to-[color:var(--sp-info-50)] rounded-lg border border-[color:var(--sp-primary-200)] p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[color:var(--sp-primary-600)] rounded-full flex items-center justify-center">
              <CoffeeCast className="h-8 w-8 text-[color:var(--sp-on-primary)]" />
            </div>
          </div>

          <h1 className="heading-page mb-4">¡Bienvenido a SPOON! 🍽️</h1>

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
                <div className="value-number text-[color:var(--sp-primary-600)] mb-1">--:--:--</div>
                <div className="text-sm text-[color:var(--sp-neutral-600)]">Cargando fecha...</div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LinkCast href="/dashboard/configuracion" className="group">
          <div className="bg-[color:var(--sp-surface-elevated)] rounded-lg border border-[color:var(--sp-border)] p-6 hover:shadow-lg transition-all duration-200 hover:border-[color:var(--sp-primary-300)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[color:var(--sp-primary-100)] rounded-lg group-hover:bg-[color:var(--sp-primary-200)] transition-colors">
                <SettingsCast className="h-6 w-6 text-[color:var(--sp-primary-600)]" />
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
              <ExternalLinkCast className="h-4 w-4 ml-1" />
            </div>
          </div>
        </LinkCast>

        <div className="bg-[color:var(--sp-surface-elevated)] rounded-lg border border-[color:var(--sp-border)] p-6 opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[color:var(--sp-info-100)] rounded-lg">
              <MenuCast className="h-6 w-6 text-[color:var(--sp-info-600)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[color:var(--sp-neutral-900)]">Menú Diario</h3>
              <p className="text-sm text-[color:var(--sp-neutral-600)]">Próximamente</p>
            </div>
          </div>
          <p className="text-[color:var(--sp-neutral-700)] text-sm">
            Configura los platos disponibles para hoy y aparece en búsquedas.
          </p>
          <div className="mt-4 text-[color:var(--sp-neutral-400)] text-sm">Disponible pronto</div>
        </div>

        <div className="bg-[color:var(--sp-surface-elevated)] rounded-lg border border-[color:var(--sp-border)] p-6 opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[color:var(--sp-success-100)] rounded-lg">
              <EyeCast className="h-6 w-6 text-[color:var(--sp-success-600)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[color:var(--sp-neutral-900)]">Analytics</h3>
              <p className="text-sm text-[color:var(--sp-neutral-600)]">Próximamente</p>
            </div>
          </div>
          <p className="text-[color:var(--sp-neutral-700)] text-sm">
            Ve las estadísticas de búsquedas, visitas y rendimiento de tu restaurante.
          </p>
          <div className="mt-4 text-[color:var(--sp-neutral-400)] text-sm">Disponible pronto</div>
        </div>
      </div>

      <div className="bg-[color:var(--sp-surface-elevated)] rounded-lg border border-[color:var(--sp-border)] p-6">
        <h2 className="heading-section mb-4">Estado Actual</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[color:var(--sp-warning-50)] border border-[color:var(--sp-warning-200)] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircleCast className="h-5 w-5 text-[color:var(--sp-warning-600)]" />
              <span className="font-medium text-[color:var(--sp-warning-900)]">Configuración</span>
            </div>
            <p className="text-sm text-[color:var(--sp-warning-700)]">Completa la configuración de tu restaurante para empezar</p>
          </div>

          <div className="p-4 bg-[color:var(--sp-error-50)] border border-[color:var(--sp-error-200)] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircleCast className="h-5 w-5 text-[color:var(--sp-error-600)]" />
              <span className="font-medium text-[color:var(--sp-error-900)]">Menú</span>
            </div>
            <p className="text-sm text-[color:var(--sp-error-700)]">Sin menú configurado para hoy</p>
          </div>

          <div className="p-4 bg-[color:var(--sp-neutral-50)] border border-[color:var(--sp-neutral-200)] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <EyeCast className="h-5 w-5 text-[color:var(--sp-neutral-600)]" />
              <span className="font-medium text-[color:var(--sp-neutral-900)]">Visibilidad</span>
            </div>
            <p className="text-sm text-[color:var(--sp-neutral-700)]">No visible en búsquedas aún</p>
          </div>
        </div>
      </div>

      <div className="bg-[color:var(--sp-primary-600)] bg-gradient-to-r from-[color:var(--sp-primary-600)] to-[color:var(--sp-info-600)] rounded-lg p-6 text-[color:var(--sp-on-primary)] text-center">
        <div className="flex justify-center mb-3">
          <HeartCast className="h-6 w-6" />
        </div>
        <h3 className="font-semibold mb-2">¡Estamos aquí para ayudarte a crecer!</h3>
        <p className="text-sm opacity-90">
          Comienza configurando tu restaurante y pronto verás más comensales descubriendo tu deliciosa comida.
        </p>
      </div>
    </div>
  );
}
