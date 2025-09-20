'use client';

import React, { useState } from 'react';
import { UbicacionForm } from '@spoon/shared/components/ui/components/UbicacionForm';

// Ejemplo de página para probar el componente UbicacionForm actualizado
export default function TestUbicacionPage() {
  const [formData, setFormData] = useState({
    address: '',
    country_id: '',
    department_id: '',
    city_id: '',
    latitude: undefined,
    longitude: undefined,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Datos guardados:', formData);
      alert('¡Ubicación guardada correctamente!');
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error al guardar la ubicación');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--sp-neutral-50)] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[color:var(--sp-surface)] rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-[color:var(--sp-neutral-900)] mb-6">
            🧪 Test: Componente UbicacionForm v2
          </h1>
          
          <div className="mb-6 p-4 bg-[color:var(--sp-info-50)] border border-[color:var(--sp-info-200)] rounded-lg">
            <h2 className="font-semibold text-[color:var(--sp-info-800)] mb-2">✨ Nuevas características:</h2>
            <ul className="text-sm text-[color:var(--sp-info-700)] space-y-1">
              <li>• 🌍 Carga automática de datos reales de Colombia</li>
              <li>• 🔄 Dropdowns en cascada (País → Departamento → Ciudad)</li>
              <li>• 📍 Coordenadas automáticas al seleccionar ciudad</li>
              <li>• ⚡ Hook useGeographicData para gestión de estado</li>
              <li>• 🛡️ Manejo de errores y estados de carga</li>
            </ul>
          </div>

          <UbicacionForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            saving={saving}
          />

          {/* Debug info */}
          <div className="mt-6 p-4 bg-[color:var(--sp-neutral-100)] rounded-lg">
            <h3 className="font-semibold text-[color:var(--sp-neutral-800)] mb-2">🔍 Estado actual:</h3>
            <pre className="text-xs text-[color:var(--sp-neutral-600)] overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
