'use client';

import { useState } from 'react';
import { UbicacionForm } from '@spoon/shared';

export default function TestUbicacionFinalPage() {
  const [formData, setFormData] = useState({
    address: '',
    country_id: '',
    department_id: '',
    city_id: '',
    latitude: 0,
    longitude: 0
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    console.log('📍 Campo actualizado:', field, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    console.log('📍 Formulario enviado:', formData);
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🗺️ Test UbicacionForm Final</h1>
      
      <div className="mb-6">
        <UbicacionForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          saving={saving}
          readOnly={false}
          showSave={true}
        />
      </div>

      <div className="mt-6 p-4 bg-gray-50 border rounded">
        <h3 className="text-lg font-semibold mb-2">📊 Estado actual:</h3>
        <pre className="text-sm">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="text-lg font-semibold mb-2">📝 Test:</h3>
        <ol className="text-sm space-y-1">
          <li>1. ✅ Los países deberían cargar automáticamente</li>
          <li>2. ✅ Colombia debería seleccionarse automáticamente</li>
          <li>3. ✅ Los departamentos deberían cargar después</li>
          <li>4. ✅ Al seleccionar un departamento, las ciudades deberían cargar</li>
        </ol>
      </div>
    </div>
  );
}
