'use client';

import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import { SpinnerV2 } from '@spoon/shared';

// Import Leaflet CSS only when needed
const loadLeafletCSS = () => {
  if (typeof window !== 'undefined' && !document.querySelector('link[href*="leaflet"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);
  }
};

// Dynamically import the InteractiveMap to avoid SSR issues
const InteractiveMapComponent = dynamic(
  () => import('./InteractiveMap').then((mod) => ({ default: mod.InteractiveMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full bg-[color:var(--sp-surface-variant)] rounded-xl border border-[color:var(--sp-border)] flex items-center justify-center">
        <div className="text-center">
          <SpinnerV2 size="lg" className="mb-2" />
          <p className="text-sm text-[color:var(--sp-on-surface-variant)]">Cargando mapa...</p>
        </div>
      </div>
    ),
  }
);

interface DynamicMapProps {
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

export function DynamicMap(props: DynamicMapProps) {
  useEffect(() => {
    loadLeafletCSS();
  }, []);

  return <InteractiveMapComponent {...props} />;
}
