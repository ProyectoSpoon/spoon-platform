// apps/web/src/app/config-restaurante/logo-portada/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Upload, X, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { getUserProfile, getUserRestaurant, updateRestaurant, supabase } from '@spoon/shared/lib/supabase';
import { RestaurantService } from '@spoon/shared/services/restaurant';
import { Button } from '@spoon/shared/components/ui/Button';
import { Card } from '@spoon/shared/components/ui/Card';
import { CardContent } from '@spoon/shared/components/ui/Card';
import { CardHeader } from '@spoon/shared/components/ui/Card';
import { CardTitle } from '@spoon/shared/components/ui/Card';
import { toast } from '@spoon/shared/components/ui/Toast';

// Type casting to resolve React version conflicts
const ButtonComponent = Button as any;
const CardComponent = Card as any;
const CardContentComponent = CardContent as any;
const CardHeaderComponent = CardHeader as any;
const CardTitleComponent = CardTitle as any;

interface ArchivoImagen {
  archivo: File | null;
  previewUrl: string | null;
  estado: 'pendiente' | 'cargando' | 'completado' | 'error';
  error?: string;
  url?: string | null;
}

interface ImagenesData {
  logo: ArchivoImagen;
  portada: ArchivoImagen;
}

const PLACEHOLDER_HOSTS = ['fake-cdn.spoon.com'];

export default function LogoPortadaPage() {
  const router = useRouter();
  const [imagenes, setImagenes] = useState<ImagenesData>({
    logo: { archivo: null, previewUrl: null, estado: 'pendiente' },
    portada: { archivo: null, previewUrl: null, estado: 'pendiente' }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantData, setRestaurantData] = useState<any>(null);

  // Validación de archivos
  const validarArchivo = useCallback((archivo: File): string | null => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const tamañoMaximo = 5 * 1024 * 1024; // 5MB

    if (!tiposPermitidos.includes(archivo.type)) {
      return 'Solo se permiten archivos JPG, JPEG, PNG y WebP';
    }

    if (archivo.size > tamañoMaximo) {
      return 'El archivo no puede superar los 5MB';
    }

    return null;
  }, []);

  // Subir imagen a Supabase Storage
  const subirImagen = useCallback(async (archivo: File, tipo: 'logo' | 'portada'): Promise<string> => {
    try {
      // Map 'portada' to service type 'cover'
      const mappedType = tipo === 'portada' ? 'cover' : 'logo';
      const { url } = await RestaurantService.uploadRestaurantImage({ file: archivo, type: mappedType as 'logo' | 'cover', restaurantId: restaurantId || undefined });
      return url;
    } catch (error) {
      console.error(`Error subiendo ${tipo}:`, error);
      throw new Error(`No se pudo subir la imagen de ${tipo}`);
    }
  }, [restaurantId]);

  // Cargar datos existentes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [profile, restaurant] = await Promise.all([
          getUserProfile(),
          getUserRestaurant()
        ]);

        if (profile) setUserInfo(profile);
        if (restaurant) {
          setRestaurantId(restaurant.id);
          setRestaurantData(restaurant);

          // Pre-cargar imágenes existentes
          if (restaurant.logo_url) {
            let shouldUse = true;
            try {
              const u = new URL(restaurant.logo_url);
              if (PLACEHOLDER_HOSTS.includes(u.host)) shouldUse = false; // Ignorar URLs placeholder antiguas
            } catch {}
            if (shouldUse) {
            setImagenes(prev => ({
              ...prev,
              logo: {
                archivo: null,
                previewUrl: restaurant.logo_url,
                estado: 'completado',
                url: restaurant.logo_url
              }
            }));
            }
          }

          if (restaurant.cover_image_url) {
            let shouldUse = true;
            try {
              const u = new URL(restaurant.cover_image_url);
              if (PLACEHOLDER_HOSTS.includes(u.host)) shouldUse = false;
            } catch {}
            if (shouldUse) {
            setImagenes(prev => ({
              ...prev,
              portada: {
                archivo: null,
                previewUrl: restaurant.cover_image_url,
                estado: 'completado',
                url: restaurant.cover_image_url
              }
            }));
            }
          }
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast.error('Error al cargar la información');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Limpiar URLs de objeto al desmontar
  useEffect(() => {
    return () => {
      if (imagenes.logo.previewUrl && imagenes.logo.archivo) {
        URL.revokeObjectURL(imagenes.logo.previewUrl);
      }
      if (imagenes.portada.previewUrl && imagenes.portada.archivo) {
        URL.revokeObjectURL(imagenes.portada.previewUrl);
      }
    };
  }, [imagenes.logo, imagenes.portada]);

  // Manejar cambio de archivo
  const manejarCambioArchivo = useCallback((tipo: 'logo' | 'portada', archivo: File | null) => {
    setImagenes(prev => {
      const imagenActual = prev[tipo];

      // Limpiar URL anterior si existe
      if (imagenActual.previewUrl && imagenActual.archivo) {
        URL.revokeObjectURL(imagenActual.previewUrl);
      }

      if (!archivo) {
        return {
          ...prev,
          [tipo]: { archivo: null, previewUrl: null, estado: 'pendiente' }
        };
      }

      const error = validarArchivo(archivo);
      if (error) {
        toast.error(error);
        return prev;
      }

      const previewUrl = URL.createObjectURL(archivo);

      return {
        ...prev,
        [tipo]: {
          archivo,
          previewUrl,
          estado: 'completado' as const,
          error: undefined
        }
      };
    });
  }, [validarArchivo]);

  // Eliminar imagen
  const eliminarImagen = useCallback((tipo: 'logo' | 'portada') => {
    setImagenes(prev => {
      const imagenActual = prev[tipo];

      // Limpiar URL de objeto si existe
      if (imagenActual.previewUrl && imagenActual.archivo) {
        URL.revokeObjectURL(imagenActual.previewUrl);
      }

      return {
        ...prev,
        [tipo]: { archivo: null, previewUrl: null, estado: 'pendiente' }
      };
    });
  }, []);

  // Guardar imágenes y completar configuración
  const handleSave = async () => {
    if (!restaurantId) {
      toast.error('No se encontró información del restaurante');
      return;
    }

    try {
      setSaving(true);

      let logoUrl = restaurantData?.logo_url || null;
      let portadaUrl = restaurantData?.cover_image_url || null;

      // Subir logo si hay archivo nuevo
      if (imagenes.logo.archivo && imagenes.logo.estado === 'completado') {
        try {
          setImagenes(prev => ({
            ...prev,
            logo: { ...prev.logo, estado: 'cargando' }
          }));

          logoUrl = await subirImagen(imagenes.logo.archivo, 'logo');

          setImagenes(prev => ({
            ...prev,
            logo: { ...prev.logo, estado: 'completado', url: logoUrl }
          }));
        } catch (error) {
          setImagenes(prev => ({
            ...prev,
            logo: { ...prev.logo, estado: 'error', error: 'Error al subir logo' }
          }));
          throw error;
        }
      }

      // Subir portada si hay archivo nuevo
      if (imagenes.portada.archivo && imagenes.portada.estado === 'completado') {
        try {
          setImagenes(prev => ({
            ...prev,
            portada: { ...prev.portada, estado: 'cargando' }
          }));

          portadaUrl = await subirImagen(imagenes.portada.archivo, 'portada');

          setImagenes(prev => ({
            ...prev,
            portada: { ...prev.portada, estado: 'completado', url: portadaUrl }
          }));
        } catch (error) {
          setImagenes(prev => ({
            ...prev,
            portada: { ...prev.portada, estado: 'error', error: 'Error al subir portada' }
          }));
          throw error;
        }
      }

      // Actualizar restaurante con URLs y completar configuración
      await updateRestaurant(restaurantId, {
        logo_url: logoUrl,
        cover_image_url: portadaUrl,
        setup_step: 4,
        setup_completed: true,
        status: 'active',
        updated_at: new Date().toISOString()
      });

      toast.success('🎉 ¡Configuración completada! Tu restaurante está listo');

      // Redirigir al dashboard después de un breve delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error guardando imágenes:', error);
      toast.error('Error al guardar las imágenes. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/config-restaurante/horario-comercial');
  };

  // Verificar si hay al menos una imagen (opcional pero recomendado)
  const tieneImagenes = imagenes.logo.estado === 'completado' || imagenes.portada.estado === 'completado';

  if (loading) {
    return (
      <div className="min-h-screen bg-[--sp-surface] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--sp-primary-600)] mx-auto mb-4"></div>
          <p className="text-[color:var(--sp-neutral-600)]">Cargando configuración de imágenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--sp-surface] p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <CardComponent>
          <CardHeaderComponent>
            <div className="flex items-center justify-between mb-4">
              <ButtonComponent
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </ButtonComponent>

              <div className="text-center flex-1">
                <span className="text-sm text-[color:var(--sp-neutral-500)] font-medium">Paso 4 de 4</span>
              </div>

              <div className="w-20"></div>
            </div>

            <CardTitleComponent>
              Logo y Portada
            </CardTitleComponent>
            <p className="text-[color:var(--sp-neutral-600)]">
              Sube imágenes representativas de tu restaurante
            </p>
            {userInfo && (
              <p className="text-xs text-[color:var(--sp-info-600)] mt-2">
                👤 {userInfo.email} • {restaurantId ? `ID: ${restaurantId.slice(0, 8)}...` : "Configurando..."}
              </p>
            )}
          </CardHeaderComponent>
        </CardComponent>

        {/* Vista previa combinada */}
        <CardComponent>
          <CardContentComponent>
            <h3 className="text-lg font-medium text-[color:var(--sp-neutral-900)] mb-4">Vista previa de tu perfil</h3>
            <div className="relative">
              {/* Portada */}
              <div className="h-48 bg-gradient-to-r from-[color:var(--sp-primary-100)] to-[color:var(--sp-secondary-100)] rounded-lg overflow-hidden relative">
                {imagenes.portada.previewUrl ? (
                  <img
                    src={imagenes.portada.previewUrl}
                    alt="Portada del restaurante"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-[color:var(--sp-neutral-400)]">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Portada del restaurante</p>
                    </div>
                  </div>
                )}

                {/* Logo superpuesto */}
                <div className="absolute bottom-4 left-4">
                  <div className="w-16 h-16 bg-[--sp-surface] rounded-full p-1 shadow-lg">
                    {imagenes.logo.previewUrl ? (
                      <img
                        src={imagenes.logo.previewUrl}
                        alt="Logo del restaurante"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[color:var(--sp-neutral-200)] rounded-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-[color:var(--sp-neutral-400)]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Información del restaurante */}
              <div className="mt-4 p-4 bg-[--sp-surface] rounded-lg">
                <h4 className="font-semibold text-[color:var(--sp-neutral-900)]">
                  {restaurantData?.name || 'Nombre del restaurante'}
                </h4>
                <p className="text-sm text-[color:var(--sp-neutral-600)] mt-1">
                  {restaurantData?.description || 'Descripción del restaurante aparecerá aquí'}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-[color:var(--sp-neutral-500)]">
                  <span>📍 {restaurantData?.address || 'Dirección'}</span>
                  <span>📞 {restaurantData?.contact_phone || 'Teléfono'}</span>
                </div>
              </div>
            </div>
          </CardContentComponent>
        </CardComponent>

        {/* Upload de imágenes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Logo */}
          <CardComponent>
            <CardContentComponent>
              <h3 className="text-lg font-medium text-[color:var(--sp-neutral-900)] mb-4">Logo del Restaurante</h3>

              {/* Preview del logo */}
              <div className="mb-4">
                <div className="w-32 h-32 mx-auto border-2 border-dashed border-[color:var(--sp-neutral-300)] rounded-lg overflow-hidden relative">
                  {imagenes.logo.previewUrl ? (
                    <>
                      <img
                        src={imagenes.logo.previewUrl}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => eliminarImagen('logo')}
                        className="absolute top-1 right-1 w-6 h-6 bg-[color:var(--sp-error-500)] text-[--sp-on-error] rounded-full flex items-center justify-center hover:bg-[color:var(--sp-error-600)] transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-[color:var(--sp-neutral-400)]">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs">Sin logo</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input de archivo */}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => manejarCambioArchivo('logo', e.target.files?.[0] || null)}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="flex items-center justify-center w-full p-3 border-2 border-dashed border-[color:var(--sp-primary-300)] rounded-lg cursor-pointer hover:border-[color:var(--sp-primary-400)] transition-colors"
                >
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-[color:var(--sp-primary-600)] mx-auto mb-2" />
                    <p className="text-sm text-[color:var(--sp-primary-700)]">
                      {imagenes.logo.archivo ? 'Cambiar logo' : 'Seleccionar logo'}
                    </p>
                    <p className="text-xs text-[color:var(--sp-neutral-500)] mt-1">
                      JPG, PNG, WebP • Máx 5MB
                    </p>
                  </div>
                </label>
              </div>

              {/* Estado de carga/error */}
              {imagenes.logo.estado === 'cargando' && (
                <div className="mt-2 p-2 bg-[color:var(--sp-info-50)] border border-[color:var(--sp-info-200)] rounded text-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[color:var(--sp-info-600)] mx-auto mb-1"></div>
                  <p className="text-xs text-[color:var(--sp-info-700)]">Subiendo logo...</p>
                </div>
              )}

              {imagenes.logo.error && (
                <div className="mt-2 p-2 bg-[color:var(--sp-error-50)] border border-[color:var(--sp-error-200)] rounded">
                  <p className="text-xs text-[color:var(--sp-error-700)] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {imagenes.logo.error}
                  </p>
                </div>
              )}
            </CardContentComponent>
          </CardComponent>

          {/* Portada */}
          <CardComponent>
            <CardContentComponent>
              <h3 className="text-lg font-medium text-[color:var(--sp-neutral-900)] mb-4">Imagen de Portada</h3>

              {/* Preview de la portada */}
              <div className="mb-4">
                <div className="aspect-video w-full border-2 border-dashed border-[color:var(--sp-neutral-300)] rounded-lg overflow-hidden relative">
                  {imagenes.portada.previewUrl ? (
                    <>
                      <img
                        src={imagenes.portada.previewUrl}
                        alt="Portada preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => eliminarImagen('portada')}
                        className="absolute top-2 right-2 w-6 h-6 bg-[color:var(--sp-error-500)] text-[--sp-on-error] rounded-full flex items-center justify-center hover:bg-[color:var(--sp-error-600)] transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-[color:var(--sp-neutral-400)]">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">Sin portada</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input de archivo */}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => manejarCambioArchivo('portada', e.target.files?.[0] || null)}
                  className="hidden"
                  id="portada-upload"
                />
                <label
                  htmlFor="portada-upload"
                  className="flex items-center justify-center w-full p-3 border-2 border-dashed border-[color:var(--sp-secondary-300)] rounded-lg cursor-pointer hover:border-[color:var(--sp-secondary-400)] transition-colors"
                >
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-[color:var(--sp-secondary-600)] mx-auto mb-2" />
                    <p className="text-sm text-[color:var(--sp-secondary-700)]">
                      {imagenes.portada.archivo ? 'Cambiar portada' : 'Seleccionar portada'}
                    </p>
                    <p className="text-xs text-[color:var(--sp-neutral-500)] mt-1">
                      JPG, PNG, WebP • Máx 5MB
                    </p>
                  </div>
                </label>
              </div>

              {/* Estado de carga/error */}
              {imagenes.portada.estado === 'cargando' && (
                <div className="mt-2 p-2 bg-[color:var(--sp-info-50)] border border-[color:var(--sp-info-200)] rounded text-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[color:var(--sp-info-600)] mx-auto mb-1"></div>
                  <p className="text-xs text-[color:var(--sp-info-700)]">Subiendo portada...</p>
                </div>
              )}

              {imagenes.portada.error && (
                <div className="mt-2 p-2 bg-[color:var(--sp-error-50)] border border-[color:var(--sp-error-200)] rounded">
                  <p className="text-xs text-[color:var(--sp-error-700)] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {imagenes.portada.error}
                  </p>
                </div>
              )}
            </CardContentComponent>
          </CardComponent>
        </div>

        {/* Botones de navegación */}
        <CardComponent>
          <CardContentComponent>
            <div className="flex justify-between items-center">
              <ButtonComponent
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
                disabled={saving}
              >
                <ArrowLeft className="w-4 h-4" />
                Horarios
              </ButtonComponent>

              <ButtonComponent
                onClick={handleSave}
                disabled={saving}
                variant="success"
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[--sp-on-success]"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Completar Configuración
                  </>
                )}
              </ButtonComponent>
            </div>

            {!tieneImagenes && (
              <div className="mt-3 p-3 bg-[color:var(--sp-info-50)] border border-[color:var(--sp-info-200)] rounded-lg">
                <p className="text-sm text-[color:var(--sp-info-700)]">
                  💡 <strong>Recomendación:</strong> Sube al menos una imagen para que tu restaurante se vea más atractivo para los clientes.
                </p>
              </div>
            )}
          </CardContentComponent>
        </CardComponent>

        {/* Información final */}
        <CardComponent className="bg-[color:var(--sp-success-50)] border-[color:var(--sp-success-200)]">
          <CardContentComponent>
            <div className="flex items-center gap-3">
              <Check className="text-[color:var(--sp-success-600)] w-6 h-6" />
              <div>
                <h3 className="font-bold text-[color:var(--sp-success-800)]">¡Último paso!</h3>
                <p className="text-sm text-[color:var(--sp-success-700)]">
                  Al guardar, completarás la configuración y podrás empezar a usar SPOON con tu restaurante.
                </p>
              </div>
            </div>
          </CardContentComponent>
        </CardComponent>
      </div>
    </div>
  );
}
