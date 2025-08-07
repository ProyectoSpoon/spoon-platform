// apps/web/src/app/config-restaurante/logo-portada/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Upload, X, Image as ImageIcon } from 'lucide-react';
import { getUserProfile, getUserRestaurant, updateRestaurant } from '@spoon/shared';
import toast from 'react-hot-toast';

// Tipos
interface ArchivoImagen {
  archivo: File | null;
  previewUrl: string | null;
  estado: 'pendiente' | 'cargando' | 'completado' | 'error';
  error?: string;
}

const estadoInicial: ArchivoImagen = {
  archivo: null,
  previewUrl: null,
  estado: 'pendiente',
  error: undefined
};

export default function LogoPortadaPage() {
  const router = useRouter();
  const [logo, setLogo] = useState<ArchivoImagen>(estadoInicial);
  const [portada, setPortada] = useState<ArchivoImagen>(estadoInicial);
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  // Cargar datos existentes
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const profile = await getUserProfile();
        const restaurant = await getUserRestaurant();
        
        if (profile) {
          setUserInfo(profile);
        }
        
        if (restaurant) {
          setRestaurantId(restaurant.id);
          
          // Cargar imágenes existentes si las hay
          if (restaurant.logo_url) {
            setLogo({
              archivo: null,
              previewUrl: restaurant.logo_url,
              estado: 'completado'
            });
          }
          
          if (restaurant.cover_image_url) {
            setPortada({
              archivo: null,
              previewUrl: restaurant.cover_image_url,
              estado: 'completado'
            });
          }
          
          console.log('✅ Datos cargados:', {
            restaurantId: restaurant.id,
            logoExistente: !!restaurant.logo_url,
            portadaExistente: !!restaurant.cover_image_url
          });
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

  // Validar archivo de imagen
  const validarArchivo = (archivo: File): string | null => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg'];
    const tamañoMaximo = 5 * 1024 * 1024; // 5MB

    if (!tiposPermitidos.includes(archivo.type)) {
      return 'Solo se permiten archivos JPG, JPEG y PNG';
    }

    if (archivo.size > tamañoMaximo) {
      return 'El archivo no puede superar los 5MB';
    }

    return null;
  };

  // Manejar cambio de logo
  const manejarCambioLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const error = validarArchivo(archivo);
    if (error) {
      toast.error(error);
      return;
    }

    const url = URL.createObjectURL(archivo);
    setLogo({
      archivo,
      previewUrl: url,
      estado: 'completado'
    });
    
    toast.success('Logo cargado correctamente');
  };

  // Manejar cambio de portada
  const manejarCambioPortada = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const error = validarArchivo(archivo);
    if (error) {
      toast.error(error);
      return;
    }

    const url = URL.createObjectURL(archivo);
    setPortada({
      archivo,
      previewUrl: url,
      estado: 'completado'
    });
    
    toast.success('Portada cargada correctamente');
  };

  // Eliminar imagen
  const eliminarImagen = (tipo: 'logo' | 'portada') => {
    if (tipo === 'logo') {
      if (logo.previewUrl) {
        URL.revokeObjectURL(logo.previewUrl);
      }
      setLogo(estadoInicial);
    } else {
      if (portada.previewUrl) {
        URL.revokeObjectURL(portada.previewUrl);
      }
      setPortada(estadoInicial);
    }
    
    toast.success(`${tipo === 'logo' ? 'Logo' : 'Portada'} eliminado`);
  };

  // Simular subida de imagen (placeholder para API real)
  const subirImagen = async (archivo: File, tipo: 'logo' | 'cover'): Promise<string> => {
    // TODO: Implementar API real de subida de archivos
    // Por ahora, simular un delay y devolver una URL temporal
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simular delay
    
    // En un caso real, aquí subirías a Supabase Storage o CloudFront
    const fakeUrl = `https://fake-cdn.spoon.com/${tipo}/${Date.now()}_${archivo.name}`;
    
    console.log(`📤 ${tipo} "subido" (simulado):`, fakeUrl);
    return fakeUrl;
  };

  // Verificar si la configuración está completa
  const configuracionCompleta = (): boolean => {
    return logo.estado === 'completado' && portada.estado === 'completado';
  };

  // Guardar imágenes
  const guardarImagenes = async (finalizar: boolean = false) => {
    if (!restaurantId) {
      toast.error('No se encontró información del restaurante');
      return;
    }

    try {
      setEstaEnviando(true);
      
      let logoUrl = logo.previewUrl;
      let portadaUrl = portada.previewUrl;
      
      // Subir logo si hay archivo nuevo
      if (logo.archivo) {
        setLogo(prev => ({ ...prev, estado: 'cargando' }));
        try {
          logoUrl = await subirImagen(logo.archivo, 'logo');
          setLogo(prev => ({ 
            ...prev, 
            previewUrl: logoUrl, 
            estado: 'completado' 
          }));
          console.log('✅ Logo guardado:', logoUrl);
        } catch (error) {
          console.error('❌ Error subiendo logo:', error);
          setLogo(prev => ({ 
            ...prev, 
            estado: 'error', 
            error: 'Error al subir logo' 
          }));
          throw error;
        }
      }

      // Subir portada si hay archivo nuevo
      if (portada.archivo) {
        setPortada(prev => ({ ...prev, estado: 'cargando' }));
        try {
          portadaUrl = await subirImagen(portada.archivo, 'cover');
          setPortada(prev => ({ 
            ...prev, 
            previewUrl: portadaUrl, 
            estado: 'completado' 
          }));
          console.log('✅ Portada guardada:', portadaUrl);
        } catch (error) {
          console.error('❌ Error subiendo portada:', error);
          setPortada(prev => ({ 
            ...prev, 
            estado: 'error', 
            error: 'Error al subir portada' 
          }));
          throw error;
        }
      }
      
      // Actualizar base de datos
      await updateRestaurant(restaurantId, {
        logo_url: logoUrl,
        cover_image_url: portadaUrl
      });
      
      if (finalizar) {
        toast.success('¡Configuración completada! Redirigiendo al dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        toast.success('Progreso guardado correctamente');
      }
      
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      toast.error('No se pudo guardar. Intenta nuevamente.');
    } finally {
      setEstaEnviando(false);
    }
  };

  // Manejadores de navegación
  const handleVolver = () => {
    router.push('/config-restaurante/horario-comercial');
  };

  const handleContinuar = () => {
    router.push('/dashboard');
  };

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
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleVolver}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            
            <div className="text-center flex-1">
              <span className="text-sm text-gray-500 font-medium">Paso 4 de 4</span>
            </div>
            
            <div className="w-20"></div>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Logo y Portada
            </h1>
            <p className="text-gray-600">
              Personaliza la imagen de tu restaurante
            </p>
            {userInfo && (
              <p className="text-sm text-gray-500 mt-2">
                👤 {userInfo.email} | 🏪 ID: {restaurantId?.slice(0, 8)}...
              </p>
            )}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Logo */}
          <div className="bg-white p-6 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Logo del Restaurante</h3>
            
            <div className="space-y-4">
              {/* Preview del logo */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {logo.previewUrl ? (
                  <div className="relative">
                    <img
                      src={logo.previewUrl}
                      alt="Logo preview"
                      className="max-w-full max-h-40 mx-auto rounded-lg shadow-sm"
                    />
                    <button
                      onClick={() => eliminarImagen('logo')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4" />
                    <p>No hay logo seleccionado</p>
                  </div>
                )}
              </div>
              
              {/* Estado de carga */}
              {logo.estado === 'cargando' && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mr-3"></div>
                  <span className="text-gray-600">Subiendo logo...</span>
                </div>
              )}
              
              {logo.estado === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {logo.error}
                </div>
              )}
              
              {/* Input de archivo */}
              <div>
                <label className="block w-full">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={manejarCambioLogo}
                    className="hidden"
                    disabled={estaEnviando}
                  />
                  <div className="cursor-pointer bg-orange-50 border border-orange-200 rounded-lg p-4 text-center hover:bg-orange-100 transition-colors">
                    <Upload className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <span className="text-orange-700 font-medium">
                      Seleccionar logo
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG hasta 5MB
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Portada */}
          <div className="bg-white p-6 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Imagen de Portada</h3>
            
            <div className="space-y-4">
              {/* Preview de la portada */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {portada.previewUrl ? (
                  <div className="relative">
                    <img
                      src={portada.previewUrl}
                      alt="Portada preview"
                      className="max-w-full max-h-40 mx-auto rounded-lg shadow-sm object-cover"
                    />
                    <button
                      onClick={() => eliminarImagen('portada')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4" />
                    <p>No hay portada seleccionada</p>
                  </div>
                )}
              </div>
              
              {/* Estado de carga */}
              {portada.estado === 'cargando' && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mr-3"></div>
                  <span className="text-gray-600">Subiendo portada...</span>
                </div>
              )}
              
              {portada.estado === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {portada.error}
                </div>
              )}
              
              {/* Input de archivo */}
              <div>
                <label className="block w-full">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={manejarCambioPortada}
                    className="hidden"
                    disabled={estaEnviando}
                  />
                  <div className="cursor-pointer bg-orange-50 border border-orange-200 rounded-lg p-4 text-center hover:bg-orange-100 transition-colors">
                    <Upload className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <span className="text-orange-700 font-medium">
                      Seleccionar portada
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG hasta 5MB
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Vista previa conjunta */}
        {(logo.previewUrl || portada.previewUrl) && (
          <div className="bg-white p-6 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vista Previa</h3>
            
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="text-center">
                {logo.previewUrl && (
                  <img
                    src={logo.previewUrl}
                    alt="Logo"
                    className="h-16 w-auto mx-auto mb-4 rounded"
                  />
                )}
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {userInfo?.first_name && userInfo?.last_name 
                    ? `Restaurante de ${userInfo.first_name} ${userInfo.last_name}`
                    : 'Nombre del Restaurante'
                  }
                </h2>
                {portada.previewUrl && (
                  <img
                    src={portada.previewUrl}
                    alt="Portada"
                    className="w-full h-32 object-cover rounded-lg mt-4"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <button
              onClick={handleVolver}
              className="flex items-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Horarios
            </button>

            <div className="flex gap-4">
              {/* Botón Guardar Progreso */}
              <button
                onClick={() => guardarImagenes(false)}
                disabled={estaEnviando || (!logo.previewUrl && !portada.previewUrl)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  (logo.previewUrl || portada.previewUrl) && !estaEnviando
                    ? 'text-blue-600 border-blue-200 hover:bg-blue-50'
                    : 'text-gray-400 border-gray-200 cursor-not-allowed'
                }`}
              >
                {estaEnviando ? 'Guardando...' : 'Guardar Progreso'}
              </button>

              {/* Botón Finalizar */}
              <button
                onClick={() => guardarImagenes(true)}
                disabled={estaEnviando || !configuracionCompleta()}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                  configuracionCompleta() && !estaEnviando
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                {estaEnviando ? 'Finalizando...' : 'Finalizar Configuración'}
              </button>
            </div>
          </div>
        </div>

        {/* Estado de configuración */}
        {configuracionCompleta() && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Check className="text-green-600 w-5 h-5" />
              <div>
                <h3 className="font-bold text-green-800">¡Configuración Lista!</h3>
                <p className="text-sm text-green-700">
                  Has completado todos los pasos necesarios. Las imágenes están listas para guardarse.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info de ayuda */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ImageIcon className="text-blue-600 w-5 h-5" />
            <div>
              <h3 className="font-bold text-blue-800">Recomendaciones</h3>
              <p className="text-sm text-blue-700">
                <strong>Logo:</strong> Imagen cuadrada, mínimo 200x200px, fondo transparente o blanco.
              </p>
              <p className="text-sm text-blue-700">
                <strong>Portada:</strong> Imagen horizontal 16:9, mínimo 800x450px, que represente tu restaurante.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}