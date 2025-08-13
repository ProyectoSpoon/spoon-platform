'use client';

import React, { useState } from 'react';
import { useNotifications } from '../../../../../../packages/shared/Context/notification-context';
import ImagenesForm from './ImagenesForm';
import HorariosForm from './HorariosForm';
import { GeneralInfoForm } from '../../../../../../packages/shared/components/ui/components/GeneralInfoForm';
import { UbicacionForm } from '../../../../../../packages/shared/components/ui/components/UbicacionForm';
import { Info, Clock, Upload } from 'lucide-react';
import { Tabs } from '../../../../../../packages/shared';

export default function ConfiguracionPage() {
  const [editGeneral, setEditGeneral] = useState(false);
  const [editUbicacion, setEditUbicacion] = useState(false);
  const [editHorarios, setEditHorarios] = useState(false);
  const [editImagenes, setEditImagenes] = useState(false);
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingUbicacion, setSavingUbicacion] = useState(false);
  const [generalInfo, setGeneralInfo] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    cuisineType: ''
  });
  const [ubicacion, setUbicacion] = useState<{
    address: string;
    country_id: string;
    department_id: string;
    city_id: string;
    latitude?: number;
    longitude?: number;
  }>({
    address: '',
    country_id: '',
    department_id: '',
    city_id: '',
    latitude: undefined,
    longitude: undefined
  });
  // Datos mock para países, departamentos y ciudades
  const countries = [{ id: 'CO', name: 'Colombia', code: 'CO', phone_code: '+57' }];
  const departments = [{ id: '11', name: 'Bogotá', code: '11', country_id: 'CO' }];
  const cities = [{ id: '11001', name: 'Bogotá', department_id: '11', latitude: 4.711, longitude: -74.072, is_capital: true }];

  // Cargar datos reales al montar
  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data, error } = await (await import('../../../../../../packages/shared/services/restaurant')).RestaurantService.getUserRestaurant();
        if (error || !data) return;
        setGeneralInfo({
          name: data.name || '',
          description: data.description || '',
          phone: data.contact_phone || '',
          email: data.contact_email || '',
          cuisineType: data.cuisine_type || ''
        });
        setUbicacion({
          address: data.address || '',
          country_id: data.country_id || '',
          department_id: data.department_id || '',
          city_id: data.city_id || '',
          latitude: data.latitude,
          longitude: data.longitude
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleGeneralChange = (field: string, value: string) => {
    setGeneralInfo(prev => ({ ...prev, [field]: value }));
  };
  const handleGeneralSubmit = () => {
    setSavingGeneral(true);
    (async () => {
      try {
        const { updateBasicInfo } = (await import('../../../../../../packages/shared/services/restaurant')).RestaurantService;
        const { error } = await updateBasicInfo({
          name: generalInfo.name,
          description: generalInfo.description,
          contact_phone: generalInfo.phone,
          contact_email: generalInfo.email,
          cuisine_type: generalInfo.cuisineType
        });
            if (!error) {
              addNotification({ type: 'success', title: 'Éxito', message: 'Información general actualizada correctamente.' });
            } else {
              addNotification({ type: 'error', title: 'Error', message: 'Error al actualizar la información general.' });
        }
      } finally {
        setSavingGeneral(false);
      }
    })();
  };
  const handleUbicacionChange = (field: string, value: string | number) => {
    setUbicacion(prev => ({ ...prev, [field]: value }));
  };
  const handleUbicacionSubmit = () => {
    setSavingUbicacion(true);
    (async () => {
      try {
        const { updateLocation } = (await import('../../../../../../packages/shared/services/restaurant')).RestaurantService;
        const { error } = await updateLocation({
          address: ubicacion.address,
          country_id: ubicacion.country_id,
          department_id: ubicacion.department_id,
          city_id: ubicacion.city_id,
          latitude: ubicacion.latitude,
          longitude: ubicacion.longitude
        });
            if (!error) {
              addNotification({ type: 'success', title: 'Éxito', message: 'Ubicación actualizada correctamente.' });
            } else {
              addNotification({ type: 'error', title: 'Error', message: 'Error al actualizar la ubicación.' });
        }
      } finally {
        setSavingUbicacion(false);
      }
    })();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 md:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <span className="text-gray-600">Cargando configuración...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-8 py-8">


      {/* Pestañas */}
      <Tabs
        className="mt-0 mb-3"
        activeId={activeTab}
        onChange={setActiveTab}
        items={[
          { id: 'info', label: 'Información General', icon: <Info className="h-4 w-4" /> },
          { id: 'location', label: 'Ubicación', icon: <Info className="h-4 w-4" /> },
          { id: 'horarios', label: 'Horarios', icon: <Clock className="h-4 w-4" /> },
          { id: 'imagenes', label: 'Imágenes', icon: <Upload className="h-4 w-4" /> },
        ]}
      />
      {/* Contenido de pestañas */}
  <div className="mt-2">
        {activeTab === 'info' && (
          <GeneralInfoForm
            formData={generalInfo}
            onChange={handleGeneralChange}
            onSubmit={handleGeneralSubmit}
            saving={savingGeneral}
            readOnly={!editGeneral}
            showSave={editGeneral}
            onCancel={() => setEditGeneral(false)}
            onToggleEdit={() => setEditGeneral(true)}
          />
        )}
        {activeTab === 'location' && (
          <UbicacionForm
            formData={ubicacion}
            onChange={handleUbicacionChange}
            onSubmit={handleUbicacionSubmit}
            saving={savingUbicacion}
            countries={countries}
            departments={departments}
            cities={cities}
            readOnly={!editUbicacion}
            showSave={editUbicacion}
            onCancel={() => setEditUbicacion(false)}
            onToggleEdit={() => setEditUbicacion(true)}
          />
        )}
        {activeTab === 'horarios' && (
          <HorariosForm
            readOnly={!editHorarios}
            showSave={editHorarios}
            onCancel={() => setEditHorarios(false)}
            onToggleEdit={() => setEditHorarios(true)}
          />
        )}
        {activeTab === 'imagenes' && (
          <ImagenesForm
            readOnly={!editImagenes}
            showSave={editImagenes}
            onCancel={() => setEditImagenes(false)}
            onToggleEdit={() => setEditImagenes(true)}
          />
        )}
      </div>
    </div>
  );
}