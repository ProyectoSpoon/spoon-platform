'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@spoon/shared/lib/supabase';

export default function DebugSupabasePage() {
  const [connectionStatus, setConnectionStatus] = useState('Conectando...');
  const [countriesData, setCountriesData] = useState<any[]>([]);
  const [departmentsData, setDepartmentsData] = useState<any[]>([]);
  const [citiesData, setCitiesData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const testConnection = async () => {
      console.log('🔍 Iniciando debug de Supabase...');
      
      try {
        // Test 1: Verificar configuración
        console.log('📊 Configuración de Supabase:', {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        });

        setConnectionStatus('Probando countries...');
        
        // Test 2: Countries
        console.log('🌍 Consultando countries...');
        const { data: countries, error: countriesError } = await supabase
          .from('countries')
          .select('*')
          .limit(5);
        
        if (countriesError) {
          console.error('❌ Error en countries:', countriesError);
          setErrors(prev => [...prev, `Countries: ${countriesError.message}`]);
        } else {
          console.log('✅ Countries response:', countries);
          setCountriesData(countries || []);
        }

        setConnectionStatus('Probando departments...');
        
        // Test 3: Departments
        console.log('🏛️ Consultando departments...');
        const { data: departments, error: departmentsError } = await supabase
          .from('departments')
          .select('*')
          .limit(5);
        
        if (departmentsError) {
          console.error('❌ Error en departments:', departmentsError);
          setErrors(prev => [...prev, `Departments: ${departmentsError.message}`]);
        } else {
          console.log('✅ Departments response:', departments);
          setDepartmentsData(departments || []);
        }

        setConnectionStatus('Probando cities...');
        
        // Test 4: Cities
        console.log('🏙️ Consultando cities...');
        const { data: cities, error: citiesError } = await supabase
          .from('cities')
          .select('*')
          .limit(5);
        
        if (citiesError) {
          console.error('❌ Error en cities:', citiesError);
          setErrors(prev => [...prev, `Cities: ${citiesError.message}`]);
        } else {
          console.log('✅ Cities response:', cities);
          setCitiesData(cities || []);
        }

        setConnectionStatus('¡Pruebas completadas!');
        
      } catch (error) {
        console.error('💥 Error general:', error);
        setErrors(prev => [...prev, `Error general: ${error}`]);
        setConnectionStatus('Error en las pruebas');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 Debug Supabase Connection</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Estado de conexión:</h2>
        <p className={`text-lg ${errors.length > 0 ? 'text-[color:var(--sp-error-600)]' : 'text-[color:var(--sp-success-600)]'}`}>
          {connectionStatus}
        </p>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-[color:var(--sp-error-100)] border border-[color:var(--sp-error-400)] rounded">
          <h3 className="text-lg font-semibold text-[color:var(--sp-error-800)] mb-2">Errores:</h3>
          <ul className="text-[color:var(--sp-error-700)]">
            {errors.map((error, index) => (
              <li key={index} className="mb-1">• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-[color:var(--sp-border)] rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">🌍 Countries ({countriesData.length})</h3>
          <div className="space-y-1 text-sm">
            {countriesData.map((country) => (
              <div key={country.id} className="bg-[color:var(--sp-neutral-100)] p-2 rounded">
                <div className="font-medium">{country.name}</div>
                <div className="text-[color:var(--sp-neutral-600)]">{country.iso_code}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[color:var(--sp-border)] rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">🏛️ Departments ({departmentsData.length})</h3>
          <div className="space-y-1 text-sm">
            {departmentsData.map((dept) => (
              <div key={dept.id} className="bg-[color:var(--sp-neutral-100)] p-2 rounded">
                <div className="font-medium">{dept.name}</div>
                <div className="text-[color:var(--sp-neutral-600)]">{dept.code}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[color:var(--sp-border)] rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">🏙️ Cities ({citiesData.length})</h3>
          <div className="space-y-1 text-sm">
            {citiesData.map((city) => (
              <div key={city.id} className="bg-[color:var(--sp-neutral-100)] p-2 rounded">
                <div className="font-medium">{city.name}</div>
                <div className="text-[color:var(--sp-neutral-600)]">{city.department_id}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-[color:var(--sp-info-50)] border border-[color:var(--sp-info-200)] rounded">
        <h3 className="text-lg font-semibold mb-2">📝 Instrucciones:</h3>
        <ol className="text-sm space-y-1">
          <li>1. Abre las herramientas de desarrollador (F12)</li>
          <li>2. Ve a la pestaña &quot;Console&quot;</li>
          <li>3. Revisa los logs detallados de la conexión</li>
          <li>4. Comprueba si hay errores de red o autenticación</li>
        </ol>
      </div>
    </div>
  );
}
