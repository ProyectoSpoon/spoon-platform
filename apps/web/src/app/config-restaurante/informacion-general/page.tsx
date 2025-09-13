// apps/web/src/app/config-restaurante/informacion-general/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, getUserRestaurant, supabase } from '@spoon/shared';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  Input,
  toast 
} from '@spoon/shared';

// Type casting to resolve React version conflicts
const ButtonComponent = Button as any;
const CardComponent = Card as any;
const CardContentComponent = CardContent as any;
const CardHeaderComponent = CardHeader as any;
const CardTitleComponent = CardTitle as any;
const InputComponent = Input as any;

interface RestaurantInfo {
  name: string;
  description: string;
  phone: string;
  email: string;
  cuisineType: string;
}

interface CuisineType {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export default function InformacionGeneralPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RestaurantInfo>({
    name: '',
    description: '',
    phone: '',
    email: '',
    cuisineType: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([]);
  
  // Estados para tracking de pre-rellenado
  const [isPhonePreFilled, setIsPhonePreFilled] = useState(false);
  const [isEmailPreFilled, setIsEmailPreFilled] = useState(false);

  // Función para cargar tipos de cocina
  const loadCuisineTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('cuisine_types')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setCuisineTypes(data || []);
      console.log('🍽️ Tipos de cocina cargados:', data?.length);
    } catch (error) {
      console.error('Error cargando tipos de cocina:', error);
      toast.error('Error cargando tipos de cocina');
      // Fallback con tipos hardcodeados
      setCuisineTypes([
        { id: '1', name: 'Colombiana', slug: 'colombiana', icon: '🇨🇴', description: 'Comida tradicional colombiana' },
        { id: '2', name: 'Italiana', slug: 'italiana', icon: '🍝', description: 'Pasta, pizza y cocina italiana' },
        { id: '3', name: 'Mexicana', slug: 'mexicana', icon: '🌮', description: 'Tacos, enchiladas y cocina mexicana' }
      ]);
    }
  };

  // Pre-rellenar datos inteligentemente
  const preRellenarDatos = (profile: any, restaurant: any = null) => {
    // Si hay restaurante existente, priorizar sus datos
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        description: restaurant.description || '',
        phone: restaurant.contact_phone || profile?.phone || '',
        email: restaurant.contact_email || profile?.email || '',
        cuisineType: restaurant.cuisine_type || ''
      });
      setIsPhonePreFilled(!!profile?.phone && !restaurant.contact_phone);
    } else {
      // Para usuarios nuevos, sugerir un nombre basado en el perfil
      const suggestedName = profile?.first_name && profile?.last_name 
        ? `Restaurante ${profile.first_name} ${profile.last_name}`
        : '';
        
      setFormData({
        name: suggestedName,
        description: '',
        phone: profile?.phone || '',
        email: profile?.email || '',
        cuisineType: ''
      });
      setIsPhonePreFilled(!!profile?.phone);
    }
  };

  // Cargar datos existentes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [profile, restaurant] = await Promise.all([
          getUserProfile(),
          getUserRestaurant()
        ]);
        await loadCuisineTypes();
        if (profile) setUserInfo(profile);
        if (restaurant) setRestaurantId(restaurant.id);
        preRellenarDatos(profile, restaurant);
      } catch (error) {
        toast.error('Error al cargar la información');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Prevenir cambios en el email (solo lectura)
    if (name === 'email') {
      console.log('⚠️ Email field is read-only');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'phone') setIsPhonePreFilled(false);
  };

  const validateForm = (): boolean => {
    console.log('🔍 validateForm called with:', formData);
    
    if (!formData.name.trim()) {
      console.log('❌ Name validation failed');
      toast.error('Por favor, ingresa el nombre de tu restaurante');
      return false;
    }
    if (!formData.phone.trim()) {
      console.log('❌ Phone validation failed');
      toast.error('El teléfono de contacto es necesario para que te encuentren');
      return false;
    }
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      console.log('❌ Phone format validation failed:', formData.phone);
      toast.error('Ingresa un teléfono válido (ej: +57 312 345 6789)');
      return false;
    }
    if (!formData.email.trim()) {
      console.log('❌ Email validation failed');
      toast.error('El email es necesario para contactos importantes');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      console.log('❌ Email format validation failed:', formData.email);
      toast.error('Ingresa un email válido (ej: contacto@turestaurante.com)');
      return false;
    }
    
    console.log('✅ All validations passed!');
    return true;
  };

  // Guardar datos
  const handleSave = async () => {
    console.log('🚀 handleSave called!', { formData, isFormValid });
    
    if (!validateForm()) return;
    
    console.log('✅ Form validation passed!');
    
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Necesitas estar conectado para continuar');
        return;
      }
      const selectedCuisineType = cuisineTypes.find(ct => ct.slug === formData.cuisineType);
      if (restaurantId) {
        const { error } = await supabase
          .from('restaurants')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            contact_phone: formData.phone.trim(),
            contact_email: formData.email.trim(),
            cuisine_type: formData.cuisineType,
            cuisine_type_id: selectedCuisineType?.id || null,
            setup_step: Math.max(1, 1),
            updated_at: new Date().toISOString()
          })
          .eq('id', restaurantId);
        if (error) throw error;
        toast.success('✅ Información actualizada correctamente');
      } else {
        const { data, error } = await supabase
          .from('restaurants')
          .insert({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            contact_phone: formData.phone.trim(),
            contact_email: formData.email.trim(),
            cuisine_type: formData.cuisineType,
            cuisine_type_id: selectedCuisineType?.id || null,
            owner_id: user.id,
            setup_step: 1,
            setup_completed: false,
            status: 'configuring'
          })
          .select()
          .single();
        if (error) throw error;
        const { error: userError } = await supabase
          .from('users')
          .update({ restaurant_id: data.id })
          .eq('id', user.id);
        if (userError) {
          console.warn('No se pudo actualizar restaurant_id en usuario:', userError);
        }
        setRestaurantId(data.id);
        toast.success('🎉 ¡Restaurante creado! Continuemos con la ubicación');
      }
      setTimeout(() => {
        router.push('/config-restaurante/ubicacion');
      }, 1500);
    } catch (error) {
      toast.error('No pudimos guardar la información. Por favor, intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/config-restaurante');
  };

  const isFormValid = !!(formData.name.trim() && formData.phone.trim() && formData.email.trim());

  // DEBUG: Log para verificar el estado del formulario
  useEffect(() => {
    console.log('🔍 Form Debug:', {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      isFormValid,
      nameValid: !!formData.name.trim(),
      phoneValid: !!formData.phone.trim(),
      emailValid: !!formData.email.trim()
    });
  }, [formData, isFormValid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[--sp-surface] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--sp-primary-600)] mx-auto mb-4"></div>
          <p className="text-[color:var(--sp-neutral-600)]">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-[--sp-surface] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <CardComponent>
          <CardHeaderComponent>
            <div className="flex items-center justify-between mb-4">
              <ButtonComponent 
                variant="outline" 
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                ← Volver
              </ButtonComponent>
              
              <div className="text-center flex-1">
                <span className="text-sm text-[color:var(--sp-neutral-500)] font-medium">Paso 1 de 4</span>
              </div>
              
              <div className="w-20"></div>
            </div>
            
            <CardTitleComponent>
              Información General
            </CardTitleComponent>
            <p className="text-[color:var(--sp-neutral-600)]">
              Empecemos con los datos básicos de tu restaurante
            </p>
            {userInfo && (
              <p className="text-xs text-[color:var(--sp-info-600)] mt-2">
                👤 {userInfo.email} • {restaurantId ? `Editando restaurante` : 'Nuevo restaurante'}
              </p>
            )}
          </CardHeaderComponent>
        </CardComponent>

        {/* Formulario principal con jerarquía visual */}
        <CardComponent>
          <CardContentComponent>
            <div className="space-y-8">
              {/* Nombre del restaurante */}
              <div className="pb-2 border-b border-[color:var(--sp-neutral-200)]">
                <InputComponent
                  label="Nombre del Restaurante *"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Restaurante Doña María, El Rincón de la Abuela..."
                  leftIcon={
                    <svg className="w-5 h-5 text-[color:var(--sp-primary-600)]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.84l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                    </svg>
                  }
                  helperText="Escoge un nombre que represente tu restaurante y sea fácil de recordar"
                />
              </div>

              {/* Contacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2 pb-2 border-b border-[color:var(--sp-neutral-200)]">
                <div>
                  <InputComponent
                    label={`Teléfono del Restaurante * ${isPhonePreFilled ? '(Pre-llenado)' : ''}`}
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Ej: +57 312 345 6789"
                    leftIcon={
                      <svg className="w-5 h-5 text-[color:var(--sp-primary-600)]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                      </svg>
                    }
                    helperText={
                      isPhonePreFilled 
                        ? "💡 Usamos tu teléfono personal, pero puedes cambiarlo si prefieres uno diferente para el restaurante"
                        : "Este será el teléfono de contacto público de tu restaurante"
                    }
                  />
                </div>

                <div>
                  <InputComponent
                    label="Email del Restaurante * (Email de registro)"
                    name="email"
                    type="email"
                    value={formData.email}
                    readOnly={true}
                    disabled={true}
                    placeholder="Ej: contacto@restaurante.com"
                    leftIcon={
                      <svg className="w-5 h-5 text-[color:var(--sp-neutral-400)]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                    }
                    helperText="🔒 Este es el email con el que te registraste. Para cambiarlo, contacta soporte técnico."
                  />
                </div>
              </div>

              {/* Tipo de cocina */}
              <div className="pt-2 pb-2 border-b border-[color:var(--sp-neutral-200)]">
                <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">
          <svg className="inline w-5 h-5 text-[color:var(--sp-primary-600)] mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                  Tipo de Cocina
                </label>
                <select
                  name="cuisineType"
                  value={formData.cuisineType}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)]"
                >
                  <option value="">Selecciona qué tipo de comida ofreces</option>
                  {cuisineTypes.map(type => (
                    <option key={type.id} value={type.slug}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[color:var(--sp-neutral-500)] mt-1">
                  Esto ayuda a los clientes a encontrar exactamente lo que buscan
                </p>
                {cuisineTypes.length === 0 && (
                  <p className="text-xs text-[color:var(--sp-warning-700)] mt-1">
                    ⚠️ No se pudieron cargar los tipos de cocina. Intenta recargar la página.
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-[color:var(--sp-neutral-700)] mb-2">
                  Descripción del Restaurante (Opcional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Cuéntanos sobre tu restaurante: ¿qué lo hace especial? ¿Cuál es tu plato estrella? ¿Qué ambiente ofreces?"
                  rows={4}
                  className="w-full p-3 border border-[color:var(--sp-neutral-300)] rounded-lg focus:ring-2 focus:ring-[color:var(--sp-primary-500)] focus:border-[color:var(--sp-primary-500)]"
                />
                <p className="text-xs text-[color:var(--sp-neutral-500)] mt-1">
                  Una buena descripción ayuda a los clientes a conocer tu restaurante antes de visitarlo
                </p>
              </div>
            </div>
          </CardContentComponent>
        </CardComponent>

        {/* Botones de navegación mejorados */}
        <CardComponent>
          <CardContentComponent>
            <div className="flex justify-between items-center">
              <ButtonComponent 
                variant="outline" 
                onClick={handleBack}
                className="flex items-center gap-2"
                disabled={saving}
              >
                ← Configuración
              </ButtonComponent>
              
      <ButtonComponent
                onClick={handleSave}
                disabled={saving || !isFormValid}
                loading={saving}
                variant={isFormValid ? "default" : "secondary"}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[--sp-on-primary]"></div>
                    Guardando...
                  </>
                ) : isFormValid ? (
                  'Continuar a Ubicación →'
                ) : (
                  'Completa los campos obligatorios'
                )}
              </ButtonComponent>
            </div>
            {!isFormValid && (
              <div className="mt-3 p-3 bg-[color:var(--sp-warning-50)] border border-[color:var(--sp-warning-200)] rounded-lg">
                <p className="text-sm text-[color:var(--sp-warning-700)]">
                  📝 <strong>Campos obligatorios:</strong>
                </p>
                <ul className="text-xs text-[color:var(--sp-warning-600)] mt-1 space-y-1">
                  {!formData.name.trim() && <li>• Nombre del restaurante</li>}
                  {!formData.phone.trim() && <li>• Teléfono de contacto</li>}
                  {!formData.email.trim() && <li>• Email de contacto</li>}
                </ul>
              </div>
            )}
          </CardContentComponent>
        </CardComponent>

        {/* Progreso visual mejorado */}
        <CardComponent className="bg-[color:var(--sp-info-50)] border-[color:var(--sp-info-200)]">
          <CardContentComponent>
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-[color:var(--sp-info-600)]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.84l-7-3z"/>
              </svg>
              <div>
                <h3 className="font-bold text-[color:var(--sp-info-800)]">Información Básica</h3>
                <p className="text-sm text-[color:var(--sp-info-700)]">
                  Esta información aparecerá en tu perfil público y ayudará a los clientes a encontrarte y contactarte.
                </p>
                <div className="flex items-center gap-4 text-xs text-[color:var(--sp-info-600)] mt-2">
                  {cuisineTypes.length > 0 && (
                    <span>✅ {cuisineTypes.length} tipos de cocina disponibles</span>
                  )}
                  {isPhonePreFilled && <span>📱 Teléfono pre-rellenado</span>}
                  {isEmailPreFilled && <span>📧 Email pre-rellenado</span>}
                </div>
              </div>
            </div>
          </CardContentComponent>
        </CardComponent>
      </div>
    </div>
  );
}


