import React, { useState, useEffect, useRef } from 'react';
import { Loader, Save, Upload, Trash2, Pencil } from 'lucide-react';
import { Button } from '@spoon/shared';
import { InlineEditButton } from '@spoon/shared';
import { FormCard } from '@spoon/shared';
import toast from 'react-hot-toast';
import { RestaurantService } from '@spoon/shared/services/restaurant';

interface ImageUrls {
  logo_url: string;
  cover_image_url: string;
}

export default function ImagenesForm({ readOnly = false, showSave = true, onCancel, onToggleEdit }: { readOnly?: boolean; showSave?: boolean; onCancel?: () => void; onToggleEdit?: () => void }) {
  const [imageUrls, setImageUrls] = useState<ImageUrls>({ logo_url: '', cover_image_url: '' });
  const [saving, setSaving] = useState(false);
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
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      toast.error('Solo se permiten imágenes PNG o JPG');
      return;
    }
    if (file.size > (type === 'logo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024)) {
      toast.error(type === 'logo' ? 'Logo máximo 2MB' : 'Portada máximo 5MB');
      return;
    }
    // Simulación de upload (reemplaza por lógica real de subida)
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrls(prev => ({
        ...prev,
        [type === 'logo' ? 'logo_url' : 'cover_image_url']: reader.result as string
      }));
      toast.success('Imagen cargada (simulación)');
    };
    reader.readAsDataURL(file);
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
  <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-[color:var(--sp-primary-600)]" />
  <p className="text-[color:var(--sp-neutral-600)]">Cargando imágenes...</p>
      </div>
    );
  }

  return (
  <FormCard readOnly={readOnly} onToggleEdit={onToggleEdit} hideHeaderEdit>
        {/* Acción editar en línea */}
        {onToggleEdit && (
          <div className="flex justify-end mb-3">
            <InlineEditButton onClick={onToggleEdit} editing={!readOnly} label="Editar imágenes" />
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
                  <Button variant="outline" size="sm" onClick={() => setImageUrls(prev => ({ ...prev, logo_url: '' }))}>
                    Remover logo
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
        <Upload className="h-12 w-12 text-[color:var(--sp-neutral-400)] mx-auto" />
        <p className="text-sm text-[color:var(--sp-neutral-600)]">
                  Arrastra una imagen aquí o
                  {!readOnly && (
                    <Button type="button" variant="link" onClick={() => logoInputRef.current?.click()}>
                      selecciona un archivo
                    </Button>
                  )}
                </p>
        <p className="text-xs text-[color:var(--sp-neutral-500)]">PNG, JPG hasta 2MB</p>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={e => handleFileUpload(e, 'logo')}
                  disabled={readOnly}
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
                  <Button variant="outline" size="sm" onClick={() => setImageUrls(prev => ({ ...prev, cover_image_url: '' }))}>
                    Remover portada
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
        <Upload className="h-12 w-12 text-[color:var(--sp-neutral-400)] mx-auto" />
        <p className="text-sm text-[color:var(--sp-neutral-600)]">
                  Arrastra una imagen aquí o
                  {!readOnly && (
                    <Button type="button" variant="link" onClick={() => coverInputRef.current?.click()}>
                      selecciona un archivo
                    </Button>
                  )}
                </p>
        <p className="text-xs text-[color:var(--sp-neutral-500)]">PNG, JPG hasta 5MB</p>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={e => handleFileUpload(e, 'cover')}
                  disabled={readOnly}
                />
              </div>
            )}
          </div>
        </div>
        </div>
        {showSave && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button onClick={handleSave} disabled={readOnly || saving} size="sm">
              {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Guardando...' : 'Guardar Imágenes'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        )}
  </FormCard>
  );
}
