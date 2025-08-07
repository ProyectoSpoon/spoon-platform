// apps/web/src/app/config-restaurante/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, getUserRestaurant } from '@spoon/shared';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription,
  Progress,
  toast 
} from '@spoon/shared';

interface ConfigProgress {
  informacionGeneral: boolean;
  ubicacion: boolean;
  horarios: boolean;
  logoPortada: boolean;
  totalCompleto: number;
  totalPasos: number;
  porcentaje: number;
}

// Configuración de cada paso
const configSteps = [
  {
    id: 'informacionGeneral',
    title: 'Información General',
    description: 'Datos básicos del restaurante: nombre, contacto y tipo de cocina',
    icon: '📋',
    color: 'purple',
    route: '/config-restaurante/informacion-general',
    requiredFields: 4
  },
  {
    id: 'ubicacion',
    title: 'Ubicación',
    description: 'Dirección y ubicación geográfica del restaurante',
    icon: '📍',
    color: 'blue',
    route: '/config-restaurante/ubicacion',
    requiredFields: 3
  },
  {
    id: 'horarios',
    title: 'Horarios',
    description: 'Horarios de atención y días de operación',
    icon: '⏰',
    color: 'green',
    route: '/config-restaurante/horario-comercial',
    requiredFields: 2
  },
  {
    id: 'logoPortada',
    title: 'Logo y Portada',
    description: 'Imágenes representativas del restaurante',
    icon: '🖼️',
    color: 'orange',
    route: '/config-restaurante/logo-portada',
    requiredFields: 2
  }
];

// Mapping de colores para Tailwind
const colorClasses = {
  purple: { bg: 'bg-purple-100', icon: 'bg-purple-600' },
  blue: { bg: 'bg-blue-100', icon: 'bg-blue-600' },
  green: { bg: 'bg-green-100', icon: 'bg-green-600' },
  orange: { bg: 'bg-orange-100', icon: 'bg-orange-600' }
};

export default function ConfigRestaurantePage() {
  const router = useRouter();
  const [progreso, setProgreso] = useState<ConfigProgress>({
    informacionGeneral: false,
    ubicacion: false,
    horarios: false,
    logoPortada: false,
    totalCompleto: 0,
    totalPasos: 4,
    porcentaje: 0
  });
  const [cargando, setCargando] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  /**
   * Cargar progreso real desde Supabase
   */
  useEffect(() => {
    const cargarProgreso = async () => {
      try {
        setCargando(true);
        
        const profile = await getUserProfile();
        const restaurant = await getUserRestaurant();
        
        if (profile) {
          setUserInfo(profile);
          console.log('👤 Usuario cargado:', profile.email);
        }
        
        if (restaurant) {
          console.log('🏪 Restaurante encontrado:', restaurant.id);
          setRestaurantId(restaurant.id);
          
          const progresoCalculado = calcularProgresoRestaurante(restaurant);
          setProgreso(progresoCalculado);
          
          console.log('📊 Progreso calculado:', progresoCalculado);
        } else {
          console.log('📝 No hay restaurante, progreso inicial');
          setRestaurantId(null);
          setProgreso({
            informacionGeneral: false,
            ubicacion: false,
            horarios: false,
            logoPortada: false,
            totalCompleto: 0,
            totalPasos: 4,
            porcentaje: 0
          });
        }
        
      } catch (error) {
        console.error('❌ Error cargando progreso:', error);
        toast.error('Error al cargar la configuración');
      } finally {
        setCargando(false);
      }
    };

    cargarProgreso();
  }, []);

  /**
   * Calcular progreso basado en los datos del restaurante
   */
  const calcularProgresoRestaurante = (restaurant: any): ConfigProgress => {
    const infoGeneral = !!(
      restaurant.name && 
      restaurant.description && 
      restaurant.contact_phone && 
      restaurant.cuisine_type
    );
    
    const ubicacion = !!(
      restaurant.address && 
      restaurant.latitude && 
      restaurant.longitude
    );
    
    const horarios = !!(
      restaurant.business_hours && 
      Object.keys(restaurant.business_hours).length > 0
    );
    
    const logoPortada = !!(
      restaurant.logo_url && 
      restaurant.cover_image_url
    );
    
    const completados = [infoGeneral, ubicacion, horarios, logoPortada].filter(Boolean).length;
    const porcentaje = Math.round((completados / 4) * 100);
    
    return {
      informacionGeneral: infoGeneral,
      ubicacion: ubicacion,
      horarios: horarios,
      logoPortada: logoPortada,
      totalCompleto: completados,
      totalPasos: 4,
      porcentaje: porcentaje
    };
  };

  const configuracionCompleta = progreso.totalCompleto === 4;

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¡Bienvenido a SPOON! 🍴
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Tu socio tecnológico para hacer crecer tu restaurante
          </p>
          <p className="text-gray-500 mb-8">
            Estamos aquí para ayudarte a vender más con nuestro menú digital gratuito. Solo necesitamos configurar algunos detalles básicos para comenzar.
          </p>
          
          {/* Info del usuario */}
          {userInfo && (
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <span>👤 {userInfo.email}</span>
              <span>🆔 ID: {userInfo.id.slice(0, 8)}...</span>
              <span>👑 {userInfo.role}</span>
            </div>
          )}
        </div>

        {/* Título de configuración */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Configuración Inicial
          </h2>
          <p className="text-gray-600">
            Completa estos 4 pasos para activar todas las funcionalidades de SPOON
          </p>
        </div>

        {/* Tarjetas de configuración */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {configSteps.map((step) => {
            const isCompleted = progreso[step.id as keyof ConfigProgress] as boolean;
            const progressValue = isCompleted ? 100 : 0;
            const completedCount = isCompleted ? step.requiredFields : 0;
            const colors = colorClasses[step.color as keyof typeof colorClasses];
            
            return (
              <Card key={step.id} variant="hover" className="relative">
                {/* Icono de triángulo decorativo */}
                <div className="absolute top-4 right-4">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 0L20 20H0L10 0z"/>
                  </svg>
                </div>
                
                <CardHeader className="text-center">
                  {/* Icono principal */}
                  <div className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center mb-4 mx-auto`}>
                    <div className={`w-8 h-8 ${colors.icon} rounded-full flex items-center justify-center text-white text-lg`}>
                      {step.icon}
                    </div>
                  </div>
                  
                  <CardTitle className="mb-2">{step.title}</CardTitle>
                  <CardDescription className="mb-6">
                    {step.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="text-center">
                  {/* Progreso */}
                  <div className="mb-4">
                    <div className={`text-2xl font-bold mb-2 ${isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {progressValue}%
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      {completedCount}/{step.requiredFields}
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        📋 {isCompleted ? 'Completado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    variant={step.color as any}
                    size="full"
                    onClick={() => router.push(step.route)}
                  >
                    Configurar →
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Estado general */}
        {!configuracionCompleta ? (
          <Card className="text-center bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-orange-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
                </svg>
                <h3 className="text-xl font-bold text-orange-800">
                  Faltan algunos pasos
                </h3>
              </div>
              <p className="text-orange-700 mb-6">
                Completa las configuraciones pendientes para activar todas las funciones
              </p>
              <Progress 
                value={progreso.porcentaje} 
                variant="warning"
                label={`Progreso actual: ${progreso.totalCompleto} de 4 secciones completadas`}
                className="max-w-md mx-auto"
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="text-center bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
                <h3 className="text-xl font-bold text-green-800">
                  ¡Configuración Completa!
                </h3>
              </div>
              <p className="text-green-700 mb-6">
                Has completado todos los pasos de configuración. ¡Tu restaurante está completamente configurado!
              </p>
              <Button 
                variant="green"
                size="lg"
                onClick={() => router.push('/dashboard')}
              >
                ⏱️ Ir al Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Debug Info (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-gray-100 rounded-lg p-4 text-sm">
            <h4 className="font-bold mb-2">Debug - Progreso Real:</h4>
            <div className="grid grid-cols-4 gap-4 text-xs">
              {configSteps.map((step) => {
                const isCompleted = progreso[step.id as keyof ConfigProgress] as boolean;
                return (
                  <div key={step.id}>
                    <strong>{step.title}:</strong> {isCompleted ? '✅ Completado' : '❌ Pendiente'}
                  </div>
                );
              })}
            </div>
            <p className="mt-2">
              <strong>Total:</strong> {progreso.totalCompleto}/{progreso.totalPasos} ({progreso.porcentaje}%)
            </p>
            <p><strong>Restaurant ID:</strong> {restaurantId}</p>
          </div>
        )}

      </div>
    </div>
  );
}