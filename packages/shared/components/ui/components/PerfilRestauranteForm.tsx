import React, { useState, useEffect, useRef } from 'react';
import { Save, Eye, EyeOff, MapPin, Phone, Mail, ChefHat } from 'lucide-react';
import { Button } from '../Button';
import { InlineEditButton } from './InlineEditButton';
import { FormCard } from './FormCard';
import { RestaurantService } from '../../../services/restaurant';
import toast from 'react-hot-toast';

// Type casting para componentes
const SaveCast = Save as any;
const EyeCast = Eye as any;
const EyeOffCast = EyeOff as any;
const MapPinCast = MapPin as any;
const PhoneCast = Phone as any;
const MailCast = Mail as any;
const ChefHatCast = ChefHat as any;
const ButtonCast = Button as any;
const InlineEditButtonCast = InlineEditButton as any;
const FormCardCast = FormCard as any;

interface PerfilRestauranteData {
  // Información general
  name: string;
  description: string;
  contact_phone: string;
  contact_email: string;
  cuisine_type: string;

  // Imágenes
  logo_url: string;
  cover_image_url: string;
}

interface PerfilRestauranteFormProps {
  readOnly?: boolean;
  showSave?: boolean;
  onCancel?: () => void;
  onToggleEdit?: () => void;
}

export function PerfilRestauranteForm({
  readOnly = false,
  showSave = true,
  onCancel,
  onToggleEdit
}: PerfilRestauranteFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<'logo' | 'cover' | null>(null);

  // Refs para inputs de archivos
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Estado combinado para todo el perfil
  const [perfilData, setPerfilData] = useState<PerfilRestauranteData>({
    name: '',
    description: '',
    contact_phone: '',
    contact_email: '',
    cuisine_type: '',
    logo_url: '',
    cover_image_url: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    async function loadPerfilData() {
      setLoading(true);
      try {
        const { data, error } = await RestaurantService.getUserRestaurant();
        if (error) throw error;

        if (data) {
          setPerfilData({
            name: data.name || '',
            description: data.description || '',
            contact_phone: data.contact_phone || '',
            contact_email: data.contact_email || '',
            cuisine_type: data.cuisine_type || '',
            logo_url: data.logo_url || '',
            cover_image_url: data.cover_image_url || ''
          });
        }
      } catch (error) {
        console.error('Error loading perfil data:', error);
        toast.error('Error cargando datos del perfil');
      } finally {
        setLoading(false);
      }
    }

    loadPerfilData();
  }, []);

  // Handlers para información general
  const handleInfoChange = (field: keyof PerfilRestauranteData, value: string) => {
    setPerfilData(prev => ({ ...prev, [field]: value }));
  };

  // Handlers para imágenes
  const handleImageUpdate = (type: 'logo' | 'cover', url: string) => {
    setPerfilData(prev => ({
      ...prev,
      [type === 'logo' ? 'logo_url' : 'cover_image_url']: url
    }));
  };

  // Handler para subir imagen
  const handleImageUpload = async (type: 'logo' | 'cover', file: File) => {
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede ser mayor a 5MB');
      return;
    }

    setUploadingImage(type);

    try {
      const { url } = await RestaurantService.uploadRestaurantImage({
        file,
        type
      });

      // Actualizar el estado con la nueva URL
      handleImageUpdate(type, url);
      toast.success(`${type === 'logo' ? 'Logo' : 'Portada'} subida correctamente`);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || `Error subiendo ${type === 'logo' ? 'logo' : 'portada'}`);
    } finally {
      setUploadingImage(null);
    }
  };

  // Handler para selección de archivo
  const handleFileSelect = (type: 'logo' | 'cover') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(type, file);
    }
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    event.target.value = '';
  };

  // Funciones para abrir los inputs de archivo
  const openLogoSelector = () => logoInputRef.current?.click();
  const openCoverSelector = () => coverInputRef.current?.click();

  // Guardar todo el perfil
  const handleSave = async () => {
    setSaving(true);
    try {
      // Guardar información general
      const { error: infoError } = await RestaurantService.updateBasicInfo({
        name: perfilData.name,
        description: perfilData.description,
        contact_phone: perfilData.contact_phone,
        contact_email: perfilData.contact_email,
        cuisine_type: perfilData.cuisine_type
      });

      if (infoError) throw infoError;

      // Guardar imágenes
      const { error: imagesError } = await RestaurantService.updateImages({
        logo_url: perfilData.logo_url,
        cover_image_url: perfilData.cover_image_url
      });

      if (imagesError) throw imagesError;

      toast.success('Perfil del restaurante actualizado correctamente');
    } catch (error) {
      console.error('Error saving perfil:', error);
      toast.error('Error actualizando el perfil del restaurante');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--sp-info-600)]"></div>
        <span className="text-[color:var(--sp-neutral-600)] ml-2">Cargando perfil...</span>
      </div>
    );
  }

  return (
    <FormCardCast readOnly={readOnly} onToggleEdit={onToggleEdit} hideHeaderEdit>
      {/* Header mejorado con gradiente y logo/portada */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[color:var(--sp-primary-600)] to-[color:var(--sp-info-600)] p-6 text-white mb-8">
        <div className="relative z-10">
          <div className="flex justify-between items-start gap-6">
            {/* Logo y información principal */}
            <div className="flex items-center gap-4 flex-1">
              <div className="relative">
                {perfilData.logo_url ? (
                  <img
                    src={perfilData.logo_url}
                    alt="Logo"
                    className="h-20 w-20 rounded-xl object-cover border-4 border-white/20 shadow-lg"
                  />
                ) : (
                  <div className="h-20 w-20 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border-4 border-white/20">
                    <span className="text-3xl">🏪</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">
                  {perfilData.name || 'Mi Restaurante'}
                </h1>
                <p className="text-white/90 text-sm mb-3">
                  Configura el perfil que verán tus clientes
                </p>

                {/* Badges con información clave */}
                <div className="flex flex-wrap items-center gap-2">
                  {perfilData.cuisine_type && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                      <ChefHatCast className="h-3 w-3" />
                      {perfilData.cuisine_type}
                    </div>
                  )}
                  {perfilData.contact_phone && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                      <PhoneCast className="h-3 w-3" />
                      {perfilData.contact_phone}
                    </div>
                  )}
                  {perfilData.contact_email && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                      <MailCast className="h-3 w-3" />
                      Email configurado
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Portada preview y acciones */}
            <div className="flex flex-col items-end gap-3">
              {perfilData.cover_image_url && (
                <div className="relative">
                  <img
                    src={perfilData.cover_image_url}
                    alt="Portada"
                    className="h-16 w-24 rounded-lg object-cover border-2 border-white/20 shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Portada</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <ButtonCast
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                >
                  {showPreview ? <EyeOffCast className="h-4 w-4" /> : <EyeCast className="h-4 w-4" />}
                  {showPreview ? 'Ocultar' : 'Vista Previa'}
                </ButtonCast>

                {onToggleEdit && (
                  <InlineEditButtonCast
                    onClick={onToggleEdit}
                    editing={!readOnly}
                    label="Editar perfil"
                    className="bg-white text-[color:var(--sp-primary-600)] hover:bg-white/90"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Vista Previa Expandida */}
      {showPreview && (
        <div className="mb-8 p-6 bg-[color:var(--sp-neutral-50)] rounded-xl border border-[color:var(--sp-neutral-200)]">
          <div className="flex items-center gap-2 mb-4">
            <EyeCast className="h-5 w-5 text-[color:var(--sp-info-600)]" />
            <h3 className="text-lg font-semibold text-[color:var(--sp-neutral-900)]">
              Vista Previa - Cómo se ve para tus clientes
            </h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[color:var(--sp-neutral-200)] overflow-hidden">
            {/* Portada en preview */}
            {perfilData.cover_image_url ? (
              <div className="relative h-48">
                <img
                  src={perfilData.cover_image_url}
                  alt="Portada"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
            ) : (
              <div className="h-24 bg-gradient-to-r from-[color:var(--sp-neutral-200)] to-[color:var(--sp-neutral-300)] flex items-center justify-center">
                <span className="text-[color:var(--sp-neutral-600)] text-sm">Sin portada configurada</span>
              </div>
            )}

            {/* Contenido del restaurante */}
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Logo en preview */}
                <div className="flex-shrink-0">
                  {perfilData.logo_url ? (
                    <img
                      src={perfilData.logo_url}
                      alt="Logo"
                      className="h-16 w-16 rounded-lg object-cover border-2 border-[color:var(--sp-neutral-200)]"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-[color:var(--sp-neutral-200)] rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🏪</span>
                    </div>
                  )}
                </div>

                {/* Información principal */}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-[color:var(--sp-neutral-900)] mb-1">
                    {perfilData.name || 'Nombre del restaurante'}
                  </h2>

                  <div className="flex items-center gap-4 text-sm text-[color:var(--sp-neutral-600)] mb-3">
                    {perfilData.cuisine_type && (
                      <span className="flex items-center gap-1">
                        <ChefHatCast className="h-4 w-4" />
                        {perfilData.cuisine_type}
                      </span>
                    )}
                    {perfilData.contact_phone && (
                      <span className="flex items-center gap-1">
                        <PhoneCast className="h-4 w-4" />
                        {perfilData.contact_phone}
                      </span>
                    )}
                  </div>

                  {perfilData.description && (
                    <p className="text-[color:var(--sp-neutral-700)] text-sm leading-relaxed">
                      {perfilData.description}
                    </p>
                  )}

                  {perfilData.contact_email && (
                    <div className="flex items-center gap-1 mt-3 text-sm text-[color:var(--sp-neutral-600)]">
                      <MailCast className="h-4 w-4" />
                      <span>{perfilData.contact_email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario organizado en secciones */}
      <div className="space-y-8">
        {/* Sección 1: Información Básica */}
        <div className="bg-white rounded-xl border border-[color:var(--sp-neutral-200)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 bg-[color:var(--sp-primary-100)] rounded-lg flex items-center justify-center">
              <span className="text-[color:var(--sp-primary-700)] font-semibold">1</span>
            </div>
            <h4 className="text-lg font-semibold text-[color:var(--sp-neutral-900)]">
              📋 Información Básica
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">
                Nombre del Restaurante *
              </label>
              <input
                type="text"
                value={perfilData.name}
                onChange={(e) => handleInfoChange('name', e.target.value)}
                disabled={readOnly}
                className="w-full px-4 py-3 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-info-500)] focus:border-transparent disabled:bg-[color:var(--sp-neutral-100)] transition-colors"
                placeholder="Ej: La Cumbre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">
                Tipo de Cocina
              </label>
              <input
                type="text"
                value={perfilData.cuisine_type}
                onChange={(e) => handleInfoChange('cuisine_type', e.target.value)}
                disabled={readOnly}
                className="w-full px-4 py-3 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-info-500)] focus:border-transparent disabled:bg-[color:var(--sp-neutral-100)] transition-colors"
                placeholder="Ej: Italiana, Colombiana, etc."
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">
              Descripción del Restaurante
            </label>
            <textarea
              value={perfilData.description}
              onChange={(e) => handleInfoChange('description', e.target.value)}
              disabled={readOnly}
              rows={4}
              className="w-full px-4 py-3 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-info-500)] focus:border-transparent disabled:bg-[color:var(--sp-neutral-100)] transition-colors resize-none"
              placeholder="Describe tu restaurante, especialidades, ambiente, horario de atención..."
            />
          </div>
        </div>

        {/* Sección 2: Información de Contacto */}
        <div className="bg-white rounded-xl border border-[color:var(--sp-neutral-200)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 bg-[color:var(--sp-success-100)] rounded-lg flex items-center justify-center">
              <span className="text-[color:var(--sp-success-700)] font-semibold">2</span>
            </div>
            <h4 className="text-lg font-semibold text-[color:var(--sp-neutral-900)]">
              📞 Información de Contacto
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">
                Teléfono *
              </label>
              <div className="relative">
                <PhoneCast className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[color:var(--sp-neutral-400)]" />
                <input
                  type="tel"
                  value={perfilData.contact_phone}
                  onChange={(e) => handleInfoChange('contact_phone', e.target.value)}
                  disabled={readOnly}
                  className="w-full pl-10 pr-4 py-3 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-info-500)] focus:border-transparent disabled:bg-[color:var(--sp-neutral-100)] transition-colors"
                  placeholder="+57 300 123 4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">
                Email *
              </label>
              <div className="relative">
                <MailCast className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[color:var(--sp-neutral-400)]" />
                <input
                  type="email"
                  value={perfilData.contact_email}
                  onChange={(e) => handleInfoChange('contact_email', e.target.value)}
                  disabled={readOnly}
                  className="w-full pl-10 pr-4 py-3 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-info-500)] focus:border-transparent disabled:bg-[color:var(--sp-neutral-100)] transition-colors"
                  placeholder="contacto@restaurante.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección 3: Imágenes del Restaurante */}
        <div className="bg-white rounded-xl border border-[color:var(--sp-neutral-200)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 bg-[color:var(--sp-warning-100)] rounded-lg flex items-center justify-center">
              <span className="text-[color:var(--sp-warning-700)] font-semibold">3</span>
            </div>
            <h4 className="text-lg font-semibold text-[color:var(--sp-neutral-900)]">
              🖼️ Imágenes del Restaurante
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-3">
                Logo del Restaurante
              </label>
              <div className="border-2 border-dashed border-[color:var(--sp-neutral-300)] rounded-xl p-6 text-center hover:border-[color:var(--sp-info-400)] transition-colors">
                {perfilData.logo_url ? (
                  <div className="space-y-4">
                    <img
                      src={perfilData.logo_url}
                      alt="Logo actual"
                      className="mx-auto h-24 w-24 object-cover rounded-xl border-4 border-[color:var(--sp-neutral-200)] shadow-md"
                    />
                    <div className="text-center">
                      <p className="text-sm font-medium text-[color:var(--sp-neutral-900)]">Logo actual</p>
                      <p className="text-xs text-[color:var(--sp-neutral-600)] mt-1">
                        Se actualiza automáticamente al guardar
                      </p>
                    </div>
                    {!readOnly && (
                      <ButtonCast
                        variant="outline"
                        size="sm"
                        onClick={() => handleImageUpdate('logo', '')}
                        className="mt-2"
                      >
                        Remover logo
                      </ButtonCast>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-4xl">📷</div>
                    <div>
                      <p className="text-sm font-medium text-[color:var(--sp-neutral-900)]">
                        Logo no configurado
                      </p>
                      <p className="text-xs text-[color:var(--sp-neutral-600)] mt-1 mb-3">
                        Sube tu logo para que aparezca en tu perfil
                      </p>
                      {!readOnly && (
                        <ButtonCast
                          variant="outline"
                          size="sm"
                          onClick={openLogoSelector}
                          disabled={uploadingImage === 'logo'}
                        >
                          {uploadingImage === 'logo' ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[color:var(--sp-info-600)] mr-2"></div>
                              Subiendo...
                            </>
                          ) : (
                            <>
                              📷 Subir Logo
                            </>
                          )}
                        </ButtonCast>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Portada */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-3">
                Imagen de Portada
              </label>
              <div className="border-2 border-dashed border-[color:var(--sp-neutral-300)] rounded-xl p-6 text-center hover:border-[color:var(--sp-info-400)] transition-colors">
                {perfilData.cover_image_url ? (
                  <div className="space-y-4">
                    <img
                      src={perfilData.cover_image_url}
                      alt="Portada actual"
                      className="mx-auto h-24 w-full object-cover rounded-xl border-4 border-[color:var(--sp-neutral-200)] shadow-md"
                    />
                    <div className="text-center">
                      <p className="text-sm font-medium text-[color:var(--sp-neutral-900)]">Portada actual</p>
                      <p className="text-xs text-[color:var(--sp-neutral-600)] mt-1">
                        Se actualiza automáticamente al guardar
                      </p>
                    </div>
                    {!readOnly && (
                      <ButtonCast
                        variant="outline"
                        size="sm"
                        onClick={() => handleImageUpdate('cover', '')}
                        className="mt-2"
                      >
                        Remover portada
                      </ButtonCast>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-4xl">🖼️</div>
                    <div>
                      <p className="text-sm font-medium text-[color:var(--sp-neutral-900)]">
                        Portada no configurada
                      </p>
                      <p className="text-xs text-[color:var(--sp-neutral-600)] mt-1 mb-3">
                        Agrega una imagen atractiva de tu restaurante
                      </p>
                      {!readOnly && (
                        <ButtonCast
                          variant="outline"
                          size="sm"
                          onClick={openCoverSelector}
                          disabled={uploadingImage === 'cover'}
                        >
                          {uploadingImage === 'cover' ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[color:var(--sp-info-600)] mr-2"></div>
                              Subiendo...
                            </>
                          ) : (
                            <>
                              🖼️ Agregar Portada
                            </>
                          )}
                        </ButtonCast>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[color:var(--sp-info-50)] border border-[color:var(--sp-info-200)] rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-[color:var(--sp-info-600)] mt-0.5">💡</div>
              <div>
                <p className="text-sm font-medium text-[color:var(--sp-info-900)]">
                  Gestión Avanzada de Imágenes
                </p>
                <p className="text-sm text-[color:var(--sp-info-700)] mt-1">
                  Para subir o cambiar imágenes, ve a la pestaña "Imágenes" donde encontrarás
                  herramientas avanzadas de carga con validaciones y preview en tiempo real.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción mejorados */}
      {showSave && (
        <div className="flex justify-end gap-3 pt-8 border-t border-[color:var(--sp-neutral-200)] mt-8">
          <ButtonCast
            onClick={handleSave}
            disabled={readOnly || saving}
            size="lg"
            className="px-8"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Guardando Cambios...
              </>
            ) : (
              <>
                <SaveCast className="h-5 w-5 mr-3" />
                Guardar Perfil Completo
              </>
            )}
          </ButtonCast>

          {onCancel && (
            <ButtonCast
              type="button"
              variant="outline"
              size="lg"
              onClick={onCancel}
              className="px-8"
            >
              Cancelar
            </ButtonCast>
          )}
        </div>
      )}

      {/* Inputs ocultos para selección de archivos */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect('logo')}
        style={{ display: 'none' }}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect('cover')}
        style={{ display: 'none' }}
      />
    </FormCardCast>
  );
}
