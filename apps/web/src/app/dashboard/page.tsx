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
      <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-lg border border-orange-200 p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center">
              <Coffee className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="heading-page mb-4">
            ¡Bienvenido a SPOON! 🍽️
          </h1>
          
          <p className="subtitle mb-6">
            Tu plataforma para gestionar tu restaurante y conectar con más comensales
          </p>
          
          <div className="bg-white/60 rounded-lg p-4 inline-block">
            {mounted ? (
              <>
                <div className="value-number text-orange-600 mb-1">
                  {formatTime(currentTime)}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {formatDate(currentTime)}
                </div>
              </>
            ) : (
              <>
                <div className="value-number text-orange-600 mb-1">
                  --:--:--
                </div>
                <div className="text-sm text-gray-600">
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
        <Link href="/dashboard/configuracion" className="group">
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-orange-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Settings className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Configuración</h3>
                <p className="text-sm text-gray-600">Configura tu restaurante</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm">
              Completa la información de tu restaurante, horarios, ubicación y más.
            </p>
            <div className="mt-4 flex items-center text-orange-600 text-sm font-medium group-hover:text-orange-700">
              Ir a configuración
              <ExternalLink className="h-4 w-4 ml-1" />
            </div>
          </div>
        </Link>

        {/* Menú Diario */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Menu className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Menú Diario</h3>
              <p className="text-sm text-gray-600">Próximamente</p>
            </div>
          </div>
          <p className="text-gray-700 text-sm">
            Configura los platos disponibles para hoy y aparece en búsquedas.
          </p>
          <div className="mt-4 text-gray-400 text-sm">
            Disponible pronto
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-600">Próximamente</p>
            </div>
          </div>
          <p className="text-gray-700 text-sm">
            Ve las estadísticas de búsquedas, visitas y rendimiento de tu restaurante.
          </p>
          <div className="mt-4 text-gray-400 text-sm">
            Disponible pronto
          </div>
        </div>
      </div>

      {/* Estado actual */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
  <h2 className="heading-section mb-4">Estado Actual</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-900">Configuración</span>
            </div>
            <p className="text-sm text-yellow-700">
              Completa la configuración de tu restaurante para empezar
            </p>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-900">Menú</span>
            </div>
            <p className="text-sm text-red-700">
              Sin menú configurado para hoy
            </p>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Visibilidad</span>
            </div>
            <p className="text-sm text-gray-700">
              No visible en búsquedas aún
            </p>
          </div>
        </div>
      </div>

      {/* Información de SPOON */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
  <h2 className="heading-section mb-4">Acerca de SPOON</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">¿Qué es SPOON?</h3>
            <p className="text-sm text-gray-700 mb-4">
              SPOON es tu socio tecnológico que te ayuda a vender más con nuestro menú digital gratuito, 
              y luego usa esa información para que ahorres tiempo y dinero comprando tus insumos.
            </p>
            
            <h4 className="font-medium text-gray-900 mb-2">¿Cómo funciona?</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Configuras tu restaurante y menú diario</li>
              <li>• Los comensales te encuentran cuando buscan comida</li>
              <li>• Analizamos tu demanda para optimizar compras</li>
              <li>• Te conectamos con los mejores proveedores</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Beneficios para tu restaurante</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Más clientes</p>
                  <p className="text-xs text-gray-600">Aparece cuando buscan tu tipo de comida</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Ahorro en compras</p>
                  <p className="text-xs text-gray-600">Mejores precios en insumos basados en tu demanda</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Gratis para empezar</p>
                  <p className="text-xs text-gray-600">Sin costos iniciales, pagas solo cuando vendes más</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer motivacional */}
      <div className="bg-gradient-to-r from-orange-600 to-blue-600 rounded-lg p-6 text-white text-center">
        <div className="flex justify-center mb-3">
          <Heart className="h-6 w-6" />
        </div>
        <h3 className="font-semibold mb-2">¡Estamos aquí para ayudarte a crecer!</h3>
        <p className="text-sm opacity-90">
          Comienza configurando tu restaurante y pronto verás más comensales descubriendo tu deliciosa comida.
        </p>
      </div>
    </div>
  );
}