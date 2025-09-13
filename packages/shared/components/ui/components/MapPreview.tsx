'use client';

import React from 'react';

interface MapPreviewProps {
  latitude: number;
  longitude: number;
  address?: string;
  cityName?: string;
  className?: string;
  height?: string;
}

export function MapPreview({
  latitude,
  longitude,
  address,
  cityName,
  className = '',
  height = 'h-64'
}: MapPreviewProps) {
  const displayAddress = address && cityName ? `${address}, ${cityName}` : address || "Tu restaurante aquí";
  
  return (
    <div className={`${height} w-full bg-gradient-to-br from-[color:var(--sp-info-100)] to-[color:var(--sp-success-100)] rounded-xl shadow-inner relative overflow-hidden ${className}`}>
      {/* Elementos decorativos del fondo para simular un mapa */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-[color:var(--sp-info-500)] rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-[color:var(--sp-success-500)] rounded-full"></div>
        <div className="absolute bottom-20 left-24 w-12 h-12 bg-[color:var(--sp-primary-600)] rounded-full"></div>
        <div className="absolute bottom-32 right-32 w-14 h-14 bg-[color:var(--sp-neutral-500)] rounded-full"></div>
        <div className="absolute top-20 right-10 w-8 h-8 bg-[color:var(--sp-warning-500)] rounded-full"></div>
        <div className="absolute bottom-10 left-10 w-10 h-10 bg-[color:var(--sp-error-300)] rounded-full"></div>
      </div>

      {/* Líneas decorativas para simular calles */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/3 w-full h-0.5 bg-[color:var(--sp-neutral-700)] transform rotate-12"></div>
        <div className="absolute left-1/4 h-full w-0.5 bg-[color:var(--sp-neutral-700)] transform rotate-6"></div>
        <div className="absolute bottom-1/4 w-full h-0.5 bg-[color:var(--sp-neutral-700)] transform -rotate-6"></div>
        <div className="absolute right-1/3 h-full w-0.5 bg-[color:var(--sp-neutral-700)] transform -rotate-12"></div>
      </div>
      
      {/* Marcador principal del restaurante */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Pin animado */}
          <div className="w-12 h-12 bg-[color:var(--sp-error-500)] rounded-full flex items-center justify-center shadow-2xl animate-bounce border-2 border-[color:var(--sp-surface)]">
            <svg className="w-6 h-6 text-[color:var(--sp-on-error)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
          
          {/* Información del restaurante */}
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-[color:var(--sp-surface)] px-3 py-2 rounded-lg shadow-lg border border-[color:var(--sp-border)] whitespace-nowrap max-w-64 z-10">
            <div className="text-xs font-semibold text-[color:var(--sp-on-surface)] truncate">
              🍽️ {displayAddress}
            </div>
            <div className="text-xs text-[color:var(--sp-on-surface-variant)] mt-0.5">
              📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </div>
          </div>
          
          {/* Flecha del globo */}
          <div className="absolute top-14 left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[color:var(--sp-border)]"></div>
          </div>
        </div>
      </div>

      {/* Indicadores de zoom simulados */}
      <div className="absolute top-4 right-4 flex flex-col gap-1">
        <button className="w-8 h-8 bg-[color:var(--sp-surface)] hover:bg-[color:var(--sp-surface-variant)] border border-[color:var(--sp-border)] rounded flex items-center justify-center text-[color:var(--sp-on-surface)] text-lg font-bold transition-colors">
          +
        </button>
        <button className="w-8 h-8 bg-[color:var(--sp-surface)] hover:bg-[color:var(--sp-surface-variant)] border border-[color:var(--sp-border)] rounded flex items-center justify-center text-[color:var(--sp-on-surface)] text-lg font-bold transition-colors">
          −
        </button>
      </div>
      
      {/* Branding del mapa */}
      <div className="absolute bottom-2 left-2 text-xs text-[color:var(--sp-on-surface-variant)] bg-[color:var(--sp-surface)] px-2 py-1 rounded border border-[color:var(--sp-border)] backdrop-blur-sm">
        📍 Spoon Maps
      </div>

      {/* Indicador de coordenadas precisas */}
      <div className="absolute bottom-2 right-2 text-xs text-[color:var(--sp-on-surface-variant)] bg-[color:var(--sp-surface)] px-2 py-1 rounded border border-[color:var(--sp-border)] backdrop-blur-sm">
        🎯 GPS activo
      </div>
    </div>
  );
}
