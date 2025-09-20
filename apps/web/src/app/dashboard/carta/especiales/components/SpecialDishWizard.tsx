// ========================================
// WIZARD PARA CREAR PLATO ESPECIAL (4 PASOS)
// File: apps/web/src/app/dashboard/carta/especiales/components/SpecialDishWizard.tsx
// ========================================

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useNotification } from '@spoon/shared/Context/notification-provider';
import { supabase } from '@spoon/shared/lib/supabase';
import { uploadSpecialDishImage } from '@spoon/shared/services/specials';
// Reemplazamos íconos lucide-react por emojis para evitar conflictos de tipos temporales
// import { X, ArrowLeft, ArrowRight, Check, Search } from 'lucide-react';
import type { Producto } from '@spoon/shared/types/menu-dia/menuTypes';

// Props del wizard
export interface SpecialDishWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: SpecialDishData) => Promise<void> | void;
  loadProductsForCategory: (categoryId: string) => Promise<void>;
  availableProducts: { [categoryId: string]: Producto[] };
  loadingProducts?: boolean;
  // Futuro: existingSpecial para edición con wizard (por ahora sólo creación)
  existingSpecial?: SpecialDishData | null;
}

// Datos que retornamos al completar
export interface SpecialDishData {
  id?: string;
  name: string;
  description: string;
  price: number;
  selectedProducts: { [categoryId: string]: Producto[] };
  image?: string;
  imageAlt?: string;
}

// Pasos fijos
const WIZARD_STEPS = [
  { id: 'basics', name: 'Básicos', icon: '📝' },
  { id: 'products', name: 'Productos', icon: '🛒' },
  { id: 'preview', name: 'Vista Previa', icon: '👁️' },
  { id: 'confirm', name: 'Confirmar', icon: '✅' }
];

// Categorías reutilizando las de menú del día (ids deben existir en constants)
const PRODUCT_CATEGORIES = [
  { id: 'entradas', name: 'Entradas', icon: '🥗', badgeClass: 'text-emerald-600', activeClass: 'border-emerald-500 bg-emerald-50' },
  { id: 'principios', name: 'Principios', icon: '🍽️', badgeClass: 'text-blue-600', activeClass: 'border-blue-500 bg-blue-50' },
  { id: 'proteinas', name: 'Proteínas', icon: '🥩', badgeClass: 'text-red-600', activeClass: 'border-red-500 bg-red-50' },
  { id: 'acompanamientos', name: 'Acompañamientos', icon: '🥔', badgeClass: 'text-yellow-600', activeClass: 'border-yellow-500 bg-yellow-50' },
  { id: 'bebidas', name: 'Bebidas', icon: '🥤', badgeClass: 'text-purple-600', activeClass: 'border-purple-500 bg-purple-50' }
];

export default function SpecialDishWizard({
  isOpen,
  onClose,
  onComplete,
  loadProductsForCategory,
  availableProducts,
  loadingProducts,
  existingSpecial
}: SpecialDishWizardProps) {
  const { notify } = useNotification();
  // Estado interno del wizard
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [specialData, setSpecialData] = useState<SpecialDishData>({
    name: '',
    description: '',
    price: 0,
    selectedProducts: {}
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);
  const [wantsAdditionalProducts, setWantsAdditionalProducts] = useState<boolean | null>(false); // default: No
  // Constante de bucket (centralizada por si cambiamos el nombre)
  const SPECIAL_BUCKET = 'special-dishes'; // mantenido para chequeo legado
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);

  // Verificación de existencia del bucket al abrir el wizard
  useEffect(() => {
    const checkBucket = async () => {
      try {
        setBucketExists(null);
        // list root (si no existe debe lanzar error)
        const { data, error } = await supabase.storage.from(SPECIAL_BUCKET).list('', { limit: 1 });
        if (error) {
          if (/does not exist|not found/i.test(error.message)) {
            setBucketExists(false);
          } else {
            // Otros errores (permisos), lo marcamos existente para permitir intento y mostrar diagnóstico luego
            setBucketExists(true);
          }
        } else {
          setBucketExists(true);
        }
      } catch (e:any) {
        if (/does not exist|not found/i.test(e?.message || '')) {
          setBucketExists(false);
        } else {
          setBucketExists(true);
        }
      }
    };
    if (isOpen) checkBucket();
  }, [isOpen]);

  // Inicializar cuando abre
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setCurrentStep(0);
      if (existingSpecial) {
        setSpecialData(existingSpecial);
        setImagePreview(existingSpecial.image || null);
  // Siempre iniciar en "No" aunque existan productos previamente
  setWantsAdditionalProducts(false);
    } else {
        setSpecialData({ name: '', description: '', price: 0, selectedProducts: {} });
        setImageFile(null);
        setImagePreview(null);
  setWantsAdditionalProducts(false); // default a "No"
      }
    }
  }, [isOpen, existingSpecial]);

  // Salvaguarda adicional: si abrimos en creación y el estado quedó en true por hot-reload, forzamos false
  useEffect(() => {
    if (isOpen && !existingSpecial && wantsAdditionalProducts !== false) {
      setWantsAdditionalProducts(false);
    }
  }, [isOpen, existingSpecial, wantsAdditionalProducts]);

  // Nota: No revocamos el object URL al desmontar para que la tarjeta conserve la imagen en memoria.
  // Sólo revocamos cuando se reemplaza dentro de handleImageChange.

  const handleImageChange = (file: File | null) => {
  setUploadErrorMsg(null);
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      setSpecialData(sd => ({ ...sd, image: undefined }));
      return;
    }
    if (!file.type.startsWith('image/')) {
      notify('warning', 'El archivo debe ser una imagen.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB
      notify('warning', 'Imagen demasiado grande (máx 2MB).');
      return;
    }
    const url = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(prev => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return url;
    });
    // Guardamos una referencia temporal (object URL) – futura integración: subir a storage y guardar URL real
    setSpecialData(sd => ({ ...sd, image: url }));
  };

  // Cargar productos al seleccionar categoría
  useEffect(() => {
    if (selectedCategory && !availableProducts[selectedCategory]) {
      loadProductsForCategory(selectedCategory);
    }
  }, [selectedCategory, availableProducts, loadProductsForCategory]);

  // Navegación
  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) setCurrentStep(s => s + 1);
  };
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };
  const handleComplete = async () => {
    let finalImageUrl = specialData.image;
    if (imageFile && specialData.image?.startsWith('blob:')) {
      try {
        setUploading(true);
        setUploadErrorMsg(null);
        finalImageUrl = await uploadSpecialDishImage(imageFile);
      } catch (e:any) {
        const msg = e?.message || 'Error subiendo imagen';
        if (/bucket/i.test(msg) && /not found|does not exist/i.test(msg)) {
          setUploadErrorMsg('Bucket inexistente.');
        } else {
          setUploadErrorMsg(msg);
        }
      } finally {
        setUploading(false);
      }
    }
    // Si sigue siendo un blob (falló subida) no persistimos esa URL temporal
    if (finalImageUrl && finalImageUrl.startsWith('blob:')) {
      finalImageUrl = undefined;
    }
    await onComplete({ ...specialData, image: finalImageUrl });
  };

  // Validaciones por paso
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 0:
        return specialData.name.trim() !== '' && specialData.description.trim() !== '' && specialData.price > 0;
      case 1:
    if (wantsAdditionalProducts === false) return true; // Usuario indicó que no desea agregar
    // Si aún no decidió (null) obligamos a elegir
    if (wantsAdditionalProducts === null) return false;
    // Desea agregar productos: exigir al menos uno
    return Object.values(specialData.selectedProducts).some(arr => arr.length > 0);
      default:
        return true;
    }
  }, [currentStep, specialData, wantsAdditionalProducts]);

  // Helpers selección de productos
  const toggleProduct = (categoryId: string, product: Producto) => {
    const current = specialData.selectedProducts[categoryId] || [];
    const exists = current.some(p => p.id === product.id);
    const updated = exists ? current.filter(p => p.id !== product.id) : [...current, product];
    setSpecialData(sd => ({
      ...sd,
      selectedProducts: { ...sd.selectedProducts, [categoryId]: updated }
    }));
  };

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return [];
    const list = availableProducts[selectedCategory] || [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return list;
    return list.filter(p => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
  }, [availableProducts, selectedCategory, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-[color:var(--sp-overlay)] backdrop-blur-sm" onClick={onClose} />
  <div className={`absolute right-0 top-0 h-full w-full max-w-3xl bg-[color:var(--sp-surface-elevated)] shadow-xl transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isAnimating ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}> 
        {/* Header */}
  <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gradient-to-r from-[color:var(--sp-primary-50)] to-[color:var(--sp-primary-100)]">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--sp-neutral-900)]">
              {WIZARD_STEPS[currentStep].icon} {WIZARD_STEPS[currentStep].name}
            </h2>
            <p className="text-sm text-[color:var(--sp-neutral-600)] mt-1">
              Paso {currentStep + 1} de {WIZARD_STEPS.length} {existingSpecial ? '- Editando' : '- Creando nuevo especial'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[color:var(--sp-neutral-100)]" aria-label="Cerrar">✖️</button>
        </div>

        {/* Progreso */}
  <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[color:var(--sp-neutral-50)] border-b">
          <div className="flex items-center justify-between">
            {WIZARD_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${index <= currentStep ? 'bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)]' : 'bg-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-600)]'}`}>
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <span className={`ml-2 text-xs ${index <= currentStep ? 'text-[color:var(--sp-neutral-900)] font-medium' : 'text-[color:var(--sp-neutral-500)]'}`}>{step.name}</span>
                {index < WIZARD_STEPS.length - 1 && <div className={`ml-3 w-8 h-0.5 ${index < currentStep ? 'bg-[color:var(--sp-primary-600)]' : 'bg-[color:var(--sp-neutral-300)]'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="bg-[color:var(--sp-info-50)] border border-[color:var(--sp-info-200)] rounded-lg p-4">
                <h3 className="text-lg font-semibold text-[color:var(--sp-info-800)] mb-2">📝 Información Básica</h3>
                <p className="text-sm text-[color:var(--sp-info-700)]">Nombre, descripción y precio del plato especial.</p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[color:var(--sp-neutral-700)]">Nombre *</label>
                  <input value={specialData.name} onChange={e => setSpecialData(sd => ({ ...sd, name: e.target.value }))} placeholder="Ej: Bandeja Paisa Especial" className="w-full px-4 py-3 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[color:var(--sp-neutral-700)]">Descripción *</label>
                  <textarea value={specialData.description} onChange={e => setSpecialData(sd => ({ ...sd, description: e.target.value }))} rows={4} placeholder="Describe el plato..." className="w-full px-4 py-3 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-transparent" />
                  <p className="text-xs text-[color:var(--sp-neutral-500)] mt-1">Explica ingredientes o características destacadas.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[color:var(--sp-neutral-700)]">Imagen (opcional)</label>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      {bucketExists === false && (
                        <div className="mb-3 text-xs rounded-md border border-[color:var(--sp-error-300)] bg-[color:var(--sp-error-50)] p-3 text-[color:var(--sp-error-700)]">
                          <p className="font-medium mb-1">Bucket faltante: &quot;special-dishes&quot;</p>
                          <p>Crea el bucket público en Supabase Storage para habilitar las subidas. Mientras tanto el especial se guardará sin imagen.</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleImageChange(e.target.files?.[0] || null)}
                        disabled={bucketExists === false}
                        className="block w-full text-sm text-[color:var(--sp-neutral-600)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[color:var(--sp-primary-50)] file:text-[color:var(--sp-primary-700)] hover:file:bg-[color:var(--sp-primary-100)] disabled:opacity-60"
                      />
                      <p className="text-xs text-[color:var(--sp-neutral-500)] mt-1">Formatos: JPG/PNG (máx 2MB)</p>
                      {uploadErrorMsg && (
                        <p className="mt-2 text-xs text-[color:var(--sp-error-600)] font-medium">{uploading ? 'Intentando subir...' : uploadErrorMsg}</p>
                      )}
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => handleImageChange(null)}
                          className="mt-2 inline-flex items-center px-3 py-1.5 text-xs rounded-md border border-[color:var(--sp-neutral-300)] hover:bg-[color:var(--sp-neutral-100)]"
                        >Quitar imagen</button>
                      )}
                      <div className="mt-4">
                        <label className="block text-xs font-medium mb-1 text-[color:var(--sp-neutral-600)]">Texto alternativo (accesibilidad)</label>
                        <input
                          type="text"
                          value={specialData.imageAlt || ''}
                          onChange={e => setSpecialData(sd => ({ ...sd, imageAlt: e.target.value }))}
                          placeholder="Ej: Foto del plato especial con acompañamientos"
                          maxLength={180}
                          className="w-full px-3 py-2 border border-[color:var(--sp-neutral-300)] rounded-md text-sm focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-transparent"
                        />
                        <p className="text-[10px] text-[color:var(--sp-neutral-500)] mt-1">Máx 180 caracteres.</p>
                      </div>
                    </div>
                    {imagePreview && (
                      <div className="w-28 h-28 rounded-lg overflow-hidden border border-[color:var(--sp-neutral-300)] bg-[color:var(--sp-neutral-100)] flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="Previsualización" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[color:var(--sp-neutral-700)]">Precio *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--sp-neutral-500)]">$</span>
                    {/* Campo controlado con formato de miles */}
                    <input
                      type="text"
                      inputMode="numeric"
                      value={specialData.price ? specialData.price.toLocaleString('es-CO') : ''}
                      onChange={e => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        const num = raw ? parseInt(raw, 10) : 0;
                        setSpecialData(sd => ({ ...sd, price: num }));
                      }}
                      placeholder="35.000"
                      className="w-full pl-8 pr-4 py-3 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-transparent"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[color:var(--sp-neutral-500)] mt-1">
                    <span>Sugerido: $25.000 - $50.000</span>
                    <span>{specialData.price > 0 ? `$${specialData.price.toLocaleString('es-CO')}` : 'Sin precio'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-[color:var(--sp-warning-50)] border border-[color:var(--sp-warning-200)] rounded-lg p-4">
                <h3 className="text-lg font-semibold text-[color:var(--sp-warning-800)] mb-2">🛒 Selección de Productos</h3>
                <p className="text-sm text-[color:var(--sp-warning-700)]">Opcionalmente puedes asociar productos informativos (ingredientes, acompañamientos, etc.).</p>
              </div>
              <div className="bg-[color:var(--sp-neutral-50)] border border-[color:var(--sp-neutral-200)] rounded-lg p-4">
                <p className="text-sm font-medium text-[color:var(--sp-neutral-800)] mb-3">¿Deseas agregar algún producto adicional?</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setWantsAdditionalProducts(true)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${wantsAdditionalProducts === true ? 'bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)] border-[color:var(--sp-primary-600)]' : 'border-[color:var(--sp-neutral-300)] hover:bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-700)]'}`}
                  >Sí</button>
                  <button
                    type="button"
                    onClick={() => { setWantsAdditionalProducts(false); setSelectedCategory(null); setSpecialData(sd => ({ ...sd, selectedProducts: {} })); }}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${wantsAdditionalProducts === false ? 'bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)] border-[color:var(--sp-primary-600)]' : 'border-[color:var(--sp-neutral-300)] hover:bg-[color:var(--sp-neutral-100)] text-[color:var(--sp-neutral-700)]'}`}
                  >No</button>
                </div>
                {wantsAdditionalProducts === null && (
                  <p className="mt-2 text-xs text-[color:var(--sp-neutral-500)]">Selecciona una opción para continuar.</p>
                )}
                {wantsAdditionalProducts === false && (
                  <p className="mt-3 text-sm text-[color:var(--sp-neutral-600)] italic">No se agregarán productos. Puedes continuar.</p>
                )}
              </div>
              {wantsAdditionalProducts === true && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {PRODUCT_CATEGORIES.map(cat => {
                  const selectedCount = specialData.selectedProducts[cat.id]?.length || 0;
                  const active = selectedCategory === cat.id;
                  return (
                    <button key={cat.id} type="button" onClick={() => setSelectedCategory(active ? null : cat.id)} className={`p-4 rounded-lg border-2 text-center transition-all ${active ? cat.activeClass : 'border-[color:var(--sp-neutral-200)] hover:border-[color:var(--sp-neutral-300)]'}`}>
                      <div className="text-2xl mb-2">{cat.icon}</div>
                      <div className="font-medium text-sm text-[color:var(--sp-neutral-800)]">{cat.name}</div>
                      {selectedCount > 0 && (
                        <div className={`text-xs mt-1 font-medium ${cat.badgeClass}`}>{selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}</div>
                      )}
                    </button>
                  );
                })}
              </div>
              )}
              {wantsAdditionalProducts === true && selectedCategory && (
                <div className="border border-[color:var(--sp-neutral-200)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-[color:var(--sp-neutral-800)]">
                      {PRODUCT_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                    </h4>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--sp-neutral-400)] text-xs">🔍</span>
                      <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar..." className="pl-9 pr-4 py-2 border border-[color:var(--sp-neutral-300)] rounded-lg text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                    {loadingProducts && !availableProducts[selectedCategory] && (
                      <div className="col-span-2 text-sm text-[color:var(--sp-neutral-500)]">Cargando productos...</div>
                    )}
                    {filteredProducts.map(prod => {
                      const selected = specialData.selectedProducts[selectedCategory]?.some(p => p.id === prod.id);
                      return (
                        <div key={prod.id} onClick={() => toggleProduct(selectedCategory, prod)} className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer text-sm transition-colors ${selected ? 'bg-[color:var(--sp-neutral-100)] border-[color:var(--sp-primary-400)]' : 'bg-[color:var(--sp-surface)] border-[color:var(--sp-neutral-200)] hover:border-[color:var(--sp-primary-300)]'}`}>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[color:var(--sp-neutral-800)] truncate">{prod.name}</p>
                            {prod.description && <p className="text-xs text-[color:var(--sp-neutral-500)] truncate">{prod.description}</p>}
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected ? 'bg-[color:var(--sp-primary-600)] border-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)]' : 'border-[color:var(--sp-neutral-300)] text-[color:var(--sp-neutral-400)]'}`}>{selected && '✓'}</div>
                        </div>
                      );
                    })}
                    {!loadingProducts && filteredProducts.length === 0 && (
                      <div className="col-span-2 text-sm text-[color:var(--sp-neutral-500)] italic">Sin productos</div>
                    )}
                  </div>
                </div>
              )}
              {wantsAdditionalProducts !== false && (
              <div className="bg-[color:var(--sp-neutral-50)] rounded-lg p-4">
                <h4 className="font-medium mb-3 text-[color:var(--sp-neutral-800)]">Resumen:</h4>
                {Object.entries(specialData.selectedProducts).map(([catId, list]) => {
                  if (!list.length) return null;
                  const cat = PRODUCT_CATEGORIES.find(c => c.id === catId);
                  return (
                    <div key={catId} className="flex items-center gap-2 text-xs mb-1">
                      <span>{cat?.icon}</span>
                      <span className="font-medium text-[color:var(--sp-neutral-700)]">{cat?.name}:</span>
                      <span className="text-[color:var(--sp-neutral-600)]">{list.length} producto{list.length !== 1 ? 's' : ''}</span>
                    </div>
                  );
                })}
                {Object.values(specialData.selectedProducts).every(arr => arr.length === 0) && (
                  <p className="text-xs text-[color:var(--sp-neutral-500)] italic">No hay productos seleccionados</p>
                )}
              </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-[color:var(--sp-success-50)] border border-[color:var(--sp-success-200)] rounded-lg p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold text-[color:var(--sp-success-800)] mb-1 sm:mb-2">👁️ Vista Previa</h3>
                <p className="text-xs sm:text-sm text-[color:var(--sp-success-700)]">Así se mostrará el plato especial.</p>
              </div>
              <div className="border border-[color:var(--sp-neutral-200)] rounded-lg p-4 sm:p-6 bg-[color:var(--sp-surface)] shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold leading-snug text-[color:var(--sp-neutral-900)] break-words">{specialData.name || 'Sin nombre'}</h3>
                    <p className="text-[color:var(--sp-neutral-600)] mt-1 whitespace-pre-line text-sm sm:text-base max-h-40 overflow-y-auto pr-1">{specialData.description || 'Sin descripción'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl sm:text-2xl font-bold text-[color:var(--sp-success-600)] leading-none">
                      {specialData.price > 0 ? `$${specialData.price.toLocaleString('es-CO')}` : '—'}
                    </div>
                    <div className="text-[10px] sm:text-xs text-[color:var(--sp-neutral-500)] mt-1">COP</div>
                  </div>
                </div>
                {imagePreview && (
                  <div className="mb-4">
                    <div className="w-full aspect-video max-h-56 sm:max-h-72 rounded-lg overflow-hidden border border-[color:var(--sp-neutral-300)] bg-[color:var(--sp-neutral-100)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Imagen del plato" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-medium text-[color:var(--sp-neutral-800)] text-sm sm:text-base">Incluye:</h4>
                  <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
                    {Object.entries(specialData.selectedProducts).map(([catId, list]) => {
                      if (!list.length) return null;
                      const cat = PRODUCT_CATEGORIES.find(c => c.id === catId);
                      return (
                        <div key={catId} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm">
                          <span className="text-base sm:text-lg leading-none">{cat?.icon}</span>
                          <div>
                            <div className="font-medium text-[color:var(--sp-neutral-700)]">{cat?.name}:</div>
                            <div className="text-[color:var(--sp-neutral-600)] break-words">{list.map(p => p.name).join(', ')}</div>
                          </div>
                        </div>
                      );
                    })}
                    {Object.values(specialData.selectedProducts).every(arr => arr.length === 0) && (
                      <p className="text-[10px] sm:text-xs text-[color:var(--sp-neutral-500)] italic">No hay productos seleccionados</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 text-center">
              <div className="bg-[color:var(--sp-success-50)] border border-[color:var(--sp-success-200)] rounded-lg p-6">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-[color:var(--sp-success-800)] mb-2">¡Listo!</h3>
                <p className="text-[color:var(--sp-success-700)]">Tu plato especial está listo para guardarse.</p>
              </div>
              <div className="text-left bg-[color:var(--sp-neutral-50)] rounded-lg p-4">
                <h4 className="font-medium mb-3 text-[color:var(--sp-neutral-800)]">Acciones al confirmar:</h4>
                <ul className="space-y-2 text-sm text-[color:var(--sp-neutral-600)]">
                  <li className="flex items-center gap-2">✓ Se guardará el especial</li>
                  <li className="flex items-center gap-2">✓ Podrás activarlo para hoy</li>
                  <li className="flex items-center gap-2">✓ Podrás editarlo o eliminarlo</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
  <div className="flex items-center justify-between p-4 sm:p-6 border-t bg-[color:var(--sp-surface)]">
          <button onClick={handlePrev} disabled={currentStep === 0} className="flex items-center px-4 py-2 border border-[color:var(--sp-neutral-300)] rounded-lg hover:bg-[color:var(--sp-neutral-50)] disabled:opacity-50">← Anterior</button>
          <div className="text-sm text-[color:var(--sp-neutral-600)]">{isStepValid ? '✅ Listo' : '⚠️ Completa los campos'}</div>
          <button
            onClick={currentStep === WIZARD_STEPS.length - 1 ? handleComplete : handleNext}
            disabled={!isStepValid}
            className="flex items-center px-4 py-2 bg-[color:var(--sp-primary-600)] text-[color:var(--sp-on-primary)] rounded-lg hover:bg-[color:var(--sp-primary-700)] disabled:opacity-50"
          >
            {uploading ? 'Subiendo...' : (currentStep === WIZARD_STEPS.length - 1
              ? (existingSpecial ? 'Guardar Cambios' : 'Crear Especial')
              : 'Siguiente')}
            {currentStep < WIZARD_STEPS.length - 1 && <span className="ml-2">→</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
