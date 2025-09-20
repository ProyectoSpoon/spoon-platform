'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@spoon/shared/lib/supabase';

export default function TestConnectionPage() {
  const [countries, setCountries] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        setLoading(true);
        console.log('🔍 Probando conexión a Supabase...');

        // Test 1: Cargar países
        console.log('1️⃣ Cargando países...');
        const { data: countriesData, error: countriesError } = await supabase
          .from('countries')
          .select('*')
          .order('name');

        if (countriesError) {
          console.error('❌ Error países:', countriesError);
          throw countriesError;
        }

        console.log('✅ Países:', countriesData?.length, countriesData);
        setCountries(countriesData || []);

        // Test 2: Cargar departamentos de Colombia
        if (countriesData && countriesData.length > 0) {
          const colombia = countriesData.find(c => c.code === 'COL' || c.code === 'CO');
          if (colombia) {
            console.log('2️⃣ Cargando departamentos de Colombia:', colombia.id);
            const { data: depsData, error: depsError } = await supabase
              .from('departments')
              .select('*')
              .eq('country_id', colombia.id)
              .order('name');

            if (depsError) {
              console.error('❌ Error departamentos:', depsError);
              throw depsError;
            }

            console.log('✅ Departamentos:', depsData?.length, depsData?.slice(0, 3));
            setDepartments(depsData || []);

            // Test 3: Cargar ciudades de Antioquia (primer departamento)
            if (depsData && depsData.length > 0) {
              const antioquia = depsData.find(d => d.name.toLowerCase().includes('antioquia')) || depsData[0];
              console.log('3️⃣ Cargando ciudades de:', antioquia.name, antioquia.id);
              
              const { data: citiesData, error: citiesError } = await supabase
                .from('cities')
                .select('*')
                .eq('department_id', antioquia.id)
                .order('name')
                .limit(10);

              if (citiesError) {
                console.error('❌ Error ciudades:', citiesError);
                throw citiesError;
              }

              console.log('✅ Ciudades (primeras 10):', citiesData?.length, citiesData);
              setCities(citiesData || []);
            }
          }
        }

      } catch (err: any) {
        console.error('💥 Error general:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--sp-neutral-50)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--sp-primary-600)] mx-auto mb-4"></div>
          <p className="text-[color:var(--sp-neutral-600)]">Probando conexión con la base de datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--sp-neutral-50)] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[color:var(--sp-surface)] rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-[color:var(--sp-neutral-900)] mb-6">
            🔍 Test de Conexión - Base de Datos Geográfica
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-[color:var(--sp-error-50)] border border-[color:var(--sp-error-200)] rounded-lg">
              <p className="text-[color:var(--sp-error-700)]">❌ <strong>Error:</strong> {error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Países */}
            <div className="bg-[color:var(--sp-info-50)] border border-[color:var(--sp-info-200)] rounded-lg p-4">
              <h2 className="font-semibold text-[color:var(--sp-info-800)] mb-3">🌍 Países ({countries.length})</h2>
              {countries.length > 0 ? (
                <ul className="text-sm text-[color:var(--sp-info-700)] space-y-1">
                  {countries.map(country => (
                    <li key={country.id} className="flex justify-between">
                      <span>{country.name}</span>
                      <span className="text-[color:var(--sp-info-500)]">({country.code})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[color:var(--sp-info-600)] text-sm">No se encontraron países</p>
              )}
            </div>

            {/* Departamentos */}
            <div className="bg-[color:var(--sp-success-50)] border border-[color:var(--sp-success-200)] rounded-lg p-4">
              <h2 className="font-semibold text-[color:var(--sp-success-800)] mb-3">🏛️ Departamentos ({departments.length})</h2>
              {departments.length > 0 ? (
                <ul className="text-sm text-[color:var(--sp-success-700)] space-y-1 max-h-64 overflow-y-auto">
                  {departments.slice(0, 10).map(dept => (
                    <li key={dept.id} className="flex justify-between">
                      <span>{dept.name}</span>
                      <span className="text-[color:var(--sp-success-500)]">({dept.code})</span>
                    </li>
                  ))}
                  {departments.length > 10 && (
                    <li className="text-[color:var(--sp-success-600)] italic">+ {departments.length - 10} más...</li>
                  )}
                </ul>
              ) : (
                <p className="text-[color:var(--sp-success-600)] text-sm">No se encontraron departamentos</p>
              )}
            </div>

            {/* Ciudades */}
            <div className="bg-[color:var(--sp-primary-50)] border border-[color:var(--sp-primary-200)] rounded-lg p-4">
              <h2 className="font-semibold text-[color:var(--sp-primary-800)] mb-3">🏙️ Ciudades ({cities.length})</h2>
              {cities.length > 0 ? (
                <ul className="text-sm text-[color:var(--sp-primary-700)] space-y-1 max-h-64 overflow-y-auto">
                  {cities.map(city => (
                    <li key={city.id} className="flex justify-between">
                      <span>{city.name}</span>
                      {city.is_capital && <span className="text-[color:var(--sp-primary-500)]">⭐</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[color:var(--sp-primary-600)] text-sm">No se encontraron ciudades</p>
              )}
            </div>
          </div>

          {/* Resumen */}
          <div className="mt-6 p-4 bg-[color:var(--sp-neutral-100)] rounded-lg">
            <h3 className="font-semibold text-[color:var(--sp-neutral-800)] mb-2">📊 Resumen de Conexión:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-[color:var(--sp-info-600)]">{countries.length}</div>
                <div className="text-[color:var(--sp-neutral-600)]">Países</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[color:var(--sp-success-600)]">{departments.length}</div>
                <div className="text-[color:var(--sp-neutral-600)]">Departamentos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[color:var(--sp-primary-600)]">{cities.length}</div>
                <div className="text-[color:var(--sp-neutral-600)]">Ciudades (muestra)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[color:var(--sp-warning-600)]">
                  {error ? '❌' : '✅'}
                </div>
                <div className="text-[color:var(--sp-neutral-600)]">Estado</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
