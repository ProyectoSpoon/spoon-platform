'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon for restaurants
const createRestaurantIcon = () => {
  if (typeof window === 'undefined') return null; // SSR guard
  
  return new L.Icon({
    iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="14" fill="#DC2626" stroke="#FFFFFF" stroke-width="3"/>
        <circle cx="16" cy="16" r="4" fill="#FFFFFF"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  cityName?: string;
  cityLat?: number;
  cityLng?: number;
  strictCitySearch?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
  onAddressChange?: (address: string) => void;
  className?: string;
  height?: string;
  searchable?: boolean;
}

// Component to handle map clicks and updates
function MapEventHandler({ onLocationChange, onAddressChange }: { 
  onLocationChange?: (lat: number, lng: number) => void;
  onAddressChange?: (address: string) => void;
}) {
  useMapEvents({
    click: async (event) => {
      if (onLocationChange) {
        const { lat, lng } = event.latlng;
        onLocationChange(lat, lng);
        
        // Enhanced reverse geocoding with Colombian address formatting
        if (onAddressChange) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            
            if (data && data.address) {
              const address = data.address;
              let formattedAddress = '';
              
              console.log('🗺️ Raw reverse geocoding data:', address);
              
              // Construir dirección en formato colombiano estándar
              if (address.house_number && address.road) {
                let roadName = address.road;
                let houseNumber = address.house_number;
                
                // Normalizar el nombre de la vía
                roadName = roadName
                  .replace(/\bcra\b/gi, 'Carrera')
                  .replace(/\bcr\b/gi, 'Carrera')
                  .replace(/\bkr\b/gi, 'Carrera')
                  .replace(/\bk\b(?=\s*\d)/gi, 'Carrera')
                  .replace(/\bcll\b/gi, 'Calle')
                  .replace(/\bcl\b/gi, 'Calle')
                  .replace(/\bav\b/gi, 'Avenida')
                  .replace(/\btv\b/gi, 'Transversal')
                  .replace(/\bdiag\b/gi, 'Diagonal');
                
                // Formato estándar colombiano: "Tipo Vía Número # Casa"
                if (roadName.toLowerCase().includes('carrera') || 
                    roadName.toLowerCase().includes('calle') || 
                    roadName.toLowerCase().includes('avenida') ||
                    roadName.toLowerCase().includes('diagonal') ||
                    roadName.toLowerCase().includes('transversal')) {
                  formattedAddress = `${roadName} # ${houseNumber}`;
                } else {
                  // Si no tiene tipo de vía, agregar "Calle" como fallback
                  formattedAddress = `Calle ${roadName} # ${houseNumber}`;
                }
              } else if (address.road) {
                // Solo tenemos la vía, sin número de casa
                let roadName = address.road;
                
                // Normalizar el nombre de la vía
                roadName = roadName
                  .replace(/\bcra\b/gi, 'Carrera')
                  .replace(/\bcr\b/gi, 'Carrera')
                  .replace(/\bkr\b/gi, 'Carrera')
                  .replace(/\bk\b(?=\s*\d)/gi, 'Carrera')
                  .replace(/\bcll\b/gi, 'Calle')
                  .replace(/\bcl\b/gi, 'Calle')
                  .replace(/\bav\b/gi, 'Avenida')
                  .replace(/\btv\b/gi, 'Transversal')
                  .replace(/\bdiag\b/gi, 'Diagonal');
                
                // Agregar tipo de vía si no lo tiene
                if (!roadName.toLowerCase().includes('calle') && 
                    !roadName.toLowerCase().includes('carrera') && 
                    !roadName.toLowerCase().includes('avenida') &&
                    !roadName.toLowerCase().includes('diagonal') &&
                    !roadName.toLowerCase().includes('transversal')) {
                  roadName = `Calle ${roadName}`;
                }
                formattedAddress = roadName;
              } else if (address.suburb || address.neighbourhood) {
                // Fallback a barrio/sector
                formattedAddress = address.suburb || address.neighbourhood;
              } else if (address.city_district) {
                // Fallback a localidad
                formattedAddress = address.city_district;
              } else {
                // Último fallback: primera parte del display name
                formattedAddress = data.display_name.split(',')[0];
              }
              
              console.log('🗺️ Reverse geocoding result:', {
                coordinates: [lat, lng],
                formattedAddress,
                rawAddress: address,
                displayName: data.display_name
              });
              
              onAddressChange(formattedAddress);
            }
          } catch (error) {
            console.error('Error getting address from coordinates:', error);
          }
        }
      }
    },
  });
  return null;
}

// Component to update map view when coordinates change
function MapUpdater({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom());
  }, [latitude, longitude, map]);
  
  return null;
}

export function InteractiveMap({
  latitude,
  longitude,
  address,
  cityName,
  cityLat,
  cityLng,
  strictCitySearch = true,
  onLocationChange,
  onAddressChange,
  className = '',
  height = 'h-80',
  searchable = false
}: InteractiveMapProps) {
  const [searchQuery, setSearchQuery] = useState(address || '');
  const [isSearching, setIsSearching] = useState(false);
  const [restaurantIcon, setRestaurantIcon] = useState<L.Icon | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const displayAddress = address && cityName ? `${address}, ${cityName}` : address || "Tu restaurante";

  // Sync search query with address prop
  useEffect(() => {
    if (address !== searchQuery) {
      setSearchQuery(address || '');
    }
  }, [address]);

  // Initialize restaurant icon on client side
  useEffect(() => {
    const icon = createRestaurantIcon();
    setRestaurantIcon(icon);
  }, []);

  // Enhanced geocoding function with better address handling
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Mejorar la dirección para búsqueda colombiana
      let normalizedQuery = searchQuery.trim();
      
      // Normalizar términos comunes en direcciones colombianas
      normalizedQuery = normalizedQuery
        // Carreras
        .replace(/\bcra\b/gi, 'carrera')
        .replace(/\bcr\b/gi, 'carrera')
        .replace(/\bkr\b/gi, 'carrera')
        .replace(/\bk\b(?=\s*\d)/gi, 'carrera') // K seguido de número
        
        // Calles
        .replace(/\bcll\b/gi, 'calle')
        .replace(/\bcl\b/gi, 'calle')
        
        // Avenidas
        .replace(/\bav\b/gi, 'avenida')
        .replace(/\bave\b/gi, 'avenida')
        
        // Otras vías
        .replace(/\btv\b/gi, 'transversal')
        .replace(/\bdiag\b/gi, 'diagonal')
        .replace(/\bac\b/gi, 'autopista')
        
        // Números y símbolos
        .replace(/\bno\.\s*/gi, '#')
        .replace(/\bnro\.\s*/gi, '#')
        .replace(/\bnúmero\s*/gi, '#')
        .replace(/\bnum\.\s*/gi, '#')
        
        // Limpiar espacios múltiples
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log('🔍 Original query:', searchQuery);
      console.log('🔍 Normalized query:', normalizedQuery);
      console.log('🏙️ Selected city:', cityName);
      
      // Extraer la vía principal para búsqueda de fallback
      const mainRoadMatch = normalizedQuery.match(/^(carrera|calle|avenida|diagonal|transversal)\s+\d+[a-z]?/i);
      const mainRoad = mainRoadMatch ? mainRoadMatch[0] : null;
      
      console.log('🔍 Main road extracted:', mainRoad);
      
      // No forzar Bogotá si no hay ciudad; usar ciudad si viene, de lo contrario búsquedas generales en Colombia
      const searchCity = (cityName && cityName.trim()) ? cityName.trim() : '';

      const searchVariations: string[] = [];
      if (searchCity) {
        // Dirección completa con ciudad
        searchVariations.push(
          `${normalizedQuery}, ${searchCity}, Colombia`,
          `${normalizedQuery}, ${searchCity}`
        );
        if (mainRoad) {
          searchVariations.push(
            `${mainRoad}, ${searchCity}, Colombia`,
            `${mainRoad}, ${searchCity}`
          );
        }
        searchVariations.push(
          `${searchQuery}, ${searchCity}, Colombia`,
          `${searchQuery}, ${searchCity}`
        );
      }
      // Siempre incluir variaciones nacionales y crudas
      searchVariations.push(
        `${normalizedQuery}, Colombia`,
        normalizedQuery,
        searchQuery
      );
      
      let bestResult = null;
      let usedVariation = '';
      let fallbackToMainRoad = false;
      
      const normalize = (s: any) => (s || '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

      const targetCityNorm = normalize(searchCity);
      const targetBaseCoords = (cityLat && cityLng) ? { lat: cityLat, lng: cityLng } : null;
      const distanceKm = (aLat: number, aLng: number, bLat: number, bLng: number) => {
        const R = 6371;
        const dLat = (bLat - aLat) * Math.PI / 180;
        const dLng = (bLng - aLng) * Math.PI / 180;
        const A = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(aLat*Math.PI/180) * Math.cos(bLat*Math.PI/180) * Math.sin(dLng/2) * Math.sin(dLng/2);
        return 2 * R * Math.asin(Math.sqrt(A));
      };

      const MAX_DISTANCE_KM = 80; // Límite para aceptar resultado alrededor de la ciudad seleccionada

      let fallbackAnyResult: any = null; // sólo se usará si strictCitySearch = false
      for (const variation of searchVariations) {
        try {
          console.log(`🔍 Trying variation: "${variation}"`);
          // Si tenemos cityLat/cityLng y strictCitySearch, construimos un bounding box (~25km radio aprox)
          let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(variation)}&limit=10&addressdetails=1&countrycodes=co&extratags=1`;
          if (cityLat && cityLng && strictCitySearch) {
            const deltaLat = 0.22; // ~24km
            const deltaLng = 0.22; // aproximado (varía con lat)
            const left = cityLng - deltaLng;
            const right = cityLng + deltaLng;
            const top = cityLat + deltaLat;
            const bottom = cityLat - deltaLat;
            url += `&viewbox=${left},${top},${right},${bottom}&bounded=1`;
          }
          const response = await fetch(url);
          const data = await response.json();
          
          if (data && data.length > 0) {
            // Guardar cualquier resultado por si necesitamos fallback global al final
            if (!fallbackAnyResult && !strictCitySearch) fallbackAnyResult = data[0];

            // Determinar si estamos usando el fallback de vía principal
            if (mainRoad && variation.includes(mainRoad) && !variation.includes('#')) {
              fallbackToMainRoad = true;
            }
            
            // Clasificar resultados
            const classified = data.map((r: any) => {
              const adr = r.address || {};
              const candidateCity = normalize(adr.city || adr.town || adr.village || adr.municipality || adr.state);
              const hasExactCity = targetCityNorm && candidateCity && candidateCity === targetCityNorm;
              let withinDistance = false;
              if (targetBaseCoords) {
                const d = distanceKm(parseFloat(r.lat), parseFloat(r.lon), targetBaseCoords.lat, targetBaseCoords.lng);
                withinDistance = d <= MAX_DISTANCE_KM;
              }
              return { r, hasExactCity, withinDistance, adr };
            });

            // Prioridad: exact city + dirección específica
            bestResult = classified.find((c: any) => c.hasExactCity && c.r.address?.house_number && c.r.address?.road)?.r
              // Luego exact city + cualquier road
              || classified.find((c: any) => c.hasExactCity && c.r.address?.road)?.r
              // Luego distancia aceptable + específica
              || classified.find((c: any) => c.withinDistance && c.r.address?.house_number && c.r.address?.road)?.r
              // Luego distancia aceptable + road
              || classified.find((c: any) => c.withinDistance && c.r.address?.road)?.r;

            // Si todavía nada y tenemos ciudad objetivo, NO aceptar resultado fuera de ciudad/distancia; probar siguiente variación
            if (!bestResult && targetCityNorm) {
              console.log('⚠️ Variación sin coincidencias dentro de ciudad/distancia, probando siguiente.');
              continue; // probar siguiente variación
            }

            // Si no hay ciudad objetivo, aceptar heurística original
            if (!bestResult) {
              bestResult = data.find((r: any) => r.address?.house_number && r.address?.road) || data.find((r: any) => r.address?.road) || data[0];
            }

            if (bestResult) {
              usedVariation = variation;
              console.log(`✅ Found result with variation: "${variation}"`);
              console.log('📍 Result details:', {
                class: bestResult.class,
                type: bestResult.type,
                address: bestResult.address,
                importance: bestResult.importance,
                fallbackUsed: fallbackToMainRoad
              });
              break;
            }
          }
        } catch (error) {
          console.warn(`❌ Error with variation "${variation}":`, error);
          continue;
        }
      }
      
      // Si tras todas las variaciones no hay resultado aceptable pero tenemos fallback, usarlo (último recurso)
      if (!bestResult && fallbackAnyResult && !strictCitySearch) {
        console.log('🛟 Usando fallback global (strictCitySearch = false)');
        bestResult = fallbackAnyResult;
      }

      if (bestResult) {
        const { lat, lon } = bestResult;
        const coordinates: [number, number] = [parseFloat(lat), parseFloat(lon)];
        
        console.log('🎯 Final geocoding result:', {
          originalQuery: searchQuery,
          normalizedQuery,
          usedVariation,
          selectedCity: searchCity || '(sin ciudad específica)',
          coordinates,
          address: bestResult.address,
          displayName: bestResult.display_name,
          fallbackToMainRoad
        });
        
        if (onLocationChange) {
          onLocationChange(coordinates[0], coordinates[1]);
        }
        
        // Si usamos fallback a vía principal, sugerir la dirección más específica encontrada
        if (onAddressChange) {
          if (fallbackToMainRoad && bestResult.address?.road) {
            // Sugerir la vía principal encontrada en lugar de la dirección original
            const suggestedAddress = bestResult.address.road;
            onAddressChange(suggestedAddress);
            console.log('💡 Suggested more general address:', suggestedAddress);
          } else {
            // Usar la dirección original del usuario
            onAddressChange(searchQuery);
          }
        }
      } else {
        console.warn('❌ Sin resultados aceptables. No se mueve el marcador.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`relative ${height} w-full rounded-xl overflow-hidden border border-[color:var(--sp-border)] ${className}`}>
      {/* Search bar (if enabled) */}
      {searchable && (
        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-[color:var(--sp-on-surface-variant)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ingresa la dirección"
              className="w-full pl-10 pr-20 py-3 bg-[color:var(--sp-surface)] border border-[color:var(--sp-border)] rounded-lg shadow-lg text-[color:var(--sp-on-surface)] placeholder-[color:var(--sp-on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[color:var(--sp-primary-500)]"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-[color:var(--sp-primary-500)] text-[color:var(--sp-on-primary)] rounded-md hover:bg-[color:var(--sp-primary-600)] disabled:opacity-50 transition-colors text-sm font-medium"
            >
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>
      )}

      {/* Map container */}
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Restaurant marker */}
        <Marker 
          position={[latitude, longitude]} 
          icon={restaurantIcon || undefined}
        >
          <Popup>
            <div className="text-center">
              <div className="font-semibold text-[color:var(--sp-on-surface)] text-sm">
                🍽️ {displayAddress}
              </div>
              <div className="text-xs text-[color:var(--sp-on-surface-variant)] mt-1">
                📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Event handlers */}
        <MapEventHandler onLocationChange={onLocationChange} onAddressChange={onAddressChange} />
        <MapUpdater latitude={latitude} longitude={longitude} />
      </MapContainer>

      {/* Custom zoom controls */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-1">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="w-10 h-10 bg-[color:var(--sp-surface)] hover:bg-[color:var(--sp-surface-variant)] border border-[color:var(--sp-border)] rounded-lg shadow-lg flex items-center justify-center text-[color:var(--sp-on-surface)] text-xl font-bold transition-colors"
        >
          +
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="w-10 h-10 bg-[color:var(--sp-surface)] hover:bg-[color:var(--sp-surface-variant)] border border-[color:var(--sp-border)] rounded-lg shadow-lg flex items-center justify-center text-[color:var(--sp-on-surface)] text-xl font-bold transition-colors"
        >
          −
        </button>
      </div>

      {/* Map attribution/branding */}
      <div className="absolute bottom-2 left-2 z-[1000] text-xs text-[color:var(--sp-on-surface-variant)] bg-[color:var(--sp-surface)] px-2 py-1 rounded border border-[color:var(--sp-border)] backdrop-blur-sm">
        📍 Spoon Maps
      </div>
    </div>
  );
}
