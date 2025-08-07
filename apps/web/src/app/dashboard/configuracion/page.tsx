// src/app/dashboard/configuracion/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Info, Clock, Upload, Save, Loader, Check, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { RestaurantService, RestaurantData, UserData, BusinessHours } from '@spoon/shared/services/restaurant';
import { getUserProfile, getUserRestaurant, updateRestaurant } from '@spoon/shared';
import toast from 'react-hot-toast';

export default function ConfiguracionPage() {
  // ✅ ESTADO PRINCIPAL
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);

  // ✅ ESTADOS PARA FORMULARIOS
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    description: '',
    cuisine_type: '',
    contact_phone: '',
    contact_email: ''
  });

  const [locationInfo, setLocationInfo] = useState({
    address: '',
    city: '',
    state: '',
    country: 'Colombia'
  });

  const [imageUrls, setImageUrls] = useState({
    logo_url: '',
    cover_image_url: ''
  });

  // ✅ CARGAR DATOS AL INICIALIZAR
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar datos del restaurante y usuario en paralelo
      const [restaurantResult, userResult] = await Promise.all([
        RestaurantService.getUserRestaurant(),
        RestaurantService.getUserProfile()
      ]);

      if (restaurantResult.error) {
        console.error('Error loading restaurant:', restaurantResult.error);
        toast.error('Error cargando datos del restaurante');
        return;
      }

      if (userResult.error) {
        console.error('Error loading user:', userResult.error);
        toast.error('Error cargando datos del usuario');
        return;
      }

      // Establecer datos en el estado
      setRestaurant(restaurantResult.data);
      setUser(userResult.data);

      // Pre-llenar formularios si hay datos
      if (restaurantResult.data) {
        const r = restaurantResult.data;
        
        setBasicInfo({
          name: r.name || '',
          description: r.description || '',
          cuisine_type: r.cuisine_type || '',
          contact_phone: r.contact_phone || '',
          contact_email: r.contact_email || ''
        });

        setLocationInfo({
          address: r.address || '',
          city: r.city || '',
          state: r.state || '',
          country: r.country || 'Colombia'
        });

        setImageUrls({
          logo_url: r.logo_url || '',
          cover_image_url: r.cover_image_url || ''
        });
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error cargando configuración');
    } finally {
      setLoading(false);
    }
  };

  // ✅ GUARDAR INFORMACIÓN BÁSICA
  const saveBasicInfo = async () => {
    setSaving(true);
    try {
      const { data, error } = await RestaurantService.updateBasicInfo(basicInfo);
      
      if (error) {
        throw error;
      }

      setRestaurant(data);
      toast.success('Información básica guardada');
    } catch (error) {
      console.error('Error saving basic info:', error);
      toast.error('Error guardando información básica');
    } finally {
      setSaving(false);
    }
  };

  // ✅ GUARDAR UBICACIÓN
  const saveLocation = async () => {
    setSaving(true);
    try {
      const { data, error } = await RestaurantService.updateLocation(locationInfo);
      
      if (error) {
        throw error;
      }

      setRestaurant(data);
      toast.success('Ubicación guardada');
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Error guardando ubicación');
    } finally {
      setSaving(false);
    }
  };

  // ✅ MOSTRAR LOADING MIENTRAS CARGA
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
            <p className="text-gray-600">Cargando configuración...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Settings className="h-6 w-6 mr-2 text-orange-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Configuración del Restaurante
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {restaurant?.name || 'Restaurante sin nombre'} • {restaurant?.status || 'configuring'}
          </p>
        </div>
      </div>

      {/* Pestañas */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'info'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Info className="h-4 w-4" />
          <span>Información General</span>
        </button>
        
        <button
          onClick={() => setActiveTab('location')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'location'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Info className="h-4 w-4" />
          <span>Ubicación</span>
        </button>
        
        <button
          onClick={() => setActiveTab('horarios')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'horarios'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Horarios</span>
        </button>

        <button
          onClick={() => setActiveTab('imagenes')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'imagenes'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Upload className="h-4 w-4" />
          <span>Imágenes</span>
        </button>
      </div>

      {/* Contenido de pestañas */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        
        {/* PESTAÑA: INFORMACIÓN GENERAL */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900">Información General</h3>
              <p className="text-gray-600 mt-2">Datos básicos de tu restaurante</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Restaurante *
                </label>
                <input
                  type="text"
                  value={basicInfo.name}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Restaurante El Buen Sabor"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Cocina
                </label>
                <select
                  value={basicInfo.cuisine_type}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, cuisine_type: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Seleccionar tipo de cocina</option>
                  <option value="colombiana">Colombiana</option>
                  <option value="mariscos">Mariscos</option>
                  <option value="comida_rapida">Comida Rápida</option>
                  <option value="parrilla">Parrilla</option>
                  <option value="italiana">Italiana</option>
                  <option value="mexicana">Mexicana</option>
                  <option value="vegetariana">Vegetariana</option>
                  <option value="internacional">Internacional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono de Contacto *
                </label>
                <input
                  type="tel"
                  value={basicInfo.contact_phone}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="Ej: 3001234567"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Contacto *
                </label>
                <input
                  type="email"
                  value={basicInfo.contact_email}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="contacto@restaurante.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={basicInfo.description}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe tu restaurante..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={saveBasicInfo}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Guardando...' : 'Guardar Información'}
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA: UBICACIÓN */}
        {activeTab === 'location' && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ubicación del Restaurante</h3>
              <p className="text-gray-600 mt-2">Dirección y localización geográfica</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección Completa *
                </label>
                <input
                  type="text"
                  value={locationInfo.address}
                  onChange={(e) => setLocationInfo(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Ej: Calle 123 #45-67"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad *
                </label>
                <input
                  type="text"
                  value={locationInfo.city}
                  onChange={(e) => setLocationInfo(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Ej: Bogotá"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento/Estado *
                </label>
                <input
                  type="text"
                  value={locationInfo.state}
                  onChange={(e) => setLocationInfo(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="Ej: Cundinamarca"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País
                </label>
                <select
                  value={locationInfo.country}
                  onChange={(e) => setLocationInfo(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="Colombia">Colombia</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={saveLocation}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Guardando...' : 'Guardar Ubicación'}
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA: HORARIOS - COMPONENTE INTEGRADO */}
        {activeTab === 'horarios' && (
          <HorariosIntegrado />
        )}

        {/* PESTAÑA: IMÁGENES */}
        {activeTab === 'imagenes' && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900">Logo y Portada</h3>
              <p className="text-gray-600 mt-2">Sube las imágenes de tu restaurante</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo del Restaurante
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {imageUrls.logo_url ? (
                    <div className="space-y-4">
                      <img 
                        src={imageUrls.logo_url} 
                        alt="Logo actual" 
                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                      <p className="text-sm text-gray-600">Logo actual</p>
                      <button
                        onClick={() => setImageUrls(prev => ({ ...prev, logo_url: '' }))}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remover logo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        Arrastra una imagen aquí o 
                        <button className="text-orange-600 hover:text-orange-700 ml-1">
                          selecciona un archivo
                        </button>
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG hasta 2MB</p>
                    </div>
                  )}
                </div>
                
                {/* Input temporal para URL */}
                <div className="mt-4">
                  <label className="block text-xs text-gray-500 mb-1">URL temporal (para pruebas)</label>
                  <input
                    type="url"
                    value={imageUrls.logo_url}
                    onChange={(e) => setImageUrls(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://ejemplo.com/logo.jpg"
                    className="w-full p-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Portada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen de Portada
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {imageUrls.cover_image_url ? (
                    <div className="space-y-4">
                      <img 
                        src={imageUrls.cover_image_url} 
                        alt="Portada actual" 
                        className="mx-auto h-32 w-full object-cover rounded-lg"
                      />
                      <p className="text-sm text-gray-600">Portada actual</p>
                      <button
                        onClick={() => setImageUrls(prev => ({ ...prev, cover_image_url: '' }))}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remover portada
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        Arrastra una imagen aquí o 
                        <button className="text-orange-600 hover:text-orange-700 ml-1">
                          selecciona un archivo
                        </button>
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
                    </div>
                  )}
                </div>
                
                {/* Input temporal para URL */}
                <div className="mt-4">
                  <label className="block text-xs text-gray-500 mb-1">URL temporal (para pruebas)</label>
                  <input
                    type="url"
                    value={imageUrls.cover_image_url}
                    onChange={(e) => setImageUrls(prev => ({ ...prev, cover_image_url: e.target.value }))}
                    placeholder="https://ejemplo.com/portada.jpg"
                    className="w-full p-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={async () => {
                  setSaving(true);
                  try {
                    const { data, error } = await RestaurantService.updateImages(imageUrls);
                    if (error) throw error;
                    setRestaurant(data);
                    toast.success('Imágenes guardadas');
                  } catch (error) {
                    console.error('Error saving images:', error);
                    toast.error('Error guardando imágenes');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Guardando...' : 'Guardar Imágenes'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Panel de estado de configuración */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-blue-800">Estado de Configuración</h4>
            <p className="text-sm text-blue-600 mt-1">
              {restaurant?.setup_completed 
                ? 'Configuración completada ✅' 
                : `Paso ${restaurant?.setup_step || 1} de 4 - ${
                    restaurant?.setup_step === 1 ? 'Información general' :
                    restaurant?.setup_step === 2 ? 'Ubicación' :
                    restaurant?.setup_step === 3 ? 'Horarios' : 'Imágenes'
                  }`
              }
            </p>
          </div>
          
          {!restaurant?.setup_completed && (
            <button
              onClick={async () => {
                try {
                  const { data, error } = await RestaurantService.markSetupComplete();
                  if (error) throw error;
                  setRestaurant(data);
                  toast.success('¡Configuración marcada como completa!');
                } catch (error) {
                  toast.error('Error marcando configuración como completa');
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Marcar como Completa
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ COMPONENTE DE HORARIOS INTEGRADO SIN NAVEGACIÓN
function HorariosIntegrado() {
  // Tipos para horarios
  interface Turno {
    horaApertura: string;
    horaCierre: string;
  }

  interface HorarioDia {
    abierto: boolean;
    turnos: Turno[];
  }

  interface Horarios {
    lunes: HorarioDia;
    martes: HorarioDia;
    miercoles: HorarioDia;
    jueves: HorarioDia;
    viernes: HorarioDia;
    sabado: HorarioDia;
    domingo: HorarioDia;
  }

  type DiaSemana = keyof Horarios;

  // Constantes
  const DIAS_SEMANA: DiaSemana[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  
  const NOMBRES_DIAS: Record<DiaSemana, string> = {
    lunes: 'Lunes',
    martes: 'Martes', 
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };

  // Estado inicial
  const estadoInicial: Horarios = {
    lunes: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] },
    martes: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] },
    miercoles: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] },
    jueves: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] },
    viernes: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] },
    sabado: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] },
    domingo: { abierto: false, turnos: [{ horaApertura: '08:00', horaCierre: '18:00' }] }
  };

  // Estados
  const [horarios, setHorarios] = useState<Horarios>(estadoInicial);
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaSemana>('lunes');
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Generar opciones de hora
  const generarOpcionesHora = () => {
    const opciones = [];
    for (let hora = 6; hora <= 23; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        if (hora === 23 && minuto === 30) continue;
        const horaStr = hora.toString().padStart(2, '0');
        const minutoStr = minuto.toString().padStart(2, '0');
        const hora24 = `${horaStr}:${minutoStr}`;
        const hora12 = formatTo12Hour(hora24);
        opciones.push({ value: hora24, label: hora12 });
      }
    }
    return opciones;
  };

  // Formatear a 12 horas
  const formatTo12Hour = (hora24: string) => {
    const [hora, minuto] = hora24.split(':').map(Number);
    const periodo = hora >= 12 ? 'PM' : 'AM';
    const hora12 = hora === 0 ? 12 : hora > 12 ? hora - 12 : hora;
    return `${hora12}:${minuto.toString().padStart(2, '0')} ${periodo}`;
  };

  const opcionesHora = generarOpcionesHora();

  // Cargar datos existentes
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const restaurant = await getUserRestaurant();
        
        if (restaurant) {
          setRestaurantId(restaurant.id);
          
          if (restaurant.business_hours && Object.keys(restaurant.business_hours).length > 0) {
            setHorarios(restaurant.business_hours as Horarios);
          }
        }
      } catch (error) {
        console.error('❌ Error cargando datos:', error);
        toast.error('Error al cargar información');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Toggle día abierto/cerrado
  const toggleDiaAbierto = (dia: DiaSemana, abierto: boolean) => {
    setHorarios(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        abierto
      }
    }));
  };

  // Actualizar turno
  const actualizarTurno = (dia: DiaSemana, indice: number, cambios: Partial<Turno>) => {
    setHorarios(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        turnos: prev[dia].turnos.map((turno, i) => 
          i === indice ? { ...turno, ...cambios } : turno
        )
      }
    }));
  };

  // Agregar turno
  const agregarTurno = (dia: DiaSemana) => {
    if (horarios[dia].turnos.length >= 3) return;
    
    setHorarios(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        turnos: [...prev[dia].turnos, { horaApertura: '08:00', horaCierre: '18:00' }]
      }
    }));
  };

  // Eliminar turno
  const eliminarTurno = (dia: DiaSemana, indice: number) => {
    if (horarios[dia].turnos.length <= 1) return;
    
    setHorarios(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        turnos: prev[dia].turnos.filter((_, i) => i !== indice)
      }
    }));
  };

  // Copiar horarios
  const copiarHorarios = (origen: DiaSemana, destino: DiaSemana) => {
    setHorarios(prev => ({
      ...prev,
      [destino]: { ...prev[origen] }
    }));
    toast.success(`Horarios copiados de ${NOMBRES_DIAS[origen]} a ${NOMBRES_DIAS[destino]}`);
  };

  // Verificar si tiene horarios configurados
  const tieneHorariosConfigurados = () => {
    return DIAS_SEMANA.some(dia => horarios[dia].abierto);
  };

  // Guardar horarios
  const guardarHorarios = async () => {
    if (!restaurantId) {
      toast.error('No se encontró información del restaurante');
      return;
    }

    try {
      setGuardando(true);
      
      await updateRestaurant(restaurantId, {
        business_hours: horarios
      });
      
      toast.success('Horarios guardados correctamente');
    } catch (error) {
      console.error('❌ Error guardando horarios:', error);
      toast.error('Error al guardar horarios');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-gray-600">Cargando horarios...</p>
        </div>
      </div>
    );
  }

  const horarioDiaActual = horarios[diaSeleccionado];

  return (
    <div className="space-y-6">
      
      {/* Header limpio para dashboard */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">Horarios Comerciales</h3>
        <p className="text-gray-600 mt-2">Configura los horarios de atención de tu restaurante</p>
      </div>

      {/* Tabs de días */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex gap-1 overflow-x-auto">
          {DIAS_SEMANA.map((dia) => (
            <button
              key={dia}
              onClick={() => setDiaSeleccionado(dia)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                diaSeleccionado === dia
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {NOMBRES_DIAS[dia]}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Vista general */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-4">Resumen de la semana</h4>
          
          <div className="space-y-3">
            {DIAS_SEMANA.map((dia) => {
              const horarioDia = horarios[dia];
              
              return (
                <div
                  key={dia}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    diaSeleccionado === dia 
                      ? 'border-orange-300 bg-orange-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        horarioDia.abierto ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="font-medium text-gray-900 w-20">
                      {NOMBRES_DIAS[dia]}
                    </span>
                  </div>
                  
                  <div className="flex-1 text-sm text-gray-600 mx-4">
                    {horarioDia.abierto ? (
                      horarioDia.turnos.map((turno, i) => (
                        <span key={i} className="mr-3">
                          {formatTo12Hour(turno.horaApertura)} - {formatTo12Hour(turno.horaCierre)}
                        </span>
                      ))
                    ) : (
                      <span className="text-red-600">Cerrado</span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setDiaSeleccionado(dia)}
                    className="text-xs px-3 py-1 rounded border text-orange-600 border-orange-200 hover:bg-orange-50 transition-colors"
                  >
                    Editar
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">
            Configurar {NOMBRES_DIAS[diaSeleccionado]}
          </h4>
          
          <div className="space-y-4">
            {/* Estado del día */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Estado del día:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleDiaAbierto(diaSeleccionado, true)}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    horarioDiaActual.abierto
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Abierto
                </button>
                <button
                  onClick={() => toggleDiaAbierto(diaSeleccionado, false)}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    !horarioDiaActual.abierto
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Cerrado
                </button>
              </div>
            </div>

            {/* Horarios */}
            {horarioDiaActual.abierto && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Horarios:
                </label>
                
                <div className="space-y-4">
                  {horarioDiaActual.turnos.map((turno, indice) => (
                    <div key={indice} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Turno {indice + 1}
                        </span>
                        {horarioDiaActual.turnos.length > 1 && (
                          <button
                            onClick={() => eliminarTurno(diaSeleccionado, indice)}
                            className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Eliminar
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Apertura:</label>
                          <select
                            value={turno.horaApertura}
                            onChange={(e) => actualizarTurno(diaSeleccionado, indice, { horaApertura: e.target.value })}
                            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            {opcionesHora.map(opcion => (
                              <option key={opcion.value} value={opcion.value}>
                                {opcion.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Cierre:</label>
                          <select
                            value={turno.horaCierre}
                            onChange={(e) => actualizarTurno(diaSeleccionado, indice, { horaCierre: e.target.value })}
                            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            {opcionesHora.map(opcion => (
                              <option key={opcion.value} value={opcion.value}>
                                {opcion.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => agregarTurno(diaSeleccionado)}
                    disabled={horarioDiaActual.turnos.length >= 3}
                    className={`w-full py-2 text-sm border rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      horarioDiaActual.turnos.length >= 3
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'text-orange-600 border-orange-200 hover:bg-orange-50'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    {horarioDiaActual.turnos.length >= 3 
                      ? 'Máximo 3 turnos por día'
                      : 'Agregar turno'
                    }
                  </button>
                </div>
              </div>
            )}

            {/* Copiar horarios */}
            <div className="pt-4 border-t border-gray-200">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Acciones rápidas:
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    copiarHorarios(e.target.value as DiaSemana, diaSeleccionado);
                    e.target.value = '';
                  }
                }}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                defaultValue=""
              >
                <option value="">Copiar desde otro día...</option>
                {DIAS_SEMANA.filter(dia => dia !== diaSeleccionado).map(dia => (
                  <option key={dia} value={dia}>
                    {NOMBRES_DIAS[dia]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de guardar */}
      <div className="flex justify-end">
        <button
          onClick={guardarHorarios}
          disabled={guardando || !tieneHorariosConfigurados()}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            tieneHorariosConfigurados() && !guardando
              ? 'bg-orange-600 hover:bg-orange-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {guardando ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {tieneHorariosConfigurados() ? 'Guardar Horarios' : 'Configura horarios primero'}
            </>
          )}
        </button>
      </div>

    </div>
  );
}