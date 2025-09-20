import React, { useState, useEffect, useRef } from 'react';
import { Loader, Save, Upload, Trash2, Pencil } from 'lucide-react';
import { Button } from '@spoon/shared/components/ui/Button';
import { InlineEditButton } from '@spoon/shared/components/ui/components/InlineEditButton';
import { FormCard } from '@spoon/shared/components/ui/components/FormCard';
import toast from 'react-hot-toast';
import { RestaurantService } from '@spoon/shared/services/restaurant';

// Type casting para componentes de lucide-react y @spoon/shared
const LoaderCast = Loader as any;
const SaveCast = Save as any;
const UploadCast = Upload as any;
const Trash2Cast = Trash2 as any;
const PencilCast = Pencil as any;
const ButtonCast = Button as any;
const InlineEditButtonCast = InlineEditButton as any;
const FormCardCast = FormCard as any;

interface ImageUrls {
  logo_url: string;
  cover_image_url: string;
}

export default function ImagenesForm({ readOnly = false, showSave = true, onCancel, onToggleEdit }: { readOnly?: boolean; showSave?: boolean; onCancel?: () => void; onToggleEdit?: () => void }) {
  const [imageUrls, setImageUrls] = useState<ImageUrls>({ logo_url: '', cover_image_url: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<null | 'logo' | 'cover'>(null);
  const [loading, setLoading] = useState(true);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      try {
        const { data, error } = await RestaurantService.getUserRestaurant();
        if (error) throw error;
        if (data) {
          setImageUrls({
            logo_url: data.logo_url || '',
            cover_image_url: data.cover_image_url || ''
          });
        }
      } catch (error) {
        toast.error('Error cargando imágenes');
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validaciones básicas lato-UI (el servicio también valida)
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Solo se permiten imágenes PNG, JPG o WebP');
      return;
    }
    const maxSize = type === 'logo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 2MB logo, 5MB portada
    if (file.size > maxSize) {
      toast.error(type === 'logo' ? 'Logo máximo 2MB' : 'Portada máximo 5MB');
      return;
    }

    try {
      setUploading(type);
      const { url } = await RestaurantService.uploadRestaurantImage({ file, type });
      setImageUrls(prev => ({
        ...prev,
        [type === 'logo' ? 'logo_url' : 'cover_image_url']: url
      }));
      toast.success('Imagen subida correctamente');
    } catch (err) {
      console.error(err);
      toast.error('Error subiendo la imagen');
    } finally {
      setUploading(null);
      // Limpia el input para permitir volver a subir el mismo archivo si se desea
      if (type === 'logo') logoInputRef.current && (logoInputRef.current.value = '');
      if (type === 'cover') coverInputRef.current && (coverInputRef.current.value = '');
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { data, error } = await RestaurantService.updateImages(imageUrls);
      if (error) throw error;
      toast.success('Imágenes guardadas');
    } catch (error) {
      toast.error('Error guardando imágenes');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
  <LoaderCast className="h-8 w-8 animate-spin mx-auto mb-4 text-[color:var(--sp-primary-600)]" />
  <p className="text-[color:var(--sp-neutral-600)]">Cargando imágenes...</p>
      </div>
    );
  }

  return (
  <FormCardCast readOnly={readOnly} onToggleEdit={onToggleEdit} hideHeaderEdit>
        {/* Acción editar en línea */}
        {onToggleEdit && (
          <div className="flex justify-end mb-3">
            <InlineEditButtonCast onClick={onToggleEdit} editing={!readOnly} label="Editar imágenes" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo */}
        <div>
      <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">Logo del Restaurante</label>
      <div className="border-2 border-dashed border-[color:var(--sp-neutral-300)] rounded-lg p-6 text-center">
            {imageUrls.logo_url ? (
              <div className="space-y-4">
                <img src={imageUrls.logo_url} alt="Logo actual" className="mx-auto h-32 w-32 object-cover rounded-lg" />
        <p className="text-sm text-[color:var(--sp-neutral-600)]">Logo actual</p>
                {!readOnly && (
                  <ButtonCast variant="outline" size="sm" onClick={() => setImageUrls(prev => ({ ...prev, logo_url: '' }))}>
                    Remover logo
                  </ButtonCast>
                )}
              </div>
            ) : (
              <div className="space-y-2">
        <UploadCast className="h-12 w-12 text-[color:var(--sp-neutral-400)] mx-auto" />
        <p className="text-sm text-[color:var(--sp-neutral-600)]">
                  Arrastra una imagen aquí o
                  {!readOnly && (
                    <ButtonCast type="button" variant="link" onClick={() => logoInputRef.current?.click()}>
                      selecciona un archivo
                    </ButtonCast>
                  )}
                </p>
        <p className="text-xs text-[color:var(--sp-neutral-500)]">PNG, JPG hasta 2MB</p>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={e => handleFileUpload(e, 'logo')}
                  disabled={readOnly || uploading === 'logo'}
                />
              </div>
            )}
          </div>
        </div>
        {/* Portada */}
        <div>
      <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">Imagen de Portada</label>
      <div className="border-2 border-dashed border-[color:var(--sp-neutral-300)] rounded-lg p-6 text-center">
            {imageUrls.cover_image_url ? (
              <div className="space-y-4">
                <img src={imageUrls.cover_image_url} alt="Portada actual" className="mx-auto h-32 w-full object-cover rounded-lg" />
        <p className="text-sm text-[color:var(--sp-neutral-600)]">Portada actual</p>
                {!readOnly && (
                  <ButtonCast variant="outline" size="sm" onClick={() => setImageUrls(prev => ({ ...prev, cover_image_url: '' }))}>
                    Remover portada
                  </ButtonCast>
                )}
              </div>
            ) : (
              <div className="space-y-2">
        <UploadCast className="h-12 w-12 text-[color:var(--sp-neutral-400)] mx-auto" />
        <p className="text-sm text-[color:var(--sp-neutral-600)]">
                  Arrastra una imagen aquí o
                  {!readOnly && (
                    <ButtonCast type="button" variant="link" onClick={() => coverInputRef.current?.click()}>
                      selecciona un archivo
                    </ButtonCast>
                  )}
                </p>
        <p className="text-xs text-[color:var(--sp-neutral-500)]">PNG, JPG hasta 5MB</p>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={e => handleFileUpload(e, 'cover')}
                  disabled={readOnly || uploading === 'cover'}
                />
              </div>
            )}
          </div>
        </div>
        </div>
        {showSave && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            <ButtonCast onClick={handleSave} disabled={readOnly || saving} size="sm">
              {saving ? <LoaderCast className="h-4 w-4 animate-spin" /> : <SaveCast className="h-4 w-4" />}
              {saving ? 'Guardando...' : 'Guardar Imágenes'}
            </ButtonCast>
            {onCancel && (
              <ButtonCast type="button" variant="outline" size="sm" onClick={onCancel}>
                Cancelar
              </ButtonCast>
            )}
          </div>
        )}
  </FormCardCast>
  );
}
